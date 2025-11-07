import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Question } from "@/types/question.type";
import KatexContentRender from "@/components/KatexContentRender";

interface FlashcardProps {
  card: Question;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  feedbackState: "idle" | "correct" | "incorrect";
  index: number;
}

const CorrectIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-green-500"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  selectedOption,
  onSelectOption,
  feedbackState,
  index,
}) => {
  const getOptionClasses = (index: number) => {
    const baseClasses =
      "flex items-center justify-between w-full p-4 rounded-lg border text-left transition-all duration-200";
    const isSelected = index === selectedOption;
    const isCorrectAnswer = index === card.correctAnswer;

    if (feedbackState === "correct") {
      if (isCorrectAnswer) {
        return `${baseClasses} bg-green-100 dark:bg-green-900/50 border-green-500 text-slate-900 dark:text-slate-50 cursor-not-allowed`;
      }
      return `${baseClasses} bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed`;
    }

    if (feedbackState === "incorrect") {
      if (isSelected) {
        return `${baseClasses} bg-red-100 dark:bg-red-900/50 border-red-500 text-slate-900 dark:text-slate-50 animate-shake cursor-not-allowed`;
      }
      return `${baseClasses} bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed`;
    }

    // Idle state
    return `${baseClasses} bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer`;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md md:text-lg font-semibold leading-tight">
            <KatexContentRender
              content={`Câu ${index || ""}: ${card.content}`}
              border={false}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {card.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onSelectOption(index)}
                disabled={feedbackState !== "idle"}
                className={getOptionClasses(index)}
              >
                <KatexContentRender content={option} border={false} />
                {feedbackState === "correct" &&
                  index === card.correctAnswer && <CorrectIcon />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      {feedbackState === "correct" && card.explanation && (
        <Card className="w-full mt-4">
          <CardContent className="bg-green-100 dark:bg-green-900/50 border-t border-slate-200 dark:border-slate-800 rounded-xl ">
            <h4 className="font-bold text-green-800 dark:text-green-200 mt-4">
              Giải thích:
            </h4>
            <KatexContentRender
              content={card.explanation}
              border={false}
              className="mt-2 text-green-900 dark:text-green-300"
            />
          </CardContent>
        </Card>
      )}
    </>
  );
};
