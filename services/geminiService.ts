
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Depth, LearningMode, LearningPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLearningPlan = async (
  topic: string,
  depth: Depth,
  mode: LearningMode,
  dailyTime: number
): Promise<LearningPlan> => {
  const model = "gemini-3-flash-preview";

  const prompt = `Generate a structured microlearning plan for the topic: "${topic}".
  Depth: ${depth === Depth.OVERVIEW ? "High-level overview for beginners" : "Detailed, in-depth explanation with edge cases"}.
  Mode: ${mode === LearningMode.HANDS_ON ? "Include hands-on mini-projects" : "Knowledge-only"}.
  Daily learning capacity: ${dailyTime} minutes.

  Decompose this topic into 5-8 "Learning Bites" inspired by Google Primer.
  Each bite MUST include:
  - Focus on a single concept (150-300 words).
  - Use plain language with relatable analogies.
  - Include setup, core explanation, analogy, and takeaway.
  - Include tools and resources.
  - A MANDATORY "miniQuiz" consisting of exactly 3 multiple choice questions to test understanding of ONLY that specific bite.
  
  Additionally, generate a 5-question multiple choice "Final Mastery Quiz" covering the entire plan.
  
  Format the output as a valid JSON object.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      bites: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            learningObjective: { type: Type.STRING },
            estimatedMinutes: { type: Type.NUMBER },
            content: {
              type: Type.OBJECT,
              properties: {
                setup: { type: Type.STRING },
                explanation: { type: Type.STRING },
                analogy: { type: Type.STRING },
                takeaway: { type: Type.STRING },
              },
              required: ["setup", "explanation", "analogy", "takeaway"],
            },
            example: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
            tools: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["name", "description"],
              },
            },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  type: { type: Type.STRING },
                },
                required: ["title", "url", "type"],
              },
            },
            miniQuiz: {
              type: Type.ARRAY,
              minItems: 3,
              maxItems: 3,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.NUMBER },
                },
                required: ["question", "options", "correctIndex"],
              },
            },
            miniProject: {
              type: Type.OBJECT,
              properties: {
                goal: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                estimatedTime: { type: Type.STRING },
              },
            },
          },
          required: ["id", "title", "learningObjective", "estimatedMinutes", "content", "example", "tools", "resources", "miniQuiz"],
        },
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.NUMBER },
          },
          required: ["question", "options", "correctIndex"],
        },
      },
    },
    required: ["topic", "bites", "quiz"],
  };

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const rawJson = JSON.parse(result.text);
  const avgBiteTime = 7;
  const bitesPerDay = Math.max(1, Math.min(5, Math.floor(dailyTime / avgBiteTime)));

  return {
    id: crypto.randomUUID(),
    topic: rawJson.topic,
    depth,
    mode,
    dailyTime,
    bitesPerDay,
    totalBites: rawJson.bites.length,
    bites: rawJson.bites,
    quiz: rawJson.quiz,
    createdAt: new Date().toISOString(),
  };
};

export const getLessonAudio = async (text: string): Promise<string | undefined> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Please read this lesson bite content clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const askBiteQuestion = async (topic: string, biteContent: string, question: string): Promise<string> => {
  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a microlearning tutor for the topic "${topic}".
    The current lesson content is: "${biteContent}".
    A student is asking: "${question}".
    Answer concisely in the helpful, clear style of Google Primer. Keep it under 100 words.`,
  });
  return result.text || "I'm sorry, I couldn't process that question.";
};
