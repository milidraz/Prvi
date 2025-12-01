
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { RiddleCategory, RiddleData } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const generateRiddle = async (category: RiddleCategory): Promise<RiddleData> => {
  const ai = getClient();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      riddleText: {
        type: Type.STRING,
        description: "Ein 4-zeiliges Reimrätsel in deutscher Sprache. Es soll kreativ und etwas mysteriös sein.",
      },
      answer: {
        type: Type.STRING,
        description: "Das Lösungswort (ein einzelnes Nomen, Singular, deutsch).",
      },
      hint: {
        type: Type.STRING,
        description: "Ein hilfreicher Hinweis, der das Wort nicht direkt nennt.",
      },
      difficulty: {
        type: Type.STRING,
        description: "Einschätzung der Schwierigkeit (Leicht, Mittel, Schwer).",
      },
      wrongAnswers: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "Zwei falsche Antwortmöglichkeiten (Nomen), die thematisch passen oder irreführend sind.",
      }
    },
    required: ["riddleText", "answer", "hint", "difficulty", "wrongAnswers"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Erstelle ein Rätsel für die Kategorie: "${category}". 
      Das Rätsel muss auf Deutsch sein. 
      Das Lösungswort darf im Rätseltext NICHT vorkommen.
      Gib auch 2 falsche Antworten zurück, die als Ablenkung dienen.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8, // Slightly creative
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Keine Antwort von Gemini erhalten.");
    }

    const rawData = JSON.parse(text);
    
    // Combine correct answer with wrong answers and shuffle
    const options = shuffleArray([rawData.answer, ...(rawData.wrongAnswers || [])]);

    return {
      riddleText: rawData.riddleText,
      answer: rawData.answer,
      hint: rawData.hint,
      difficulty: rawData.difficulty,
      options: options
    };

  } catch (error) {
    console.error("Fehler bei der Rätselgenerierung:", error);
    throw error;
  }
};
