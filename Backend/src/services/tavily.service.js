import { tavily as Tavily } from "@tavily/core";

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  return Tavily({ apiKey });
}

export const searchInternet = async ({ query, max_results = 5 }) => {
  try {
    const cleanQuery = query?.trim();

    if (!cleanQuery) {
      console.warn("[searchInternet] Missing query");
      return null;
    }

    console.log("[searchInternet] Invoked", { query: cleanQuery });

    const tavily = getTavilyClient();
    console.log("=== CALLING TAVILY ===");
    const response = await tavily.search(cleanQuery, {
      maxResults: max_results,
    });

    console.log("=== RAW TAVILY RESPONSE ===");
    console.log(JSON.stringify(response, null, 2));
    console.log("Tavily results count:", response?.results?.length);

    console.log("[searchInternet] Raw Tavily response", {
      hasResults: Array.isArray(response?.results),
      resultCount: Array.isArray(response?.results) ? response.results.length : 0,
      keys: response ? Object.keys(response) : [],
    });

    if (!response || !response.results || response.results.length === 0) {
      return null;
    }

    return response;
  } catch (error) {
    console.log("=== TAVILY ERROR ===", error.message);
    console.error("Tavily error:", error.message);
    return null;
  }
};
