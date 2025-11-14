import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SolveButton } from "./InputCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2 } from "lucide-react";
interface InputRelationsProps {
  relations: string[];
  updateRelation: (index: number, value: string) => void;
  addRelation: () => void;
  removeRelation: (index: number) => void;
  clearAllRelations: () => void;
  handleSolve: () => void;
  isSolved: boolean;
  isCalculating: boolean;
}
export default function InputRelations({
  relations,
  updateRelation,
  addRelation,
  removeRelation,
  clearAllRelations,
  handleSolve,
  isCalculating,
  isSolved,
}: InputRelationsProps) {
  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quan hệ R</span>
          <Badge variant="secondary">{relations.length}</Badge>
        </CardTitle>
        <CardDescription>
          Nhập các quan hệ R để xét tính bảo toàn dữ liệu (VD: ABC, DEF)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {relations.map((rel, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="w-8 h-8 flex items-center justify-center"
              >
                {index + 1}
              </Badge>
              <Input
                placeholder="ABC"
                value={rel}
                onChange={(e) => updateRelation(index, e.target.value)}
                className="flex-1 placeholder:text-slate-400"
              />
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer hover:bg-red-600 hover:text-white"
                onClick={() => removeRelation(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={addRelation}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm quan hệ
        </Button>
      </CardContent>

      <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SolveButton
          handleSolve={handleSolve}
          isSolved={isSolved}
          isCalculating={isCalculating}
          dependencies={relations.map((rel) => ({ left: rel, right: "" }))} // Dummy để disable
        />
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
}
