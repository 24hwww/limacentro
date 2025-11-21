import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

// Initialize client safely, checking if process is defined in the environment
try {
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    // @ts-ignore
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn("Gemini API Key not found in environment variables.");
  }
} catch (error) {
  console.warn("Error accessing process.env", error);
}

export const generateBusinessDescription = async (
  name: string,
  category: string,
  district: string,
  keywords: string
): Promise<string> => {
  if (!aiClient) {
    console.warn("Gemini API Client not initialized. Returning fallback description.");
    return `Un excelente ${category.toLowerCase()} ubicado en ${district}. ${keywords}`;
  }

  try {
    const prompt = `
      Escribe una descripción breve, atractiva y profesional (máximo 50 palabras) para un negocio en Lima, Perú.
      Nombre: ${name}
      Categoría: ${category}
      Distrito: ${district}
      Palabras clave/Detalles: ${keywords}
      
      La descripción debe invitar a los clientes a visitar.
    `;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return `Un excelente ${category.toLowerCase()} ubicado en ${district}.`;
  }
};