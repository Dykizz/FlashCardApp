import { z } from "zod";
import { ArticleLevel, WordType } from "@/types/sourceArticle.type";

const SentenceSchema = z.object({
  content_vn: z.string().min(1, "Nội dung câu không được để trống"),
  complexity_score: z.number().optional().default(0),
  sample_answers: z.array(z.string()).optional().default([]),
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
    .optional(),
});

export const CreateArticleDTO = z.object({
  title_vn: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  topic: z.string().min(1, "Chủ đề không được để trống"),
  level: z.nativeEnum(ArticleLevel, {
    message: "Cấp độ không hợp lệ (A1-C2)",
  }),
  description: z.string().optional(),
  original_text: z.string().min(20, "Nội dung bài viết quá ngắn"),
  source_sentences: z
    .array(SentenceSchema)
    .min(1, "Phải có ít nhất 1 câu đã tách"),
});

export type CreateArticleInput = z.infer<typeof CreateArticleDTO>;
