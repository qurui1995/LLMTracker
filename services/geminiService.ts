import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DayPlan, StudyStatus, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyPlan = async (language: Language = 'en'): Promise<DayPlan[]> => {
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
        knowledgePoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of 3-5 specific, granular technical concepts or definitions to master this day."
        },
        codingTask: { type: Type.STRING },
        interviewFocus: { type: Type.STRING },
        targetHours: { type: Type.INTEGER }
      },
      required: ["day", "title", "description", "topics", "knowledgePoints", "codingTask", "interviewFocus", "targetHours"],
    }
  };

  const langInstruction = language === 'zh' 
    ? "Output MUST be in Chinese (Simplified). Keep standard English technical terms (e.g., Transformer, Attention, LoRA) in English or provide them in brackets."
    : "Output MUST be in English.";

  const prompt = `
    I am a Machine Learning Engineer with a solid background in ML theory but weak in Deep Learning and practical implementation.
    I want to master Large Language Models (LLMs) and Generative AI efficiently to be interview-ready.
    
    Please create a rigorous 20-day study plan.
    ${langInstruction}
    
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
    - Generate specific "knowledgePoints" (bullet points) for each day.
    - The "codingTask" and "interviewFocus" MUST be directly related to the "knowledgePoints" of that day.
    - Focus heavily on "Coding" and "Tuning" tasks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a world-class Technical Interview Coach and Senior AI Engineer. Create a practical, code-heavy study plan.",
        thinkingConfig: { thinkingBudget: 2048 }
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
      notes: '',
      knowledgePoints: (item.knowledgePoints || []).map((text: string) => ({
        text,
        isLearned: false
      }))
    }));

  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const getConceptExplanation = async (concept: string, contextTitle: string, language: Language = 'en'): Promise<string> => {
  const langInstruction = language === 'zh' 
    ? "Explain in Chinese (Simplified)." 
    : "Explain in English.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain the technical concept "${concept}" in the context of "${contextTitle}". 
      ${langInstruction}
      Provide a concise explanation (max 3 sentences) and 1 specific, searchable term or library to look up.
      Format the output as simple Markdown.`
    });
    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Error getting explanation", error);
    return "Error connecting to Gemini.";
  }
};