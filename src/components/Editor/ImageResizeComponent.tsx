"use client";

import { NodeViewWrapper } from "@tiptap/react";
import React, { useState, useEffect } from "react";
import { Resizable } from "re-resizable";

export default function ImageResizeComponent(props: any) {
  const { node, updateAttributes, selected } = props;

  const initialWidth = node.attrs.width;
  const initialHeight = node.attrs.height;

  const [currentSize, setCurrentSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const [isResizing, setIsResizing] = useState(false);
  const textAlign = node.attrs.textAlign || "center";

  let alignClass = "align-center";
  if (textAlign === "left") alignClass = "align-left";
  if (textAlign === "right") alignClass = "align-right";

  useEffect(() => {
    setCurrentSize({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight]);

  return (
    <NodeViewWrapper className={`image-resizer-wrapper ${alignClass} group`}>
      <Resizable
        size={{ width: currentSize.width, height: currentSize.height }}
        onResizeStart={() => setIsResizing(true)}
        onResize={(e, direction, ref) => {
          setCurrentSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        }}
        onResizeStop={(e, direction, ref) => {
          setIsResizing(false);
          updateAttributes({
            width: ref.style.width,
            height: ref.style.height,
          });
        }}
        enable={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
        lockAspectRatio={false}
        className={`relative transition-all ${
          selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        }`}
      >
        <div
          className={`absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded pointer-events-none z-50 transition-opacity duration-200 ${
            isResizing || selected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {parseInt(String(currentSize.width))} x{" "}
          {parseInt(String(currentSize.height))} px
        </div>

        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          className="w-full h-full object-fill rounded-md"
        />
      </Resizable>
    </NodeViewWrapper>
  );
}
