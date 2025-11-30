"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Undo,
  Redo,
  Subscript,
  Superscript,
  Minus,
  AlignJustify,
  AlignRight,
  AlignCenter,
  AlignLeft,
  LinkIcon,
  Youtube,
  UploadCloud,
  ImageIcon,
  Grid3X3, // Icon Bảng
  // --- ICON THAO TÁC BẢNG ---
  BetweenHorizontalStart,
  BetweenHorizontalEnd,
  BetweenVerticalStart,
  BetweenVerticalEnd,
  Merge,
  Split,
  Trash2,
} from "lucide-react";
import ColorSelector from "./ColorSelector";
import { useRef, useState } from "react";
import { uploadImageAPI } from "@/utils/upload"; // Đảm bảo đường dẫn này đúng
import { showToast } from "@/utils/toast";

// --- COMPONENT BUTTON (Tách riêng cho gọn) ---
type ButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
  title,
  className,
}: ButtonProps) => {
  return (
    <button
      title={title}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseDown={(e) => {
        e.preventDefault(); // Ngăn mất focus editor
      }}
      disabled={disabled}
      className={`p-2 cursor-pointer rounded-md transition-colors flex items-center justify-center ${
        isActive
          ? "bg-slate-800 text-white"
          : "text-slate-600 hover:bg-slate-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className || ""}`}
    >
      {children}
    </button>
  );
};

// --- COMPONENT TOOLBAR CHÍNH ---
type Props = {
  editor: Editor | null;
};

const Toolbar = ({ editor }: Props) => {
  // State quản lý menu Ảnh
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  // Ref input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  // --- LOGIC XỬ LÝ ẢNH ---
  const handleImageUrl = () => {
    const url = window.prompt("Dán đường dẫn (URL) ảnh vào đây:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setIsImageMenuOpen(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setIsImageMenuOpen(false);
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Tạo ảnh ảo (Preview)
    const previewUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: previewUrl }).run();

    try {
      // 2. Upload thật
      const realUrl = await uploadImageAPI(file);

      if (!realUrl) throw new Error("Không nhận được URL từ server");

      // 3. Tráo link
      let imagePos: number | null = null;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === previewUrl) {
          imagePos = pos;
          return false;
        }
      });

      if (imagePos !== null) {
        const transaction = editor.state.tr.setNodeMarkup(imagePos, undefined, {
          src: realUrl,
          width: editor.state.doc.nodeAt(imagePos)?.attrs.width || "100%",
          height: editor.state.doc.nodeAt(imagePos)?.attrs.height || "auto",
          textAlign:
            editor.state.doc.nodeAt(imagePos)?.attrs.textAlign || "center",
        });
        editor.view.dispatch(transaction);
        console.log("Đã upload và tráo link thành công!");
      }
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Lỗi",
        description: "Lỗi khi upload ảnh. Vui lòng thử lại.",
      });
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === previewUrl) {
          editor.view.dispatch(
            editor.state.tr.delete(pos, pos + node.nodeSize)
          );
          return false;
        }
      });
    }
    event.target.value = "";
  };

  // Kiểm tra trạng thái bảng
  const isTableActive = editor.isActive("table");

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all ">
      {/* --- HÀNG 1: CÔNG CỤ CHÍNH --- */}
      <div className="flex flex-wrap items-center gap-1 p-2">
        {/* NHÓM 1: HISTORY */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* NHÓM 2: FORMAT TEXT */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="In đậm (Ctrl+B)"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </ToolbarButton>
        <ColorSelector editor={editor} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Gạch ngang"
        >
          <Strikethrough size={18} />
        </ToolbarButton>

        {/* Sub/Super Script */}
        <ToolbarButton
          onClick={() => {
            if (editor.isActive("subscript"))
              editor.chain().focus().unsetSubscript().run();
            editor.chain().focus().toggleSuperscript().run();
          }}
          isActive={editor.isActive("superscript")}
          title="Chỉ số trên"
        >
          <Superscript size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            if (editor.isActive("superscript"))
              editor.chain().focus().unsetSuperscript().run();
            editor.chain().focus().toggleSubscript().run();
          }}
          isActive={editor.isActive("subscript")}
          title="Chỉ số dưới"
        >
          <Subscript size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code2 size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* NHÓM 3: HEADINGS */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Tiêu đề 3"
        >
          <Heading3 size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* NHÓM 4: LISTS & QUOTE */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Danh sách"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Danh sách số"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Trích dẫn"
        >
          <Quote size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* NHÓM 5: ALIGNMENT */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Căn trái"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Căn giữa"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Căn phải"
        >
          <AlignRight size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Căn đều"
        >
          <AlignJustify size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* NHÓM 6: MEDIA (Link, Youtube, Image, Divider) */}

        {/* Nút Link */}
        <ToolbarButton
          onClick={() => {
            if (editor.state.selection.empty && editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            const previousUrl = editor.getAttributes("link").href;
            const url = window.prompt("URL", previousUrl);
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
          isActive={editor.isActive("link")}
          title="Thêm Link"
        >
          <LinkIcon size={18} />
        </ToolbarButton>

        {/* Nút Youtube */}
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Dán đường dẫn YouTube vào đây:");
            if (!url) return;
            const widthStr = window.prompt(
              "Nhập chiều rộng (mặc định 640):",
              "640"
            );
            const width = widthStr ? parseInt(widthStr) : 640;
            const height = (width * 9) / 16;
            editor.commands.setYoutubeVideo({
              src: url,
              width: Math.max(320, width),
              height: Math.max(180, height),
            });
          }}
          isActive={editor.isActive("youtube")}
          title="Chèn Youtube"
        >
          <Youtube size={18} />
        </ToolbarButton>

        {/* Nút Ảnh (Dropdown) */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setIsImageMenuOpen(!isImageMenuOpen)}
            isActive={isImageMenuOpen || editor.isActive("image")}
            title="Chèn Ảnh"
          >
            <ImageIcon size={18} />
          </ToolbarButton>

          {isImageMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left transition-colors"
              >
                <UploadCloud size={16} className="text-blue-500" />
                Tải ảnh từ máy
              </button>
              <button
                type="button"
                onClick={handleImageUrl}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left transition-colors border-t border-gray-100"
              >
                <LinkIcon size={16} className="text-gray-500" />
                Dán đường dẫn (URL)
              </button>
            </div>
          )}
        </div>

        {/* Nút Tạo Bảng */}
        <ToolbarButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Chèn bảng 3x3"
          disabled={isTableActive}
        >
          <Grid3X3 size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Đường kẻ ngang"
        >
          <Minus size={18} />
        </ToolbarButton>
      </div>

      {/* --- HÀNG 2: CÔNG CỤ BẢNG (CHỈ HIỆN KHI IS_TABLE_ACTIVE) --- */}
      {isTableActive && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-blue-50 border-t border-blue-100 animate-in slide-in-from-top-1">
          <span className="text-xs font-bold text-blue-600 mr-2 uppercase tracking-wider">
            Công cụ Bảng:
          </span>

          {/* NHÓM CỘT */}
          <div className="flex items-center gap-1 bg-white/50 p-1 rounded-md border border-blue-100">
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Thêm cột trước"
              className="hover:bg-blue-100 text-blue-700"
            >
              <BetweenHorizontalStart size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Thêm cột sau"
              className="hover:bg-blue-100 text-blue-700"
            >
              <BetweenHorizontalEnd size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Xóa cột"
              className="hover:bg-red-100 text-red-600"
            >
              <Trash2 size={18} className="rotate-90" />
            </ToolbarButton>
          </div>

          <div className="w-px h-4 bg-blue-200 mx-2"></div>

          {/* NHÓM HÀNG */}
          <div className="flex items-center gap-1 bg-white/50 p-1 rounded-md border border-blue-100">
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Thêm hàng trên"
              className="hover:bg-blue-100 text-blue-700"
            >
              <BetweenVerticalStart size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Thêm hàng dưới"
              className="hover:bg-blue-100 text-blue-700"
            >
              <BetweenVerticalEnd size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Xóa hàng"
              className="hover:bg-red-100 text-red-600"
            >
              <Trash2 size={18} />
            </ToolbarButton>
          </div>

          <div className="w-px h-4 bg-blue-200 mx-2"></div>

          {/* NHÓM Ô */}
          <div className="flex items-center gap-1 bg-white/50 p-1 rounded-md border border-blue-100">
            <ToolbarButton
              onClick={() => editor.chain().focus().mergeCells().run()}
              title="Gộp ô (Merge)"
              className="hover:bg-blue-100 text-blue-700"
            >
              <Merge size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().splitCell().run()}
              title="Tách ô (Split)"
              className="hover:bg-blue-100 text-blue-700"
            >
              <Split size={18} />
            </ToolbarButton>
          </div>

          <div className="flex-1"></div>

          {/* XÓA BẢNG */}
          <button
            onClick={() => {
              if (confirm("Bạn có chắc muốn xóa bảng này không?")) {
                editor.chain().focus().deleteTable().run();
              }
            }}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200 transition-colors border border-red-200"
          >
            <Trash2 size={14} /> Xóa bảng
          </button>
        </div>
      )}

      {/* Input File Ẩn - Đặt ngoài cùng để không bị lỗi CSS */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/png, image/jpeg, image/gif, image/webp"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Toolbar;
