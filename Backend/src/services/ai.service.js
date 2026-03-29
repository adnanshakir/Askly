import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { searchInternet } from "./tavily.service.js";

const FALLBACK_RESPONSE = "I could not generate a response right now. Please try again.";
const WEB_SEARCH_KEYWORDS = /\b(latest|news|today|current|recent)\b/i;

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[model:gemini] GEMINI_API_KEY not configured, skipping");
    return null;
  }

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
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
  return WEB_SEARCH_KEYWORDS.test(query);
}

async function buildMessagesWithOptionalWebContext(messages) {
  const baseMessages = Array.isArray(messages)
    ? messages.map((message) => ({
        role: message?.role,
        content: message?.content ?? "",
      }))
    : [];

  const query = getLatestUserQuery(baseMessages);

  if (needsWebSearch(query)) {
    console.log("[generateResponse] Web search triggered", { query });
    try {
      const webResults = await searchInternet({ query });
      if (typeof webResults === "string" && webResults.trim()) {
        baseMessages.unshift({
          role: "system",
          content: `[Web Results]\n${webResults}`,
        });
      }
    } catch (error) {
      console.error("[generateResponse] Web search failed, continuing without web context", {
        message: error?.message,
        stack: error?.stack,
      });
    }
  } else {
    console.log("[generateResponse] Web search skipped", { query });
  }

  return baseMessages.map((message) => toLangChainMessage(message));
}

async function tryModel(model, messages, label) {
  if (!model) {
    return null;
  }

  const start = Date.now();

  try {
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
  const normalizedMessages = await buildMessagesWithOptionalWebContext(messages);

  const modelChain = [
    { label: "gemini", model: getGeminiModel() },
    { label: "mistral", model: getMistralModel() },
    { label: "openrouter", model: getOpenRouterModel() },
  ];

  for (const entry of modelChain) {
    const answer = await tryModel(entry.model, normalizedMessages, entry.label);
    if (answer) {
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
