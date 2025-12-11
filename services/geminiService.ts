import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// Note: In a real production app, you should proxy requests through a backend.
// For this demo, we use the env variable directly as per instructions.
const apiKey = process.env.API_KEY || ''; 

// We handle the case where API key might be missing gracefully in the UI
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const geminiService = {
  async generateResponse(messageHistory: { role: 'user' | 'model', text: string }[]): Promise<string> {
    if (!ai) {
      return "请在环境中配置 API_KEY 以使用 AI 功能。";
    }

    try {
      const model = 'gemini-2.5-flash';
      
      // Convert history to Gemini format
      // The SDK expects a slightly different format for chat history or we can just send the last prompt
      // For better context, we use the chat feature.
      
      const chat = ai.chats.create({
        model: model,
        history: messageHistory.slice(0, -1).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
           systemInstruction: "你是一个有用、友好且精简的聊天助手。请用中文回答。",
        }
      });

      const lastMessage = messageHistory[messageHistory.length - 1].text;
      const result = await chat.sendMessage({ message: lastMessage });
      
      return result.text || "抱歉，我现在无法回答。";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "AI 服务暂时不可用，请稍后再试。";
    }
  }
};