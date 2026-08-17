import { ApiError } from "../utils/ApiError.js";

/**
 * Generates chat completion text.
 * Supports Google Gemini (default if GEMINI_API_KEY is set) and OpenAI.
 */
export const generateChatCompletion = async (messages) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    throw new ApiError(500, "Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured.");
  }

  // 1. Google Gemini Generate Content API (Default)
  if (geminiKey) {
    try {
      const model = process.env.LLM_MODEL || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

      // Extract system instructions and format conversation message array
      const systemInstructionMsg = messages.find((m) => m.role === "system");
      const systemInstruction = systemInstructionMsg
        ? { parts: [{ text: systemInstructionMsg.content }] }
        : undefined;

      const contents = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
          },
          systemInstruction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error("Gemini completion generation failed:", err.message);
      throw new ApiError(502, `Failed to generate Gemini response: ${err.message}`);
    }
  }

  // 2. OpenAI Completions API (Fallback)
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI chat completion failed:", err.message);
    throw new ApiError(502, `LLM service failed to respond: ${err.message}`);
  }
};
