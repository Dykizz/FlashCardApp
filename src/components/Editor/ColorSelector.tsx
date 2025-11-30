"use client";

import { Editor } from "@tiptap/react";
import { Baseline, Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Props = {
  editor: Editor;
};

const ColorSelector = ({ editor }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const presets = [
    "#000000", // Đen (Mặc định)
    "#2563EB", // Xanh dương (Blue 600)
    "#16A34A", // Xanh lá (Green 600)
    "#DC2626", // Đỏ (Red 600)
    "#D97706", // Vàng cam (Amber 600)
    "#9333EA", // Tím (Purple 600)
    "#DB2777", // Hồng (Pink 600)
  ];

  const currentColor = "#000000";
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 p-2 rounded-md transition-colors ${
          isOpen ? "bg-slate-200" : "text-slate-600 hover:bg-slate-100"
        }`}
        title="Chọn màu chữ"
      >
        <Baseline size={18} style={{ color: currentColor }} />
        <ChevronDown size={12} className="text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 w-48 animate-in fade-in zoom-in-95 duration-100">
          {/* Label */}
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Màu cơ bản
          </p>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {presets.map((color) => (
              <button
                key={color}
                onClick={() => {
                  editor.chain().focus().setColor(color).run();
                  setIsOpen(false);
                }}
                className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform ${
                  currentColor === color
                    ? "ring-2 ring-offset-1 ring-blue-500"
                    : ""
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {currentColor === color && (
                  <Check size={12} className="text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          {/* Phần chọn màu tùy chỉnh (Custom) */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Tùy chỉnh
            </p>
            <div className="relative w-full h-9 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden group">
              <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                Chọn màu khác...
              </span>

              <input
                type="color"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                onInput={(e: any) => {
                  editor.chain().focus().setColor(e.target.value).run();
                }}
                value={currentColor}
              />
            </div>
          </div>

          <button
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              setIsOpen(false);
            }}
            className="w-full mt-2 text-xs text-gray-500 hover:text-red-500 hover:underline py-1"
          >
            Xóa màu (Mặc định)
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
