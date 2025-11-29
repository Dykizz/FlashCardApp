// "use client";

// import React, { useEffect, useRef } from "react";
// import katex from "katex";
// import "katex/dist/katex.min.css";
// import { marked } from "marked";
// import DOMPurify from "dompurify";

// interface KatexContentRenderProps {
//   content: string;
//   className?: string;
//   border?: boolean;
// }

// const KatexContentRender: React.FC<KatexContentRenderProps> = ({
//   content,
//   className = "",
//   border = true,
// }) => {
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     const container = containerRef.current;
//     container.innerHTML = "";

//     if (!content || typeof content !== "string") {
//       return;
//     }

//     const renderContent = async (text: string) => {
//       const mathExpressions: Array<{
//         type: "display" | "inline";
//         content: string;
//       }> = [];
//       let processedText = text;

//       // Extract math expressions
//       processedText = processedText.replace(
//         /\$\$([\s\S]+?)\$\$/g,
//         (match, math) => {
//           const index = mathExpressions.length;
//           mathExpressions.push({ type: "display", content: math.trim() });
//           return `%%%MATH_DISPLAY_${index}%%%`; // ⭐ Dùng %%% thay vì __
//         }
//       );

//       processedText = processedText.replace(
//         /\\\[([\s\S]+?)\\\]/g,
//         (match, math) => {
//           const index = mathExpressions.length;
//           mathExpressions.push({ type: "display", content: math.trim() });
//           return `%%%MATH_DISPLAY_${index}%%%`;
//         }
//       );

//       processedText = processedText.replace(
//         /\\\(([\s\S]+?)\\\)/g,
//         (match, math) => {
//           const index = mathExpressions.length;
//           mathExpressions.push({ type: "inline", content: math.trim() });
//           return `%%%MATH_INLINE_${index}%%%`;
//         }
//       );

//       processedText = processedText.replace(
//         /\$([^\s$][^$]*?[^\s$]|\S)\$/g,
//         (match, math) => {
//           const isMathContent = (content: string): boolean => {
//             const mathChars = /[\\^_{}[\]]/;
//             const mathCommands =
//               /\\(frac|sqrt|sum|int|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|sin|cos|tan|log|exp|ln|cdot|times|div|pm|mp|leq|geq|neq|equiv|approx|subset|subseteq|in|notin|cup|cap|emptyset|forall|exists|neg|wedge|vee|rightarrow|Rightarrow|leftarrow|Leftarrow|leftrightarrow|Leftrightarrow|to)/;
//             const greekLetters =
//               /\\(Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi|Omega)/;

//             return (
//               mathChars.test(content) ||
//               mathCommands.test(content) ||
//               greekLetters.test(content)
//             );
//           };

//           if (
//             isMathContent(math) &&
//             math.length < 500 &&
//             !math.includes("<br/>") &&
//             !/\s{3,}/.test(math)
//           ) {
//             const index = mathExpressions.length;
//             mathExpressions.push({ type: "inline", content: math.trim() });
//             return `%%%MATH_INLINE_${index}%%%`;
//           }
//           return match;
//         }
//       );

//       marked.setOptions({
//         breaks: true,
//         gfm: true,
//       });

//       let htmlContent = await marked.parse(processedText);

//       // ⭐ Replace trong HTML (kể cả khi bị wrap trong tags)
//       mathExpressions.forEach((math, index) => {
//         const placeholder =
//           math.type === "display"
//             ? `%%%MATH_DISPLAY_${index}%%%`
//             : `%%%MATH_INLINE_${index}%%%`;

//         // ⭐ Use simple string replace (no regex needed with %%%)
//         const spanTag = `<span class="math-${
//           math.type
//         }" data-math="${encodeURIComponent(math.content)}"></span>`;

//         // ⭐ Replace all occurrences globally
//         htmlContent = htmlContent.split(placeholder).join(spanTag);
//       });

//       htmlContent = DOMPurify.sanitize(htmlContent, {
//         ADD_TAGS: ["span"],
//         ADD_ATTR: ["class", "data-math"],
//       });

//       container.innerHTML = htmlContent;

//       // Render math với KaTeX
//       const mathElements = container.querySelectorAll(
//         ".math-display, .math-inline"
//       );

//       mathElements.forEach((el) => {
//         const mathContent = decodeURIComponent(
//           el.getAttribute("data-math") || ""
//         );
//         const isDisplay = el.classList.contains("math-display");

//         try {
//           katex.render(mathContent, el as HTMLElement, {
//             displayMode: isDisplay,
//             throwOnError: false,
//             output: "html",
//             trust: true,
//             strict: false,
//             macros: {
//               "\\R": "\\mathbb{R}",
//               "\\N": "\\mathbb{N}",
//               "\\Z": "\\mathbb{Z}",
//               "\\Q": "\\mathbb{Q}",
//             },
//           });
//         } catch (error) {
//           console.error("KaTeX render error:", error, "Math:", mathContent);
//           el.textContent = isDisplay
//             ? `$$${mathContent}$$`
//             : `$${mathContent}$`;
//           (el as HTMLElement).className += " text-red-500 font-mono text-sm";
//         }
//       });
//     };

//     renderContent(content);
//   }, [content]);

//   return (
//     <div
//       ref={containerRef}
//       className={`${
//         border ? "border rounded-lg p-3" : ""
//       } leading-relaxed max-w-none
// text-slate-900 dark:text-slate-100
// [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100
// [&_h3]:text-slate-900 dark:[&_h3]:text-slate-100
// [&_p]:text-slate-900 dark:[&_p]:text-slate-100
// [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100
// [&_li]:text-slate-900 dark:[&_li]:text-slate-100
// ${className}`}
//     />
//   );
// };

// export default KatexContentRender;
"use client";

import React, { useEffect, useRef } from "react";
import "katex/dist/katex.min.css";
import DOMPurify from "dompurify";
import katex from "katex";
import { marked } from "marked";

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
      const mathExpressions: Array<{
        type: "display" | "inline";
        content: string;
      }> = [];
      let processedText = text;

      // Extract math expressions
      processedText = processedText.replace(
        /\$\$([\s\S]+?)\$\$/g,
        (match, math) => {
          const index = mathExpressions.length;
          mathExpressions.push({ type: "display", content: math.trim() });
          return `%%%MATH_DISPLAY_${index}%%%`; // ⭐ Dùng %%% thay vì __
        }
      );

      processedText = processedText.replace(
        /\\\[([\s\S]+?)\\\]/g,
        (match, math) => {
          const index = mathExpressions.length;
          mathExpressions.push({ type: "display", content: math.trim() });
          return `%%%MATH_DISPLAY_${index}%%%`;
        }
      );

      processedText = processedText.replace(
        /\\\(([\s\S]+?)\\\)/g,
        (match, math) => {
          const index = mathExpressions.length;
          mathExpressions.push({ type: "inline", content: math.trim() });
          return `%%%MATH_INLINE_${index}%%%`;
        }
      );

      processedText = processedText.replace(
        /\$([^\s$][^$]*?[^\s$]|\S)\$/g,
        (match, math) => {
          const isMathContent = (content: string): boolean => {
            const mathChars = /[\\^_{}[\]]/;
            const mathCommands =
              /\\(frac|sqrt|sum|int|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|sin|cos|tan|log|exp|ln|cdot|times|div|pm|mp|leq|geq|neq|equiv|approx|subset|subseteq|in|notin|cup|cap|emptyset|forall|exists|neg|wedge|vee|rightarrow|Rightarrow|leftarrow|Leftarrow|leftrightarrow|Leftrightarrow|to)/;
            const greekLetters =
              /\\(Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi|Omega)/;

            return (
              mathChars.test(content) ||
              mathCommands.test(content) ||
              greekLetters.test(content)
            );
          };

          if (
            isMathContent(math) &&
            math.length < 500 &&
            !math.includes("<br/>") &&
            !/\s{3,}/.test(math)
          ) {
            const index = mathExpressions.length;
            mathExpressions.push({ type: "inline", content: math.trim() });
            return `%%%MATH_INLINE_${index}%%%`;
          }
          return match;
        }
      );

      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      let htmlContent = await marked.parse(processedText);

      // ⭐ Replace trong HTML (kể cả khi bị wrap trong tags)
      mathExpressions.forEach((math, index) => {
        const placeholder =
          math.type === "display"
            ? `%%%MATH_DISPLAY_${index}%%%`
            : `%%%MATH_INLINE_${index}%%%`;

        // ⭐ Use simple string replace (no regex needed with %%%)
        const spanTag = `<span class="math-${
          math.type
        }" data-math="${encodeURIComponent(math.content)}"></span>`;

        // ⭐ Replace all occurrences globally
        htmlContent = htmlContent.split(placeholder).join(spanTag);
      });

      htmlContent = DOMPurify.sanitize(htmlContent, {
        ADD_TAGS: ["span"],
        ADD_ATTR: ["class", "data-math"],
      });

      container.innerHTML = htmlContent;

      // Render math với KaTeX
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
            macros: {
              "\\R": "\\mathbb{R}",
              "\\N": "\\mathbb{N}",
              "\\Z": "\\mathbb{Z}",
              "\\Q": "\\mathbb{Q}",
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
        border ? "border rounded-lg p-3" : ""
      } leading-relaxed max-w-none
text-slate-900 dark:text-slate-100
[&_h2]:text-slate-900 dark:[&_h2]:text-slate-100
[&_h3]:text-slate-900 dark:[&_h3]:text-slate-100
[&_p]:text-slate-900 dark:[&_p]:text-slate-100
[&_strong]:text-slate-900 dark:[&_strong]:text-slate-100
[&_li]:text-slate-900 dark:[&_li]:text-slate-100
${className}`}
    />
  );
};

export default KatexContentRender;
