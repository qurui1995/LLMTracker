import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DayPlan, StudyStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyPlan = async (): Promise<DayPlan[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.INTEGER },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        topics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        codingTask: { type: Type.STRING },
        interviewFocus: { type: Type.STRING },
        targetHours: { type: Type.INTEGER }
      },
      required: ["day", "title", "description", "topics", "codingTask", "interviewFocus", "targetHours"],
    }
  };

  const prompt = `
    I am a Machine Learning Engineer with a solid background in ML theory but weak in Deep Learning and practical implementation.
    I want to master Large Language Models (LLMs) and Generative AI efficiently to be interview-ready.
    
    Please create a rigorous 20-day study plan.
    
    The curriculum must flow logically:
    1. DL Basics (Backprop, Activation, Optimizers) - Brief refresher (Days 1-2)
    2. NLP Fundamentals & RNN/LSTM/Attention (Days 3-5)
    3. Transformers & BERT (Architecture, Self-Attention, Encoders) (Days 6-8)
    4. LLM Fundamentals (GPT, Decoders, Scaling Laws) (Days 9-11)
    5. Advanced Training (PEFT, LoRA, QLoRA, Quantization) (Days 12-14)
    6. Alignment (RLHF, DPO) (Days 15-16)
    7. RAG & Vector DBs (Days 17-18)
    8. AIOps & Deployment (vLLM, TGI, Serving) (Days 19-20)
    
    Constraints:
    - Default target hours per day is 4.
    - Focus heavily on "Coding" and "Tuning" tasks.
    - Include specific Interview Questions relevant to the day's topic.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning and curriculum planning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a world-class Technical Interview Coach and Senior AI Engineer. Create a practical, code-heavy study plan.",
        thinkingConfig: { thinkingBudget: 2048 } // Enable thinking to structure the curriculum better
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const rawPlan = JSON.parse(text);
    
    // Hydrate with client-side only properties
    return rawPlan.map((item: any) => ({
      ...item,
      status: StudyStatus.PENDING,
      hoursSpent: 0,
      notes: ''
    }));

  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};
