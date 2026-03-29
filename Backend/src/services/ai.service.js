import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { searchInternet } from "./tavily.service.js";

const FALLBACK_RESPONSE = "I could not generate a response right now. Please try again.";
const MODEL_TEMPERATURE = 0.2;

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[model:gemini] GEMINI_API_KEY not configured, skipping");
    return null;
  }

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: MODEL_TEMPERATURE,
    maxRetries: 0,
  });
}

function getMistralModel() {
  if (!process.env.MISTRAL_API_KEY) {
    console.warn("[model:mistral] MISTRAL_API_KEY not configured, skipping");
    return null;
  }

  return new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: MODEL_TEMPERATURE,
    maxRetries: 0,
  });
}

function getOpenRouterModel() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("[model:openrouter] OPENROUTER_API_KEY not configured, skipping");
    return null;
  }

  return new ChatOpenAI({
    model: process.env.OPENROUTER_MODEL || "openrouter/auto",
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature: MODEL_TEMPERATURE,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
    maxRetries: 0,
  });
}

function toLangChainMessage(msg) {
  const role = msg?.role;
  const content = msg?.content ?? "";

  if (role === "user") {
    return new HumanMessage(content);
  }

  if (role === "assistant" || role === "ai") {
    return new AIMessage(content);
  }

  return new SystemMessage(content);
}

function extractResponseText(response) {
  if (!response) return "";

  if (typeof response?.text === "function") {
    const textValue = response.text();
    if (typeof textValue === "string" && textValue.trim()) {
      return textValue;
    }
  }

  if (typeof response?.content === "string" && response.content.trim()) {
    return response.content;
  }

  if (Array.isArray(response?.content)) {
    const joined = response.content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("\n")
      .trim();

    if (joined) {
      return joined;
    }
  }

  if (typeof response?.output === "string" && response.output.trim()) {
    return response.output;
  }

  if (typeof response?.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  return "";
}

function getLatestUserQuery(messages) {
  if (!Array.isArray(messages)) return "";

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "user" && typeof message?.content === "string") {
      const query = message.content.trim();
      if (query) {
        return query;
      }
    }
  }

  return "";
}

function needsWebSearch(query) {
  if (!query) return false;

  const q = query.toLowerCase();

  const isTimeSensitive =
    /latest|news|today|current|recent/.test(q) ||
    /last\s*\d+\s*(hour|hours|day|days)/.test(q) ||
    /what happened|right now|breaking/.test(q);

  const isFactualLookup =
    /tell me about|what is|who is|info about|details about/.test(q);

  const isStatic =
    /^[\d+\-*/().\s]+$/.test(q) ||
    /react|javascript|code|function|api/.test(q);

  const isShortQuery = q.trim().split(/\s+/).length <= 2;

  if (isStatic) return false;

  return isTimeSensitive || (isFactualLookup && !isShortQuery);
}

async function buildMessagesWithOptionalWebContext(messages) {
  const baseMessages = Array.isArray(messages)
    ? messages.map((message) => ({
        role: message?.role,
        content: message?.content ?? "",
      }))
    : [];

  const query = getLatestUserQuery(baseMessages);
  const shouldSearch = needsWebSearch(query);

  console.log("=== WEB TRIGGER ===");
  console.log("Query:", query);
  console.log("shouldSearch:", shouldSearch);
  console.log("Web decision:", shouldSearch, "| Query:", query);

  let web = null;
  let webSystemMessage = null;

  if (shouldSearch) {
    console.log("[generateResponse] Web search triggered", { query });
    try {
      const tavilyResponse = await searchInternet({
        query: query,
        max_results: 5,
      });

      if (tavilyResponse?.results && tavilyResponse.results.length > 0) {
        web = tavilyResponse.results
          .slice(0, 5)
          .map((r) => `• ${r?.title || "Untitled"}\n${r?.content || ""}`)
          .join("\n\n");
      }

      console.log("Web data exists:", !!web);
      console.log("Web length:", web?.length || 0);

      if (web && web.trim()) {
        webSystemMessage = {
          role: "system",
          content: `
You are a real-time assistant.

IMPORTANT:
- You MUST use the provided WEB RESULTS to answer
- Do NOT rely on your internal knowledge if WEB RESULTS are present
- Do NOT hallucinate or guess
- If WEB RESULTS are empty, say you don't have recent info

Format your response for readability:
- Use short paragraphs (max 2 lines)
- Use bullet points instead of long text
- Add spacing between sections
- Use clear section headings using "###"
- Avoid large dense blocks of text
- Keep sentences concise

Use this structure:
### Section Title
- Point 1
- Point 2
- Point 3

### Another Section
- Point 1
- Point 2

Avoid:
- Long paragraphs
- Repetitive text
- Over-explanation
- Unstructured dumps

Answer ONLY using the information below.

[WEB RESULTS]
${web}
`,
        };

        const conversationMessages = baseMessages.filter((m) => m.role !== "system");
        const withWebMessages = [
          webSystemMessage,
          ...conversationMessages,
        ];

        baseMessages.length = 0;
        baseMessages.push(...withWebMessages);
      }

      console.log("=== FINAL MESSAGES ===");
      console.log(
        baseMessages.map((m, i) => ({
          index: i,
          role: m.role,
          preview: m.content?.slice(0, 100),
        })),
      );
      console.log("Has system message:", baseMessages.some((m) => m.role === "system"));
      console.log("System at index 0:", baseMessages[0]?.role === "system");
      console.log(
        "Index 0 has [Web Results]:",
        typeof baseMessages[0]?.content === "string" && baseMessages[0].content.includes("[Web Results]"),
      );
    } catch (error) {
      console.error("[generateResponse] Web search failed, continuing without web context", {
        message: error?.message,
        stack: error?.stack,
      });
    }
  } else {
    console.log("[generateResponse] Web search skipped", { query });
    console.log("Web data exists:", false);
    console.log("Web length:", 0);
    console.log("=== FINAL MESSAGES ===");
    console.log(
      baseMessages.map((m, i) => ({
        index: i,
        role: m.role,
        preview: m.content?.slice(0, 100),
      })),
    );
    console.log("Has system message:", baseMessages.some((m) => m.role === "system"));
    console.log("System at index 0:", baseMessages[0]?.role === "system");
    console.log(
      "Index 0 has [Web Results]:",
      typeof baseMessages[0]?.content === "string" && baseMessages[0].content.includes("[Web Results]"),
    );
  }

  return {
    normalizedMessages: baseMessages.map((message) => toLangChainMessage(message)),
    web,
    query,
    webSystemMessage,
  };
}

function shouldRetryWithWebConstraint(responseText, web) {
  if (!web || typeof responseText !== "string") {
    return false;
  }

  const lower = responseText.toLowerCase();
  return (
    lower.includes("cannot provide") ||
    lower.includes("as of") ||
    lower.includes("i don't have real-time") ||
    lower.includes("2024") ||
    lower.includes("2025")
  );
}

async function tryModel(model, messages, label) {
  if (!model) {
    return null;
  }

  const start = Date.now();

  try {
    console.log("=== INVOKING MODEL ===");
    console.log("Message count:", messages.length);
    console.log("First message role:", messages[0]?.role);
    console.log(`[tryModel:${label}] Invoking model`, {
      messageCount: messages.length,
    });

    const response = await model.invoke(messages);
    console.log(`[tryModel:${label}] Raw response`, JSON.stringify(response, null, 2));

    const extracted = extractResponseText(response);
    if (extracted) {
      console.log(`[tryModel:${label}] Success`, {
        durationMs: Date.now() - start,
        responseLength: extracted.length,
      });
      return extracted;
    }

    console.warn(`[tryModel:${label}] Empty response`, {
      durationMs: Date.now() - start,
    });
    return null;
  } catch (error) {
    console.error(`[tryModel:${label}] Failed`, {
      durationMs: Date.now() - start,
      message: error?.message,
      stack: error?.stack,
    });
    return null;
  }
}

export async function generateResponse(messages) {
  const { normalizedMessages, web, query, webSystemMessage } = await buildMessagesWithOptionalWebContext(messages);

  const modelChain = [
    { label: "gemini", model: getGeminiModel() },
    { label: "mistral", model: getMistralModel() },
    { label: "openrouter", model: getOpenRouterModel() },
  ];

  for (const entry of modelChain) {
    const answer = await tryModel(entry.model, normalizedMessages, entry.label);
    if (answer) {
      if (shouldRetryWithWebConstraint(answer, web) && query && webSystemMessage) {
        const retryMessages = [
          {
            role: "system",
            content: "Answer ONLY using WEB RESULTS. Do NOT use prior knowledge. Format with ### headings, short bullet points, clear spacing, and concise sentences. Avoid long paragraphs and unstructured text.",
          },
          webSystemMessage,
          { role: "user", content: query },
        ].map((message) => toLangChainMessage(message));

        const retryAnswer = await tryModel(entry.model, retryMessages, `${entry.label}:web-retry`);
        if (retryAnswer) {
          return retryAnswer;
        }
      }

      return answer;
    }
  }

  return FALLBACK_RESPONSE;
}

export async function generateChatTitle(message) {
  try {
    const titleModel = getMistralModel() || getGeminiModel() || getOpenRouterModel();

    if (!titleModel) {
      return "New Chat";
    }

    const response = await titleModel.invoke([
      new SystemMessage(
        `You are a helpful assistant that generates concise and descriptive titles for chat conversations. User will provide a message from the chat, and you will generate a title that captures the essence of the conversation in 2-3 words. The title should be clear, relevant, and engaging giving users a quick understanding of the chat's content.`,
      ),

      new HumanMessage(
        `Generate a title for the following chat message: "${message}"`,
      ),
    ]);

    const title = extractResponseText(response);
    return title || "New Chat";
  } catch (error) {
    console.error("[generateChatTitle] Error", {
      message: error?.message,
      stack: error?.stack,
    });
    return "New Chat";
  }
}
