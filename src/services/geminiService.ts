import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history.map(h => ({ role: h.role, parts: h.parts })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "Bạn là trợ lý ảo của website PhimChill. Bạn giúp người dùng tìm kiếm phim, giải đáp thắc mắc về phim ảnh và cung cấp thông tin về các bộ phim đang hot. Hãy trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp. Nếu người dùng hỏi về phim, hãy gợi ý họ xem trên PhimChill.",
          temperature: 0.7,
        },
      });

      return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.";
    }
  }
};
