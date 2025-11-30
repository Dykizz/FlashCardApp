"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Toolbar from "./Toolbar";
import Youtube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";
import ImageResizeComponent from "./ImageResizeComponent";
import { uploadImageAPI } from "@/utils/upload";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import CodeBlockComponent from "./CodeBlockComponent";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import hljs from "highlight.js";
import { useEffect, useRef, useState } from "react";
import { showToast } from "@/utils/toast";

const lowlight = createLowlight(common);

const Tiptap = ({
  onChange,
  content,
}: {
  onChange: (content: string) => void;
  content: string | object | object[];
}) => {
  const [htmlContent, setHtmlContent] = useState("");
  const firstRender = useRef(true);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- LOGIC UPLOAD ẢNH ---
  const handleImageUpload = async (
    file: File,
    view: any,
    coordinates?: { pos: number }
  ) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      showToast({
        type: "error",
        title: "Lỗi",
        description: "Chỉ hỗ trợ upload ảnh dưới 5MB. Vui lòng chọn ảnh khác.",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (coordinates) {
      const node = view.state.schema.nodes.image.create({ src: previewUrl });
      const transaction = view.state.tr.insert(coordinates.pos, node);
      view.dispatch(transaction);
    } else {
      view.dispatch(
        view.state.tr.replaceSelectionWith(
          view.state.schema.nodes.image.create({ src: previewUrl })
        )
      );
    }

    try {
      const realUrl = await uploadImageAPI(file);

      if (!realUrl) throw new Error("API không trả về URL");

      let imagePos: number | null = null;
      view.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === "image" && node.attrs.src === previewUrl) {
          imagePos = pos;
          return false;
        }
      });

      if (imagePos !== null) {
        const transaction = view.state.tr.setNodeMarkup(imagePos, undefined, {
          src: realUrl,
          width: view.state.doc.nodeAt(imagePos)?.attrs.width || "100%",
          height: view.state.doc.nodeAt(imagePos)?.attrs.height || "auto",
          textAlign:
            view.state.doc.nodeAt(imagePos)?.attrs.textAlign || "center",
        });
        view.dispatch(transaction);
        console.log("Đã upload và tráo link thành công!");
      }
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("Lỗi upload:", error);
      showToast({
        type: "error",
        title: "Lỗi",
        description: "Lỗi khi upload ảnh. Vui lòng thử lại.",
      });
      view.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === "image" && node.attrs.src === previewUrl) {
          view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize));
          return false;
        }
      });
    }
  };

  const handleChange = (newContent: string) => {
    onChange(newContent);
    console.log("Editor content changed:", newContent);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        underline: false,
        link: false,
      }),
      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "youtube", "image", "codeBlock"],
      }),
      Underline,

      CodeBlockLowlight.configure({
        lowlight,
      }).extend({
        addAttributes() {
          return {
            language: {
              default: null,
            },

            textAlign: {
              default: "left",
              renderHTML: (attributes) => ({
                style: `text-align: ${attributes.textAlign}`,
              }),
              parseHTML: (element) => element.style.textAlign || "left",
            },
          };
        },
        // ------------------------

        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent as any, {
            stopEvent: ({ event }) => {
              const target = event.target as HTMLElement;
              if (target.tagName === "SELECT" || target.closest("select")) {
                return true;
              }
              return false;
            },
          });
        },
      }),

      Typography,
      TextStyle,
      Color,
      Superscript,
      Subscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Nhập nội dung bài viết của bạn tại đây...",
      }),
      Image.configure({
        inline: false, // Để false cho dễ resize
        allowBase64: true,
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: "100%", renderHTML: (a) => ({ width: a.width }) },
            height: {
              default: "auto",
              renderHTML: (a) => ({ height: a.height }),
            },
            textAlign: {
              default: "center",
              renderHTML: (a) => ({ style: `text-align: ${a.textAlign}` }),
              parseHTML: (element) => element.style.textAlign || "center",
            },
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(ImageResizeComponent);
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        modestBranding: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "text-black dark:text-gray-200 prose prose-lg prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-8 py-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files?.[0]) {
          const file = event.dataTransfer.files[0];
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (coordinates) {
            handleImageUpload(file, view, coordinates);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        const item = items.find((item) => item.type.startsWith("image"));
        if (item) {
          const file = item.getAsFile();
          if (file) {
            handleImageUpload(file, view);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      handleChange(JSON.stringify(editor.getJSON()));
      setHtmlContent(editor.getHTML());
    },
    content: content,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content && firstRender.current) {
      editor.commands.setContent(content);
      firstRender.current = false;
    }
  }, [editor, content]);

  // Highlight syntax cho phần Preview
  useEffect(() => {
    if (previewRef.current) {
      const blocks = previewRef.current.querySelectorAll("pre code");
      blocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [htmlContent]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. EDITOR CHÍNH */}
      <div className="w-full border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm transition-colors">
        <Toolbar editor={editor} />
        <div
          className="flex-1 cursor-text min-h-[400px]"
          onClick={() => !editor.isFocused && editor.chain().focus().run()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 2. LIVE PREVIEW (Kết quả hiển thị cho người đọc) */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Kết quả hiển thị (Preview)
        </h3>

        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="preview-content ProseMirror prose prose-lg prose-slate dark:prose-invert max-w-none">
            <div
              ref={previewRef}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tiptap;
