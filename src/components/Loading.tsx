interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loading({
  message = "Đang tải...",
  size = "md",
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Spinner */}
      <div className="relative mb-4">
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-slate-200 dark:border-slate-800`}
        />
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0`}
        />
      </div>

      {/* Message */}
      <p className={`${textSizes[size]} text-muted-foreground font-medium`}>
        {message}
      </p>
    </div>
  );
}
