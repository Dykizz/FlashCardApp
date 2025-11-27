import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { ArticleLevel, WordType } from "@/types/sourceArticle.type";

export type AIModelType = "gemini" | "openai";
let geminiInstance: ChatGoogleGenerativeAI | null = null;
let openaiInstance: ChatOpenAI | null = null;
export const getGemini = () => {
  if (!geminiInstance) {
    geminiInstance = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.2,
      maxOutputTokens: 8192,
    });
  }
  return geminiInstance;
};

export const getOpenAI = () => {
  if (!openaiInstance) {
    openaiInstance = new ChatOpenAI({
      model: "gpt-5-mini",
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
};

const AnalyzedArticleSchema = z.object({
  sentences: z.array(
    z.object({
      content_vn: z.string().describe("Nội dung câu tiếng Việt gốc"),
      sample_answers: z
        .array(z.string())
        .describe("Danh sách các câu dịch mẫu tiếng Anh"),
      complexity_score: z
        .number()
        .describe("Độ khó của câu trên thang điểm 0-10"),

      hints: z
        .object({
          vocabulary: z
            .array(
              z.object({
                word: z.string().describe("Từ vựng hoặc cụm từ tiếng Anh"),
                meaning: z.string().describe("Nghĩa tiếng Việt ngắn gọn"),
                type: z
                  .enum(Object.values(WordType))
                  .optional()
                  .describe("Loại từ (n, v, adj, phrase...)"),
              })
            )
            .describe(
              "Danh sách 3-5 từ vựng quan trọng xuất hiện trong sample_answers"
            ),

          structures: z
            .array(
              z.object({
                structure: z
                  .string()
                  .describe("Cấu trúc ngữ pháp (VD: It takes... to...)"),
                usage: z.string().describe("Giải thích cách dùng ngắn gọn"),
              })
            )
            .describe("Các cấu trúc ngữ pháp đáng chú ý trong sample_answers"),
        })
        .describe(
          "Phân tích chi tiết từ vựng và ngữ pháp từ các câu trả lời mẫu nếu có."
        ),
    })
  ),
});

export async function analyzeAndGenerateContent(
  originalText: string,
  level: ArticleLevel,
  referenceText?: string,
  numberGen: number = 3,
  model: AIModelType = "gemini"
) {
  try {
    const llm = model === "gemini" ? getGemini() : getOpenAI();
    const structuredLlm = llm.withStructuredOutput(AnalyzedArticleSchema);

    let prompt = `
      Bạn là một chuyên gia ngôn ngữ Anh-Việt và luyện thi TOEIC/IELTS.
      Nhiệm vụ: Phân tích đoạn văn bản tiếng Việt sau đây để tạo bài học luyện viết mức độ ${level}.

      Đoạn văn bản Tiếng Việt gốc:
      "${originalText}"
    `;

    if (referenceText) {
      prompt += `
      
      Đoạn văn bản Tiếng Anh tham khảo (Đáp án mẫu):
      "${referenceText}"

      YÊU CẦU:
      1. Tách đoạn văn Tiếng Việt thành các câu riêng biệt.
      2. Tách và khớp (align) đoạn văn Tiếng Anh tham khảo tương ứng với từng câu Tiếng Việt.
      3. Tạo danh sách 'sample_answers' gồm ${numberGen} câu:
         - Câu 1: BẮT BUỘC lấy từ "Đoạn văn bản Tiếng Anh tham khảo".
         ${
           numberGen >= 2
             ? "- Câu 2: Viết lại (Paraphrase) theo phong cách Trang trọng (Formal)."
             : ""
         }
         ${
           numberGen >= 3
             ? "- Câu 3: Viết lại theo phong cách Tự nhiên (Native)."
             : ""
         }
      `;
    } else {
      prompt += `
      YÊU CẦU:
      1. Tách đoạn văn thành các câu riêng biệt.
      2. Tạo danh sách 'sample_answers' gồm ${numberGen} câu dịch:
         ${
           numberGen >= 1
             ? "- Câu 1: Dịch sát nghĩa, đúng ngữ pháp (Standard)."
             : ""
         }
         ${
           numberGen >= 2
             ? "- Câu 2: Văn phong trang trọng (Formal/Business)."
             : ""
         }
         ${
           numberGen >= 3
             ? "- Câu 3: Văn phong tự nhiên (Native/Idiomatic)."
             : ""
         }
      `;
    }

    prompt += `
      4. TRÍCH XUẤT GỢI Ý (HINTS) CHO MỖI CÂU:
         - Vocabulary: Trích xuất 3-5 từ vựng hoặc cụm từ (collocation) hay/khó xuất hiện trong các câu tiếng Anh mẫu. Giải thích nghĩa phù hợp với ngữ cảnh.
         - Structures: Trích xuất 1-2 cấu trúc ngữ pháp đặc biệt (nếu có).
         
        
    `;

    // Yêu cầu chung cuối cùng
    prompt += `
      5. Đánh giá độ khó (complexity_score) từ 0 đến 10.
      Hãy đảm bảo output đúng định dạng JSON.
    `;

    // 6. Gọi AI
    console.log(`🚀 Calling AI (${model})...`);
    const result = await structuredLlm.invoke(prompt);

    return result;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error(`Không thể tạo nội dung từ AI (${model})`);
  }
}

const CorrectionSchema = z.object({
  type: z
    .string()
    .describe("Loại lỗi, ví dụ: 'Ngữ pháp', 'Từ vựng', 'Cấu trúc'"),
  text: z.string().describe("Mô tả chi tiết về lỗi và gợi ý sửa chữa"),
});

export const GradingOutputSchema = z.object({
  score: z.number().min(0).max(10).describe("Điểm số cuối cùng từ 0 đến 10"),
  overall_comment: z
    .string()
    .describe("Nhận xét tổng quan về bài làm (1-2 câu)"),
  corrections: z
    .array(CorrectionSchema)
    .describe("Danh sách các lỗi và gợi ý chi tiết"),
  model_improvement: z
    .string()
    .optional()
    .describe("Cách viết lại câu mượt mà nhất (tham khảo)"),
  highlighted_sentence: z
    .string()
    .describe(
      'Câu gốc của học viên với các từ sai được bọc trong thẻ <mark type="LOẠI_LỖI">từ_sai</mark>'
    ),
});

export async function gradeSentence(
  vnSentence: string,
  enSubmission: string,
  level: ArticleLevel,
  model: AIModelType = "gemini"
) {
  try {
    const llm = model === "gemini" ? getGemini() : getOpenAI();

    const structuredLlm = llm.withStructuredOutput(GradingOutputSchema);

    const prompt = `
      Vai trò: Bạn là giám khảo chấm thi kỹ năng Viết (Writing) tiếng Anh chuyên nghiệp (IELTS/TOEIC).
      
      THÔNG TIN ĐẦU VÀO:
      - Cấp độ học viên: ${level}
      - Câu gốc (Tiếng Việt): "${vnSentence}"
      - Bài làm của học viên (Tiếng Anh): "${enSubmission}"

      NHIỆM VỤ CHẤM ĐIỂM:
      1. **Kiểm tra ý nghĩa:** Bài làm có truyền tải đúng ý câu gốc không? Nếu sai nghĩa nghiêm trọng, điểm số không quá 5.0.
      2. **Ngữ pháp & Từ vựng:** Soát lỗi dựa trên cấp độ ${level}.
      3. **Tính tự nhiên:** Bài làm có phù hợp với cách viết của bài thi IELTS/TOEIC không?

      YÊU CẦU OUTPUT (JSON):
      - 'score': Chấm thang 10. Khắt khe nhưng công bằng.
      - 'model_improvement': Viết lại câu này theo cách hay nhất theo chuẩn IELTS/TOEIC.
      -'highlighted_sentence': Hãy lấy nguyên văn câu "Bài làm của học viên", nhưng bọc các từ bị sai bằng thẻ <mark>. 
        Cấu trúc thẻ: <mark type="LOẠI_LỖI">từ_sai</mark>.
        Các loại lỗi (type): "grammar", "vocab", "spelling", "missing" (nếu thiếu từ).
        Ví dụ: Nếu học viên viết "He go school", output là: "He <mark type='grammar'>go</mark> <mark type='missing'>school</mark>".
      - 'corrections': Chỉ liệt kê tối đa 3 lỗi quan trọng nhất. Nếu bài làm hoàn hảo, để mảng rỗng.
      - 'overall_comment': Nhận xét bằng Tiếng Việt, giọng văn sư phạm, khích lệ.

      Lưu ý: Phản hồi hoàn toàn bằng Tiếng Việt (trừ các câu tiếng Anh trích dẫn).
    `;

    console.log(`🤖 Grading sentence using ${model}...`);
    const result = await structuredLlm.invoke(prompt);

    return result;
  } catch (error) {
    console.error("AI Grading Error:", error);
    throw new Error("Dịch vụ chấm điểm AI không khả dụng.");
  }
}

export const OverallEvaluationSchema = z.object({
  final_score: z.number().describe("Điểm trung bình tổng thể (0-10)"),
  summary_comment: z
    .string()
    .describe("Nhận xét chung ngắn gọn, mang tính khích lệ"),
  strengths: z
    .array(z.string())
    .describe("3 điểm mạnh nhất về ngữ pháp/từ vựng"),
  weaknesses: z.array(z.string()).describe("3 điểm yếu cần khắc phục"),
  study_plan: z.string().describe("Lời khuyên lộ trình học tiếp theo ngắn gọn"),
  rank: z
    .enum(["Newbie", "Apprentice", "Pro", "Master"])
    .describe("Danh hiệu vui vẻ"),
});

// 2. Hàm AI
export async function evaluateOverallPerformance(
  history: { vn: string; en: string; score: number }[],
  model: AIModelType = "gemini"
) {
  try {
    const llm = model === "gemini" ? getGemini() : getOpenAI();

    const structuredLlm = llm.withStructuredOutput(OverallEvaluationSchema);

    const historyText = history
      .map(
        (h, i) =>
          `Câu ${i + 1}: [VN] "${h.vn}" -> [User EN] "${h.en}" (Điểm: ${
            h.score
          })`
      )
      .join("\n");

    const prompt = `
      Bạn là huấn luyện viên tiếng Anh (IELTS/TOEIC). Hãy đánh giá tổng quan bài luyện viết của học viên.
      
      DỮ LIỆU BÀI LÀM:
      ${historyText}

      YÊU CẦU:
      - Phân tích các lỗi lặp lại (hệ thống) nếu có.
      - Đưa ra lời khuyên cụ thể, hữu ích.
      - Giọng văn: Thân thiện, sư phạm.
      - Output JSON theo Schema.
    `;

    console.log(`🤖 Evaluating overall performance using ${model}...`);
    return await structuredLlm.invoke(prompt);
  } catch (error) {
    console.error("AI Overall Eval Error:", error);
    throw new Error("Không thể đánh giá tổng quan lúc này.");
  }
}
