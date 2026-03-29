import { tavily as Tavily } from "@tavily/core";

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  return Tavily({ apiKey });
}

export const searchInternet = async ({ query }) => {
  try {
    const cleanQuery = query?.trim();

    if (!cleanQuery) {
      console.warn("[searchInternet] Missing query");
      return "No search query provided.";
    }

    console.log("[searchInternet] Invoked", { query: cleanQuery });

    const tavily = getTavilyClient();
    const response = await tavily.search({
      query: cleanQuery,
      max_results: 5,
      search_depth: "advanced",
    });

    console.log("[searchInternet] Raw Tavily response", {
      hasResults: Array.isArray(response?.results),
      resultCount: Array.isArray(response?.results) ? response.results.length : 0,
      keys: response ? Object.keys(response) : [],
    });

    const resultText = Array.isArray(response?.results)
      ? response.results
          .map((result, index) => {
            const title = result?.title || `Result ${index + 1}`;
            const content = result?.content || "No content available.";
            const url = result?.url ? `\nSource: ${result.url}` : "";
            return `${title}\n${content}${url}`;
          })
          .join("\n\n")
      : "";

    if (resultText) {
      return resultText;
    }

    if (typeof response?.answer === "string" && response.answer.trim()) {
      return response.answer;
    }

    return "No relevant internet results found.";
  } catch (error) {
    console.error("[searchInternet] Error", {
      message: error?.message,
      stack: error?.stack,
    });
    return "Internet search is temporarily unavailable.";
  }
};
