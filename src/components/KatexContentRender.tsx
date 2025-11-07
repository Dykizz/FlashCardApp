"use client";

import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface KatexContentRenderProps {
  content: string;
  className?: string;
  border?: boolean;
}

const KatexContentRender: React.FC<KatexContentRenderProps> = ({
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

    const renderContent = async (text: string) => {
      // Step 1: Extract math expressions and replace with placeholders
      const mathExpressions: Array<{
        type: "display" | "inline";
        content: string;
      }> = [];
      let processedText = text;

      // Extract display math $$...$$
      processedText = processedText.replace(
        /\$\$([\s\S]+?)\$\$/g,
        (match, math) => {
          const index = mathExpressions.length;
          mathExpressions.push({ type: "display", content: math });
          return `__MATH_DISPLAY_${index}__`;
        }
      );

      // Extract inline math \(...\)
      processedText = processedText.replace(
        /\\\(([\s\S]+?)\\\)/g,
        (match, math) => {
          const index = mathExpressions.length;
          mathExpressions.push({ type: "inline", content: math });
          return `__MATH_INLINE_${index}__`;
        }
      );

      // Extract inline math $...$
      processedText = processedText.replace(
        /\$([^\s$][^$]*?)\$/g,
        (match, math) => {
          const isMathContent = (content: string): boolean => {
            const mathChars = /[\\^_{}[\]]/;
            const mathCommands =
              /\\(frac|sqrt|sum|int|lim|infty|alpha|beta|gamma|theta|pi|sin|cos|tan|log|exp|cdot|times|div|pm|leq|geq|neq|approx|equiv)/;
            return mathChars.test(content) || mathCommands.test(content);
          };

          if (
            isMathContent(math) &&
            math.length < 200 &&
            !math.includes("<br/>") &&
            !/\s{3,}/.test(math)
          ) {
            const index = mathExpressions.length;
            mathExpressions.push({ type: "inline", content: math });
            return `__MATH_INLINE_${index}__`;
          }
          return match; // Keep as text if not math
        }
      );

      // Extract display math \[...\]
      processedText = processedText.replace(
        /\\\[([\s\S]+?)\\\]/g,
        (match, math) => {
          const index = mathExpressions.length;
          mathExpressions.push({ type: "display", content: math });
          return `__MATH_DISPLAY_${index}__`;
        }
      );

      // Step 2: Parse markdown
      let htmlContent = await marked.parse(processedText);

      // Step 3: Sanitize HTML
      htmlContent = DOMPurify.sanitize(htmlContent);

      // Step 4: Restore math expressions
      mathExpressions.forEach((math, index) => {
        const placeholder =
          math.type === "display"
            ? `__MATH_DISPLAY_${index}__`
            : `__MATH_INLINE_${index}__`;

        htmlContent = htmlContent.replace(
          new RegExp(placeholder, "g"),
          `<span class="math-${math.type}" data-math="${encodeURIComponent(
            math.content
          )}"></span>`
        );
      });

      // Step 5: Insert HTML into container
      container.innerHTML = htmlContent;

      // Step 6: Render math with KaTeX
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
          });
        } catch (error) {
          console.error("KaTeX render error:", error);
          el.textContent = isDisplay
            ? `$$${mathContent}$$`
            : `$${mathContent}$`;
          el.className += " text-red-500 font-mono text-sm";
        }
      });
    };

    renderContent(content);
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`${
        border ? "border p-2 rounded" : ""
      } leading-relaxed prose prose-sm dark:prose-invert max-w-none ${className}`}
    />
  );
};

export default KatexContentRender;
