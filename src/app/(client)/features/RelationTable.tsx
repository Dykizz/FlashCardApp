import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RelationTableProps {
  relations: string[];
  addRelation: () => void;
  removeRelation: (index: number) => void;
  updateRelation: (index: number, value: string) => void;
  clearAllRelations: () => void;
  isSolved: boolean;
}

const RelationTable: React.FC<RelationTableProps> = ({
  relations,
  addRelation,
  removeRelation,
  updateRelation,
  clearAllRelations,
  isSolved,
}) => {
  return (
    <Card className="xl:col-span-1 flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Lược đồ phân rã</span>
          <Badge variant="secondary">{relations.length}</Badge>
        </CardTitle>

        <CardDescription>Nhập các lược đồ con (Ví dụ: ABC, BD)</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 flex-1">
        {relations.map((rel, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="w-8 h-8 flex items-center justify-center shrink-0"
              >
                {index + 1}
              </Badge>

              <div className="flex-1">
                <Input
                  value={rel}
                  onChange={(e) => updateRelation(index, e.target.value)}
                  placeholder={index === 0 ? "ABC" : index === 1 ? "BD" : "..."}
                  className="text-center placeholder:text-slate-400 font-mono uppercase"
                  disabled={isSolved}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRelation(index)}
                disabled={relations.length <= 1}
                className="cursor-pointer hover:bg-red-600 hover:text-white shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-2">
        <Button
          variant="outline"
          className="cursor-pointer "
          onClick={addRelation}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm lược đồ con
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer hover:bg-red-600 hover:text-white"
          onClick={clearAllRelations}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa tất cả
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RelationTable;
