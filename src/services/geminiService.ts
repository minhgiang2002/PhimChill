import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async getRelatedKeywords(keyword: string): Promise<string[]> {
    try {
      if (!apiKey) return [];
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: 'user', parts: [{ text: `Tôi đang tìm kiếm phim với từ khóa: "${keyword}". Hãy trả về danh sách các tên gọi khác, tên gốc, hoặc tên tiếng Việt phổ biến của phim này (tối đa 3 tên). Chỉ trả về danh sách các tên, mỗi tên trên 1 dòng, không giải thích gì thêm.` }] }
        ],
        config: {
          temperature: 0.3,
        },
      });

      const text = response.text || "";
      return text.split('\n').map(k => k.trim()).filter(k => k.length > 0 && k.toLowerCase() !== keyword.toLowerCase());
    } catch (error) {
      console.error("Gemini API Error in getRelatedKeywords:", error);
      return [];
    }
  },

  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    try {
      if (!apiKey) {
        return "Lỗi: Chưa cấu hình GEMINI_API_KEY. Nếu bạn đang chạy trên Vercel, vui lòng vào Settings > Environment Variables để thêm GEMINI_API_KEY.";
      }

      // Gemini API requires the first message in history to be from 'user'
      // If our history starts with 'model' (e.g. initial greeting), we skip it
      const validHistory = history.length > 0 && history[0].role === 'model' 
        ? history.slice(1) 
        : history;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...validHistory.map(h => ({ role: h.role, parts: h.parts })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "Bạn là trợ lý ảo của website PhimChill. Bạn giúp người dùng tìm kiếm phim, giải đáp thắc mắc về phim ảnh. Hãy trả lời bằng tiếng Việt, thân thiện, ngắn gọn và tự nhiên. QUAN TRỌNG NHẤT: Khi bạn giới thiệu, gợi ý hoặc nhắc đến bất kỳ bộ phim nào, bạn BẮT BUỘC phải bọc tên phim trong cú pháp [SEARCH:tên phim]. Ví dụ: 'Bạn nên xem thử [SEARCH:Mai] hoặc [SEARCH:Lật Mặt 7] nhé!'. Hệ thống sẽ tự động chuyển cú pháp này thành thẻ phim có hình ảnh. KHÔNG ĐƯỢC liệt kê tên phim chay mà không có cú pháp [SEARCH:...].",
          temperature: 0.7,
        },
      });

      return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Handle specific API errors
      if (error?.status === 400 || error?.message?.includes('API key')) {
        return "Lỗi xác thực API Key. Vui lòng kiểm tra lại GEMINI_API_KEY.";
      }
      
      if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand')) {
        return "Hệ thống AI hiện đang quá tải do có quá nhiều người sử dụng. Vui lòng thử lại sau ít phút nhé!";
      }
      
      // Return the exact error message for debugging
      return `Lỗi kết nối AI: ${error?.message || 'Không rõ nguyên nhân'}. Vui lòng thử lại.`;
    }
  }
};
