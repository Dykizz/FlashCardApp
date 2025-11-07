"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface GifDisplayProps {
  type: "correct" | "incorrect";
  show: boolean;
  className?: string;
}

const GIF_EMBEDS = {
  correct: [
    "https://gifer.com/embed/Aq", // https://i.gifer.com/Aq.gif - Thumbs up
    "https://gifer.com/embed/5e1", // https://i.gifer.com/5e1.gif - Yeah
    "https://gifer.com/embed/2DV", // https://i.gifer.com/2DV.gif - High five
    "https://gifer.com/embed/fxSL", // https://i.gifer.com/fxSL.gif - Champion
    "https://gifer.com/embed/i9", // https://i.gifer.com/i9.gif - Victory
    "https://gifer.com/embed/Bt4", // https://i.gifer.com/Bt4.gif - Success
  ],
  incorrect: [
    "https://gifer.com/embed/1ze3", // https://i.gifer.com/1ze3.gif - Facepalm
    "https://gifer.com/embed/1vms", // https://i.gifer.com/1vms.gif - Confused
    "https://gifer.com/embed/Elga", // https://i.gifer.com/Elga.gif - Oops
    "https://gifer.com/embed/xC5", // https://i.gifer.com/xC5.gif - Try again
    "https://gifer.com/embed/2yOW", // https://i.gifer.com/2yOW.gif - Oh no
  ],
};

function getRandomGif(type: "correct" | "incorrect"): string {
  const gifs = GIF_EMBEDS[type];
  return gifs[Math.floor(Math.random() * gifs.length)];
}

export function GifDisplay({ type, show, className }: GifDisplayProps) {
  const [gifUrl, setGifUrl] = useState("");

  useEffect(() => {
    if (show) {
      const gif = getRandomGif(type);
      console.log("Selected GIF URL:", gif);
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
