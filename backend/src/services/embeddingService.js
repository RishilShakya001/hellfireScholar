import { ApiError } from "../utils/ApiError.js";

/**
 * Generates a single vector embedding.
 * Supports Google Gemini (default if GEMINI_API_KEY is set) and OpenAI.
 */
export const generateEmbedding = async (text) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    throw new ApiError(500, "Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured.");
  }

  // 1. Google Gemini Embeddings API (Default)
  if (geminiKey) {
    try {
      const model = process.env.EMBEDDING_MODEL || "text-embedding-004";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${geminiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.embedding.values;
    } catch (err) {
      console.error("Gemini embedding generation failed:", err.message);
      throw new ApiError(502, `Failed to generate Gemini embeddings: ${err.message}`);
    }
  }

  // 2. OpenAI Embeddings API (Fallback)
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data[0].embedding;
  } catch (err) {
    console.error("OpenAI embedding generation failed:", err.message);
    throw new ApiError(502, `Failed to generate OpenAI embeddings: ${err.message}`);
  }
};

/**
 * Generates batch vector embeddings.
 * Supports Google Gemini (default if GEMINI_API_KEY is set) and OpenAI.
 */
export const generateEmbeddings = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    throw new ApiError(500, "Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured.");
  }

  // 1. Google Gemini Batch Embeddings API
  if (geminiKey) {
    try {
      const model = process.env.EMBEDDING_MODEL || "text-embedding-004";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${geminiKey}`;

      const requests = texts.map((text) => ({
        model: `models/${model}`,
        content: {
          parts: [{ text }],
        },
      }));

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.embeddings.map((emb) => emb.values);
    } catch (err) {
      console.error("Gemini batch embedding generation failed:", err.message);
      throw new ApiError(502, `Failed to generate Gemini batch embeddings: ${err.message}`);
    }
  }

  // 2. OpenAI Batch Embeddings API
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI HTTP ${response.status}`);
    }

    const result = await response.json();
    const sortedData = result.data.sort((a, b) => a.index - b.index);
    return sortedData.map((item) => item.embedding);
  } catch (err) {
    console.error("OpenAI batch embedding generation failed:", err.message);
    throw new ApiError(502, `Failed to generate OpenAI batch embeddings: ${err.message}`);
  }
};
