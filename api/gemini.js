import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { model, contents, config } = req.body;

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

 return res.status(200).json({
  text: response.text,
  candidates: response.candidates,
});

} catch (error) {
  console.error("Gemini Error:", error);

  return res.status(500).json({
    error: error.message,
    details: error,
  });
}
