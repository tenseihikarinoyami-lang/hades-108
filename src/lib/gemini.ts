import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
// Using the provided key or falling back to environment variables
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCw7iHifxeWXH7aJLaYSZyqS8WX1qYTOfk';
const ai = new GoogleGenAI({ apiKey });

export interface GeneratedTrivia {
  q: string;
  options: string[];
  answer: number;
}

export const generateInfiniteTrivia = async (topic: string, count: number = 5, difficulty: string = 'Media'): Promise<GeneratedTrivia[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera ${count} preguntas de trivia sobre el tema: ${topic}.
      Nivel de dificultad: ${difficulty}.
      Las preguntas deben ser interesantes, precisas y sin errores de continuidad.
      Asegúrate de que la respuesta correcta esté mezclada en diferentes posiciones.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: {
                type: Type.STRING,
                description: "La pregunta de trivia.",
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "Un arreglo de exactamente 4 opciones de respuesta.",
              },
              answer: {
                type: Type.INTEGER,
                description: "El índice (0 a 3) de la respuesta correcta dentro del arreglo de opciones.",
              },
            },
            required: ["q", "options", "answer"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (jsonStr) {
      const parsed = JSON.parse(jsonStr) as GeneratedTrivia[];
      return parsed;
    }
    return [];
  } catch (error) {
    console.error("Error generating trivia with Gemini:", error);
    return [];
  }
};
