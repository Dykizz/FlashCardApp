"use client";

import React, { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Hints, WordType } from "@/types/sourceArticle.type";
import { Button } from "@/components/ui/button";

export const WordTypeLabels: Record<WordType, string> = {
  [WordType.NOUN]: "Noun",
  [WordType.VERB]: "Verb",
  [WordType.ADJECTIVE]: "Adj",
  [WordType.ADVERB]: "Adv",
  [WordType.PRONOUN]: "Pron",
  [WordType.PREPOSITION]: "Prep",
  [WordType.CONJUNCTION]: "Conj",
  [WordType.DETERMINER]: "Det",
  [WordType.PHRASAL_VERB]: "Phrasal Verb",
  [WordType.IDIOM]: "Idiom",
  [WordType.COLLOCATION]: "Collocation",
  [WordType.PHRASE]: "Phrase",
  [WordType.PREFIX]: "Prefix",
  [WordType.SUFFIX]: "Suffix",
};

interface HintBoxProps {
  hints?: Hints;
  className?: string;
}

const getBadgeStyle = (type?: WordType) => {
  switch (type) {
    case WordType.VERB:
    case WordType.PHRASAL_VERB:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case WordType.NOUN:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case WordType.ADJECTIVE:
    case WordType.ADVERB:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case WordType.IDIOM:
    case WordType.COLLOCATION:
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
};

export const HintBox: React.FC<HintBoxProps> = ({ hints, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasVocab = hints?.vocabulary && hints.vocabulary.length > 0;
  const hasStruct = hints?.structures && hints.structures.length > 0;

  if (!hasVocab && !hasStruct) return null;

  return (
    <div className={cn("mt-2", className)}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className={cn(
          "gap-2 transition-all duration-300 border",
          isOpen
            ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700" // Style khi Active
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800" // Style mặc định
        )}
      >
        <Lightbulb className={cn("w-4 h-4", isOpen && "fill-current")} />
        {isOpen ? "Ẩn gợi ý" : "Xem gợi ý"}
      </Button>

      {isOpen && (
        <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <Tabs defaultValue={hasVocab ? "vocab" : "struct"} className="w-full">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <TabsList className="h-7 bg-slate-200/50 dark:bg-slate-800 p-0.5 rounded-md">
                <TabsTrigger
                  value="vocab"
                  disabled={!hasVocab}
                  className="h-full text-[10px] px-3 rounded-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm"
                >
                  Từ vựng ({hints?.vocabulary.length})
                </TabsTrigger>
                <TabsTrigger
                  value="struct"
                  disabled={!hasStruct}
                  className="h-full text-[10px] px-3 rounded-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm"
                >
                  Ngữ pháp ({hints?.structures?.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Nội dung Tab Từ vựng */}
            <TabsContent
              value="vocab"
              className="m-0 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {hints?.vocabulary.map((vocab, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md p-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {vocab.word}
                    </span>
                    {vocab.type && (
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase px-1 rounded border",
                          getBadgeStyle(vocab.type)
                        )}
                      >
                        {WordTypeLabels[vocab.type] || vocab.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {vocab.meaning}
                  </p>
                </div>
              ))}
            </TabsContent>

            {/* Nội dung Tab Ngữ pháp */}
            <TabsContent value="struct" className="m-0 p-3 flex flex-col gap-2">
              {hints?.structures?.map((struct, idx) => (
                <div
                  key={idx}
                  className="pl-3 border-l-2 border-purple-400 bg-white dark:bg-slate-900 rounded-r-md p-2.5 shadow-sm"
                >
                  <p className="font-semibold text-purple-700 dark:text-purple-400 text-sm">
                    {struct.structure}
                  </p>
                  <p className="text-sm text-slate-500 italic mt-1">
                    {struct.usage}
                  </p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
