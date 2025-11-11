"use client";

import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface LatexContentRenderProps {
  content: string;
  className?: string;
  border?: boolean;
}

const LatexContentRender: React.FC<LatexContentRenderProps> = ({
  content,
  className = "",
  border = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    if (!content || typeof content !== "string") {
      return;
    }

    const renderContent = (text: string) => {
      const mathExpressions: Array<{
        type: "display" | "inline";
        content: string;
        placeholder: string;
      }> = [];
      let processedText = text;

      // 1. Extract display math $$...$$
      processedText = processedText.replace(
        /\$\$([\s\S]+?)\$\$/g,
        (match, math) => {
          const placeholder = `%%%MATH_DISPLAY_${mathExpressions.length}%%%`;
          mathExpressions.push({
            type: "display",
            content: math.trim(),
            placeholder,
          });
          return placeholder;
        }
      );

      // 2. Extract display math \[...\]
      processedText = processedText.replace(
        /\\\[([\s\S]+?)\\\]/g,
        (match, math) => {
          const placeholder = `%%%MATH_DISPLAY_${mathExpressions.length}%%%`;
          mathExpressions.push({
            type: "display",
            content: math.trim(),
            placeholder,
          });
          return placeholder;
        }
      );

      // 3. Extract display math \begin{equation}...\end{equation}
      processedText = processedText.replace(
        /\\begin\{equation\}([\s\S]+?)\\end\{equation\}/g,
        (match, math) => {
          const placeholder = `%%%MATH_DISPLAY_${mathExpressions.length}%%%`;
          mathExpressions.push({
            type: "display",
            content: math.trim(),
            placeholder,
          });
          return placeholder;
        }
      );

      // 4. Extract display math \begin{align}...\end{align}
      processedText = processedText.replace(
        /\\begin\{align\*?\}([\s\S]+?)\\end\{align\*?\}/g,
        (match, math) => {
          const placeholder = `%%%MATH_DISPLAY_${mathExpressions.length}%%%`;
          mathExpressions.push({
            type: "display",
            content: math.trim(),
            placeholder,
          });
          return placeholder;
        }
      );

      // 5. Extract inline math \(...\)
      processedText = processedText.replace(
        /\\\(([\s\S]+?)\\\)/g,
        (match, math) => {
          const placeholder = `%%%MATH_INLINE_${mathExpressions.length}%%%`;
          mathExpressions.push({
            type: "inline",
            content: math.trim(),
            placeholder,
          });
          return placeholder;
        }
      );

      // 6. Extract inline math $...$
      processedText = processedText.replace(
        /\$([^\s$][^$]*?[^\s$]|\S)\$/g,
        (match, math) => {
          const placeholder = `%%%MATH_INLINE_${mathExpressions.length}%%%`;
          mathExpressions.push({
            type: "inline",
            content: math.trim(),
            placeholder,
          });
          return placeholder;
        }
      );

      // Convert LaTeX text formatting to HTML
      // \textbf{...} → <strong>...</strong>
      processedText = processedText.replace(
        /\\textbf\{([^}]+)\}/g,
        "<strong>$1</strong>"
      );

      // \textit{...} → <em>...</em>
      processedText = processedText.replace(
        /\\textit\{([^}]+)\}/g,
        "<em>$1</em>"
      );

      // \underline{...} → <u>...</u>
      processedText = processedText.replace(
        /\\underline\{([^}]+)\}/g,
        "<u>$1</u>"
      );

      // \section{...} → <h2>...</h2>
      processedText = processedText.replace(
        /\\section\{([^}]+)\}/g,
        "<h2>$1</h2>"
      );

      // \subsection{...} → <h3>...</h3>
      processedText = processedText.replace(
        /\\subsection\{([^}]+)\}/g,
        "<h3>$1</h3>"
      );

      // \subsubsection{...} → <h4>...</h4>
      processedText = processedText.replace(
        /\\subsubsection\{([^}]+)\}/g,
        "<h4>$1</h4>"
      );

      // \begin{itemize}...\end{itemize} → <ul>...</ul>
      processedText = processedText.replace(
        /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g,
        (match, content) => {
          const items = content
            .split(/\\item\s+/)
            .filter((item: string) => item.trim())
            .map((item: string) => `<li>${item.trim()}</li>`)
            .join("");
          return `<ul>${items}</ul>`;
        }
      );

      // \begin{enumerate}...\end{enumerate} → <ol>...</ol>
      processedText = processedText.replace(
        /\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g,
        (match, content) => {
          const items = content
            .split(/\\item\s+/)
            .filter((item: string) => item.trim())
            .map((item: string) => `<li>${item.trim()}</li>`)
            .join("");
          return `<ol>${items}</ol>`;
        }
      );

      // \\ (line break) → <br>
      processedText = processedText.replace(/\\\\/g, "<br>");

      // \par (paragraph break) → <br><br>
      processedText = processedText.replace(/\\par\s*/g, "<br><br>");

      // Double newlines → <p> tags
      processedText = processedText
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p) => `<p>${p.trim()}</p>`)
        .join("");

      // Replace math placeholders with span tags
      mathExpressions.forEach((math) => {
        const spanTag = `<span class="math-${
          math.type
        }" data-math="${encodeURIComponent(math.content)}"></span>`;
        processedText = processedText.split(math.placeholder).join(spanTag);
      });

      // Insert HTML into container
      container.innerHTML = processedText;

      // Render math with KaTeX
      const mathElements = container.querySelectorAll(
        ".math-display, .math-inline"
      );

      mathElements.forEach((el) => {
        const mathContent = decodeURIComponent(
          el.getAttribute("data-math") || ""
        );
        const isDisplay = el.classList.contains("math-display");

        try {
          katex.render(mathContent, el as HTMLElement, {
            displayMode: isDisplay,
            throwOnError: false,
            output: "html",
            trust: true,
            strict: false,
            fleqn: false, // Left align equations
            maxSize: Infinity,
            maxExpand: 1000,
            macros: {
              "\\R": "\\mathbb{R}",
              "\\N": "\\mathbb{N}",
              "\\Z": "\\mathbb{Z}",
              "\\Q": "\\mathbb{Q}",
              "\\C": "\\mathbb{C}",
            },
          });
        } catch (error) {
          console.error("KaTeX render error:", error, "Math:", mathContent);
          el.textContent = isDisplay
            ? `$$${mathContent}$$`
            : `$${mathContent}$`;
          (el as HTMLElement).className += " text-red-500 font-mono text-sm";
        }
      });
    };

    renderContent(content);
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`${
        border
          ? "border border-slate-200 dark:border-slate-800 p-4 rounded-lg"
          : ""
      } leading-relaxed max-w-none text-sm md:text-lg
    overflow-x-auto
    [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden
    [&_.katex-display]:max-w-full
    [&_.katex]:text-xs sm:[&_.katex]:text-sm md:[&_.katex]:text-base
    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100
    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-4 [&_h3]:text-slate-900 dark:[&_h3]:text-slate-100
    [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-slate-900 dark:[&_h4]:text-slate-100
    [&_p]:mb-4 [&_p]:text-slate-800 dark:[&_p]:text-slate-300
    [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100
    [&_em]:italic [&_em]:text-slate-800 dark:[&_em]:text-slate-200
    [&_u]:underline
    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
    [&_li]:mb-2 [&_li]:text-slate-800 dark:[&_li]:text-slate-300
    ${className}`}
    />
  );
};

export default LatexContentRender;
