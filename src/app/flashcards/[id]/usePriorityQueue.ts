import { useState, useCallback, useMemo, useEffect } from "react";
import { Question } from "@/types/question.type";
import { ProgressItem } from "@/types/flashCard.type";

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function usePriorityQueue(
  questions: Question[],
  progressItems: ProgressItem[],
  isInfiniteLoop: boolean
) {
  const [localProgress, setLocalProgress] = useState<Map<string, number>>(
    () => {
      const map = new Map<string, number>();
      if (progressItems && progressItems.length > 0) {
        progressItems.forEach((p) => {
          map.set(p.questionId, p.weight);
        });
      }
      return map;
    }
  );

  const [seenQuestions, setSeenQuestions] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionVersion, setQuestionVersion] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);

  // ⭐ State thay vì ref để trigger re-render
  const [frozenQueue, setFrozenQueue] = useState<Question[]>([]);

  const mergedProgress = useMemo(() => {
    const map = new Map(localProgress);

    if (map.size === 0 && progressItems && progressItems.length > 0) {
      progressItems.forEach((p) => {
        map.set(p.questionId, p.weight);
      });
    }

    return map;
  }, [localProgress, progressItems]);

  // ⭐ Build priority queue
  const priorityQueue = useMemo(() => {
    if (questions.length === 0) return [];

    if (!isInfiniteLoop) {
      return questions;
    }

    const priorityQuestions = questions.map((q) => ({
      ...q,
      weight: mergedProgress.get(q._id) || 0,
    }));

    return priorityQuestions.sort((a, b) => {
      if (a.weight === 0 && b.weight !== 0) return -1;
      if (a.weight !== 0 && b.weight === 0) return 1;
      if (a.weight !== b.weight) return a.weight - b.weight;

      const hashA = hashCode(a._id + questionVersion);
      const hashB = hashCode(b._id + questionVersion);
      return hashA - hashB;
    });
  }, [questions, mergedProgress, isInfiniteLoop, questionVersion]);

  useEffect(() => {
    if (priorityQueue.length > 0) {
      setFrozenQueue([...priorityQueue]);
    }
  }, [questionVersion, priorityQueue.length]);

  const currentQuestion = useMemo(() => {
    if (frozenQueue.length === 0) return null;

    if (!isInfiniteLoop) {
      return frozenQueue[currentIndex] || null;
    }
    return frozenQueue[0] || null;
  }, [frozenQueue, currentIndex, isInfiniteLoop]);

  const updateWeight = useCallback((questionId: string, isCorrect: boolean) => {
    setLocalProgress((prev) => {
      const newMap = new Map(prev);
      const currentWeight = newMap.get(questionId) || 0;

      if (isCorrect) {
        newMap.set(questionId, Math.min(currentWeight + 1, 10));
      } else {
        newMap.set(questionId, Math.max(currentWeight - 2, 0));
      }

      return newMap;
    });

    setSeenQuestions((prev) => new Set(prev).add(questionId));
  }, []);

  const goToNext = useCallback(() => {
    setQuestionNumber((prev) => prev + 1);

    setQuestionVersion((v) => v + 1);

    if (!isInfiniteLoop) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        return true;
      }
      return false;
    }

    return true;
  }, [currentIndex, questions.length, isInfiniteLoop]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setSeenQuestions(new Set());
    setQuestionVersion(0);
    setQuestionNumber(1);
    setFrozenQueue([]);
  }, []);

  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    const seenCount = seenQuestions.size;

    return {
      totalQuestions,
      seenCount,
      progress: totalQuestions > 0 ? (seenCount / totalQuestions) * 100 : 0,
    };
  }, [questions.length, seenQuestions]);

  return {
    currentQuestion,
    updateWeight,
    goToNext,
    reset,
    stats,
    localProgress: mergedProgress,
    questionNumber,
  };
}
