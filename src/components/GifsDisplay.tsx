"use client";

import { cn } from "@/lib/utils";
import { gifManager } from "@/utils/gifManager";
import { useEffect, useState } from "react";

interface GifDisplayProps {
  type: "correct" | "incorrect";
  show: boolean;
  className?: string;
}

export function GifDisplay({ type, show, className }: GifDisplayProps) {
  const [gifUrl, setGifUrl] = useState("");

  useEffect(() => {
    if (show) {
      const gif = gifManager.getRandomGif(type);
      setGifUrl(gif);
    }
  }, [show, type]);

  if (!show) {
    return (
      <div className="hidden lg:block lg:w-64 xl:w-80">{/* Placeholder */}</div>
    );
  }

  if (!gifUrl) return null;

  return (
    <div className={cn("hidden lg:block lg:w-64 xl:w-80 ", className)}>
      <div
        className={`
    rounded-xl overflow-hidden shadow-2xl border-4
    ${type === "correct" ? "border-green-400" : "border-red-400"}
  `}
      >
        {/* ⭐ Flex container để center iframe */}
        <div
          className="relative w-full flex items-center justify-center bg-slate-900"
          style={{ paddingTop: "56.2%" }}
        >
          <iframe
            src={gifUrl}
            className="absolute inset-0 m-auto max-w-full max-h-full"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title={type === "correct" ? "Success GIF" : "Try again GIF"}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
