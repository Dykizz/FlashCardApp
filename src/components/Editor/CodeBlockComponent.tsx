"use client";

import { NodeViewContent, NodeViewWrapper, type Editor } from "@tiptap/react";
import React, { useState } from "react";
import {
  Check,
  Copy,
  ChevronDown,
  Wand2,
  Terminal,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

type Props = {
  node: any;
  updateAttributes: (attrs: any) => void;
  extension: any;
  editor: Editor;
  getPos: () => number;
};

export default function CodeBlockComponent({
  node,
  updateAttributes,
  extension,
  editor,
  getPos,
}: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

  const currentAlign = node.attrs.textAlign || "left";
  console.log("Current Align:", currentAlign);

  let alignClass = "mr-auto";
  if (currentAlign === "center") alignClass = "mx-auto";
  if (currentAlign === "right") alignClass = "ml-auto";

  const languages = extension.options.lowlight?.listLanguages() || [];

  const handleCopy = () => {
    const code = node.textContent;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFormat = async () => {
    const currentCode = node.textContent;
    if (!currentCode || isFormatting) return;

    setIsFormatting(true);
    try {
      const prettier = (await import("prettier/standalone")).default;
      const parserBabel = (await import("prettier/plugins/babel")).default;
      const parserEstree = (await import("prettier/plugins/estree")).default;
      const parserHtml = (await import("prettier/plugins/html")).default;
      const parserCss = (await import("prettier/plugins/postcss")).default;

      let parser = "babel";
      let plugins = [parserBabel, parserEstree];

      const lang = node.attrs.language;
      if (lang === "css" || lang === "scss") {
        parser = "css";
        plugins = [parserCss];
      }
      if (lang === "html") {
        parser = "html";
        plugins = [parserHtml];
      }

      const formatted = await prettier.format(currentCode, {
        parser,
        plugins,
        printWidth: 80,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
      });

      if (typeof getPos === "function") {
        const pos = getPos();
        const from = pos + 1;
        const to = pos + node.nodeSize - 1;
        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.insertText(formatted, from, to);
            return true;
          })
          .run();
      }
    } catch (error) {
      console.error("Format error", error);
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <NodeViewWrapper
      className={`
        code-block my-8 relative group rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-[#0d1117]
        w-fit min-w-[300px] max-w-full
        ${alignClass}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5 select-none h-[46px]">
        <div className="flex items-center gap-2 group/lights">
          <button
            onClick={() => updateAttributes({ textAlign: "left" })}
            title="Căn Trái"
            className={`size-3 cursor-pointer rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center overflow-hidden relative shadow-sm hover:scale-110 transition-transform ${currentAlign === "left" ? "ring-1 ring-white/50" : ""}`}
          >
            <AlignLeft
              size={8}
              strokeWidth={3}
              className="text-[#4d0000] opacity-0 group-hover/lights:opacity-100 transition-opacity absolute"
            />
          </button>

          {/* 🟡 VÀNG: Căn Giữa */}
          <button
            onClick={() => updateAttributes({ textAlign: "center" })}
            title="Căn Giữa"
            className={`size-3 cursor-pointer rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center overflow-hidden relative shadow-sm hover:scale-110 transition-transform ${currentAlign === "center" ? "ring-1 ring-white/50" : ""}`}
          >
            <AlignCenter
              size={8}
              strokeWidth={3}
              className="text-[#5c4107] opacity-0 group-hover/lights:opacity-100 transition-opacity absolute"
            />
          </button>

          {/* 🟢 XANH: Căn Phải */}
          <button
            onClick={() => updateAttributes({ textAlign: "right" })}
            title="Căn Phải"
            className={`size-3 cursor-pointer rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center overflow-hidden relative shadow-sm hover:scale-110 transition-transform ${currentAlign === "right" ? "ring-1 ring-white/50" : ""}`}
          >
            <AlignRight
              size={8}
              strokeWidth={3}
              className="text-[#0a3d0f] opacity-0 group-hover/lights:opacity-100 transition-opacity absolute"
            />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group/select">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold text-gray-400 bg-white/5 hover:bg-white/10 hover:text-gray-200 transition-colors cursor-pointer border border-transparent hover:border-white/10">
              <Terminal size={12} />
              <span className="uppercase tracking-wider">
                {node.attrs.language || "AUTO"}
              </span>
              <ChevronDown
                size={10}
                className="opacity-50 group-hover/select:opacity-100"
              />
            </div>
            <select
              contentEditable={false}
              value={node.attrs.language || "auto"}
              onChange={(e) => updateAttributes({ language: e.target.value })}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="null">Auto</option>
              <option disabled>────────</option>
              {languages.map((lang: string) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-white/10 mx-1"></div>

          <button
            onClick={handleFormat}
            disabled={isFormatting}
            className={`p-1.5 rounded transition-all duration-200 ${
              isFormatting
                ? "text-yellow-400 bg-yellow-400/10"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title="Format Code"
          >
            <Wand2 size={14} className={isFormatting ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleCopy}
            className={`p-1.5 rounded transition-all duration-200 ${
              isCopied
                ? "text-green-400 bg-green-400/10"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title="Copy Code"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="relative group/code">
        <pre
          spellCheck="false"
          className="hljs m-0 bg-[#0d1117]! p-5! font-mono! text-[13.5px] leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-blue-500/30 font-medium !text-[#abb2bf]"
          style={{ tabSize: 2 }}
        >
          <NodeViewContent as={"code" as any} />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
