import { toast } from "sonner";
import React, { ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ShowToastOptions {
  title: ReactNode;
  description?: ReactNode;
  type?: ToastType;
  duration?: number;
}

export function showToast({
  title,
  description,
  type = "info",
  duration = 3000,
}: ShowToastOptions) {
  const typeClassMap: Record<ToastType, string> = {
    success: "bg-success text-success-foreground",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-primary text-primary-foreground",
    warning: "bg-yellow-500 text-yellow-50",
  };

  const baseClass =
    "rounded-md px-4 py-3 shadow-lg w-[90vw] sm:w-[360px] md:w-[400px]";

  const finalClass = `${typeClassMap[type]} ${baseClass}`;

  const titleContent = (
    <span className="text-sm md:text-base font-semibold">{title}</span>
  );

  const options = {
    description: description ? (
      <span className="text-xs md:text-sm ">{description}</span>
    ) : undefined,
    duration,
    className: finalClass,
  };

  if (type === "success") {
    toast.success(titleContent, options);
  } else if (type === "error") {
    toast.error(titleContent, options);
  } else if (type === "warning") {
    toast.warning(titleContent, options);
  } else {
    toast.info(titleContent, options);
  }
}
