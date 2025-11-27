"use client";

import React from "react";
import parse, { Element, domToReact, DOMNode } from "html-react-parser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 1. Định nghĩa Map màu sắc ra ngoài để dễ quản lý và tái sử dụng
const COLOR_MAP: Record<string, string> = {
  grammar:
    "bg-red-100 text-red-700 decoration-red-500 dark:bg-red-900/40 dark:text-red-300 dark:decoration-red-400",
  vocab:
    "bg-yellow-100 text-yellow-700 decoration-yellow-500 dark:bg-yellow-900/40 dark:text-yellow-300 dark:decoration-yellow-400",
  spelling:
    "bg-purple-100 text-purple-700 decoration-purple-500 dark:bg-purple-900/40 dark:text-purple-300 dark:decoration-purple-400",
  missing:
    "bg-slate-200 text-slate-700 decoration-slate-500 border border-dashed border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
  default:
    "bg-red-100 text-red-700 decoration-red-500 dark:bg-red-900/40 dark:text-red-300 dark:decoration-red-400",
};

// Hàm helper để lấy class màu dựa trên loại lỗi
const getColorClass = (type: string): string => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("vocab")) return COLOR_MAP.vocab;
  if (lowerType.includes("spelling")) return COLOR_MAP.spelling;
  if (lowerType.includes("missing")) return COLOR_MAP.missing;
  if (lowerType.includes("grammar")) return COLOR_MAP.grammar;
  return COLOR_MAP.default;
};

const FeedbackHighlighter = ({ htmlString }: { htmlString: string }) => {
  const options = {
    replace: (domNode: DOMNode) => {
      // Kiểm tra xem node có phải là thẻ <mark> không
      if (domNode instanceof Element && domNode.name === "mark") {
        const type = domNode.attribs.type || "Error";
        const colorClass = getColorClass(type);

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`mx-0.5 px-1.5 rounded font-semibold cursor-pointer underline decoration-wavy decoration-2 underline-offset-4 transition-colors ${colorClass}`}
                >
                  {domToReact(domNode.children as DOMNode[], options)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-none shadow-xl">
                <p className="capitalize font-bold text-xs">{type}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
  };

  return (
    <div className="text-lg leading-loose font-medium text-slate-800 dark:text-slate-200">
      {parse(htmlString, options)}
    </div>
  );
};

export default FeedbackHighlighter;
