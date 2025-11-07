import { FlashCardBase } from "@/types/flashCard.type";
import React from "react";
import { BookOpen, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FlashCardProps {
  card: FlashCardBase;
}

const FlashCard: React.FC<FlashCardProps> = ({ card }) => {
  const { title, description, totalQuestion, peopleLearned, subject, _id } =
    card;

  return (
    <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full bg-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant="secondary"
            className="
              bg-green-100 text-green-800 border border-green-200
              hover:bg-green-200 hover:text-green-900
              dark:bg-green-900/20 dark:text-green-400 dark:border-green-800
              transition-colors duration-200
              font-medium text-xs uppercase tracking-wide
              px-2 py-1
            "
          >
            {subject}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-3">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardFooter className="pt-0 mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{totalQuestion} Câu hỏi</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{peopleLearned.toLocaleString()} Người đã học</span>
          </div>
        </div>
        <Link href={`/flashcards/${_id}`} className="w-full ">
          <Button className="w-full cursor-pointer">Bắt đầu</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default FlashCard;
