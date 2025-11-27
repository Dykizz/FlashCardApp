"use client";

import React, { useEffect, useRef, useMemo } from "react";
import {
  Plus,
  Trash2,
  Merge,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Save,
} from "lucide-react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import type { Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

import { ArticleLevel, SourceArticle } from "@/types/sourceArticle.type";
import { CreateArticleDTO } from "@/lib/validators/article.schema";

const FormSchema = CreateArticleDTO.extend({
  source_sentences: z.array(
    z.object({
      content_vn: z.string().min(1, "Nội dung không được để trống"),
      complexity_score: z.number().default(0),
      sample_answer_input: z.string().optional(),
      sample_answers: z.array(z.string()).optional(),
    })
  ),
});

type FormValues = z.infer<typeof FormSchema>;

interface ArticleFormProps {
  article?: SourceArticle | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const queryClient = useQueryClient();
  const updateSource = useRef<"paragraph" | "sentences">("sentences");
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      title_vn: "",
      topic: "",
      level: ArticleLevel.A1,
      description: "",
      original_text: "",
      source_sentences: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "source_sentences",
  });

  useEffect(() => {
    if (article) {
      form.reset({
        title_vn: article.title_vn,
        topic: article.topic,
        level: article.level,
        description: article.description || "",
        original_text: article.original_text,
        source_sentences: article.source_sentences.map((s) => ({
          content_vn: s.content_vn,
          complexity_score: s.complexity_score || 0,
          sample_answers: s.sample_answers,
          sample_answer_input: s.sample_answers?.[0] || "",
        })),
      });
    }
  }, [article, form]);

  const paragraphValue = useWatch({
    control: form.control,
    name: "original_text",
  });

  useEffect(() => {
    if (updateSource.current === "paragraph") {
      const handler = setTimeout(() => {
        console.log("Đồng bộ từ Paragraph sang Sentences...");
        if (!paragraphValue?.trim()) return;
        console.log("Phát hiện thay đổi đoạn văn, tách câu...");

        const rawSentences = paragraphValue
          .replace(/([.!?])\s+/g, "$1|") // Thêm dấu | sau dấu câu + khoảng trắng
          .replace(/(\n)/g, "|$1|") // Tách riêng dấu xuống dòng
          .split("|"); // Cắt theo dấu |

        const newSentences = rawSentences
          .map((s) => s.trim())
          .filter((s) => s.length > 0) // Loại bỏ câu rỗng
          .map((s) => ({
            content_vn: s,
            complexity_score: 0,
            sample_answers: [],
            sample_answer_input: "",
          }));

        console.log("New Sentences:", newSentences);
        const isContentChanged =
          JSON.stringify(newSentences.map((s) => s.content_vn)) !==
          JSON.stringify(fields.map((f) => f.content_vn));

        if (isContentChanged) {
          replace(newSentences);
        }
      }, 800);
      return () => clearTimeout(handler);
    }
  }, [paragraphValue, replace, fields.length]);

  // --- HANDLERS ---
  const handleParagraphChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSource.current = "paragraph";
    form.setValue("original_text", e.target.value, { shouldDirty: true });
  };

  // Đánh dấu đang sửa ở list câu để không bị override bởi paragraph
  const onSentenceInteract = () => {
    updateSource.current = "sentences";
  };

  // Logic Gộp câu (Merge)
  const toggleSentenceSelection = (index: number) => {
    setSelectedIndices((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return Array.from(newSet).sort((a, b) => a - b);
    });
  };

  const canMerge = useMemo(() => {
    if (selectedIndices.length < 2) return false;
    for (let i = 0; i < selectedIndices.length - 1; i++) {
      if (selectedIndices[i + 1] !== selectedIndices[i] + 1) return false;
    }
    return true;
  }, [selectedIndices]);

  const handleMergeSelected = () => {
    if (!canMerge) return;
    updateSource.current = "sentences";

    const currentSentences = form.getValues("source_sentences");

    const mergedContent = selectedIndices
      .map((idx) => currentSentences[idx].content_vn.trim())
      .join(" "); // Nối bằng khoảng trắng

    const mergedSample = selectedIndices
      .map((idx) => currentSentences[idx].sample_answer_input)
      .filter(Boolean)
      .join(" ");

    const firstIndex = selectedIndices[0];
    const newSentence = {
      content_vn: mergedContent,
      complexity_score: 0,
      sample_answers: [],
      sample_answer_input: mergedSample,
    };

    const newFields = [...currentSentences];
    newFields.splice(firstIndex, selectedIndices.length, newSentence);

    replace(newFields);
    setSelectedIndices([]);
  };

  // --- SUBMIT ---
  const onFormSubmit = (values: FormValues) => {
    // Transform dữ liệu trước khi gửi về Parent/API
    const transformedData = {
      ...values,
      source_sentences: values.source_sentences.map((s) => ({
        content_vn: s.content_vn,
        complexity_score: s.complexity_score,
        // Chuyển chuỗi input thành mảng string[]
        sample_answers: s.sample_answer_input?.trim()
          ? [s.sample_answer_input.trim()]
          : [],
      })),
    };

    onSubmit(transformedData);

    // Kích hoạt làm mới danh sách bài viết (Bất kể trang nào, filter nào)
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="flex flex-col h-[calc(100vh-150px)] gap-6 pt-4 "
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch flex-1 overflow-hidden min-h-0 ">
          {/* --- CỘT TRÁI: THÔNG TIN CHUNG --- */}
          <div className="flex flex-col h-full space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 shrink-0">
              <FormField
                control={form.control}
                name="title_vn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Tiêu đề
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Lợi ích của việc đọc sách"
                        {...field}
                        className="bg-white ml-1 dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">
                      Chủ đề
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Giáo dục"
                        {...field}
                        className="bg-white ml-1 dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300">
                    Cấp độ
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white ml-1 dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Chọn cấp độ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ArticleLevel).map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300">
                    Mô tả / Đề bài
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="resize-y ml-1 min-h-[80px] bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                      placeholder="Mô tả ngắn..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="original_text"
              render={({ field }) => (
                <FormItem className="flex flex-col grow">
                  <FormLabel className="text-slate-700 dark:text-slate-300">
                    Nội dung gốc
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      onChange={handleParagraphChange}
                      className="grow ml-1 resize-none font-sans leading-relaxed min-h-[300px] whitespace-pre-wrap bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                      placeholder="Dán nội dung tiếng Việt vào đây..."
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground italic">
                    * Nội dung ở đây sẽ được lưu làm bài gốc.
                  </p>
                </FormItem>
              )}
            />
          </div>

          {/* --- CỘT PHẢI: CHI TIẾT CÂU --- */}
          <div className="flex flex-col h-full space-y-4 min-h-0">
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-slate-100 dark:bg-slate-800"
                >
                  {fields.length} câu
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  append({
                    content_vn: "",
                    complexity_score: 0,
                    sample_answers: [],
                    sample_answer_input: "",
                  })
                }
                className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm thủ công
              </Button>
            </div>

            <div className="flex justify-end items-center shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMergeSelected}
                disabled={!canMerge}
                className="flex items-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-slate-700 dark:text-slate-300 disabled:opacity-50"
              >
                <Merge className="w-4 h-4" /> Gộp câu chọn
              </Button>
            </div>

            {/* List Câu */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50 dark:bg-[#0B0D14]/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 custom-scrollbar">
              <div className="space-y-4 pb-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`flex flex-col space-y-3 p-4 rounded-lg border transition-all shadow-sm ${
                      selectedIndices.includes(index)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500/50 ring-1 ring-blue-500/20"
                        : "bg-white dark:bg-[#15171E] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Header Câu */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`check-${index}`}
                        checked={selectedIndices.includes(index)}
                        onCheckedChange={() => toggleSentenceSelection(index)}
                        className="mt-1.5 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-400 font-mono mt-1.5 select-none w-6">
                        {index + 1}.
                      </span>
                      <div className="flex-grow">
                        {/* Input Tiếng Việt */}
                        <FormField
                          control={form.control}
                          name={`source_sentences.${index}.content_vn`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Textarea
                                  {...field}
                                  onFocus={onSentenceInteract}
                                  rows={2}
                                  className="resize-none min-h-[60px] focus-visible:ring-1 font-medium border-slate-200 dark:border-slate-700 bg-transparent text-sm leading-relaxed"
                                  placeholder="Nội dung tiếng Việt..."
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Input Đáp Án Mẫu */}
                    <div className="pl-12 pr-8">
                      <div className="relative">
                        <div className="absolute left-3 top-2.5 text-slate-400">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <FormField
                          control={form.control}
                          name={`source_sentences.${index}.sample_answer_input`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Textarea
                                  {...field}
                                  onFocus={onSentenceInteract}
                                  rows={1}
                                  className="pl-9 min-h-10 resize-none text-sm bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-[#111827] transition-colors placeholder:text-slate-400"
                                  placeholder="Đáp án mẫu tiếng Anh (tùy chọn)..."
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-60">
                    <MessageSquare className="w-12 h-12 mb-3" />
                    <p className="font-medium">Danh sách trống.</p>
                    <p className="text-xs text-center mt-1">
                      Nhập nội dung bên trái để tự động tách câu.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm border border-red-200 dark:border-red-800 animate-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Vui lòng kiểm tra lại các trường nhập liệu bị lỗi ở trên.
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-6 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Đang lưu...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />{" "}
                {article ? "Cập nhật" : "Tạo bài viết"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ArticleForm;
