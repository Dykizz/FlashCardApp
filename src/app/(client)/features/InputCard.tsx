import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, X, Trash2, Settings2 } from "lucide-react";
import { ProblemType } from "@/types/enum";

interface InputCardProps {
  dependencies: { left: string; right: string }[];
  updateDependency: (
    index: number,
    field: "left" | "right",
    value: string
  ) => void;
  addDependency: () => void;
  removeDependency: (index: number) => void;
  clearAll: () => void;
  attrsToClose: string;
  setAttrsToClose: (value: string) => void;
  handleSolve: () => void;
  isSolved: boolean;
  setIsSolved: (value: boolean) => void;
  isCalculating: boolean;
  problemType: ProblemType;
  showMapping: boolean;
  setShowMapping: (value: boolean) => void;
  attributeMapping: Record<string, string>;
  updateMapping: (longName: string, newLongName: string) => void;
  addMapping: () => void;
  removeMapping: (longName: string) => void;
  reset: () => void;
}

export const SolveButton = ({
  handleSolve,
  isSolved,
  isCalculating,
  dependencies,
}: {
  handleSolve: () => void;
  isSolved: boolean;
  isCalculating: boolean;
  dependencies: { left: string; right: string }[];
}) => {
  return (
    <Button
      className="flex-1 cursor-pointer"
      onClick={handleSolve}
      disabled={
        isSolved ||
        isCalculating ||
        dependencies.some((d) => !d.left || !d.right)
      }
    >
      {isCalculating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Đang giải...
        </>
      ) : isSolved ? (
        <>
          <Play className="h-4 w-4 mr-2" />
          Đã giải
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Bắt đầu giải
        </>
      )}
    </Button>
  );
};

export default function InputCard({
  dependencies,
  showMapping,
  setShowMapping,
  updateDependency,
  addDependency,
  removeDependency,
  clearAll,
  attrsToClose,
  setAttrsToClose,
  handleSolve,
  isSolved,
  setIsSolved,
  isCalculating,
  problemType,
  attributeMapping,
  updateMapping,
  addMapping,
  removeMapping,
  reset,
}: InputCardProps) {
  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Phụ thuộc hàm</span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{dependencies.length}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMapping(!showMapping)}
              className={`cursor-pointer ${
                showMapping
                  ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  : ""
              }`}
            >
              <Settings2 className="h-4 w-4 mr-1" />
              Mapping
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Nhập các phụ thuộc hàm theo dạng: A → B
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {showMapping && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Mapping thuộc tính dài
              </CardTitle>
              <CardDescription className="text-xs">
                Chuyển đổi thuộc tính dài (VD: MONHOC) thành chữ cái ngắn (VD:
                A)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(attributeMapping).map(([longName, shortName]) => (
                <div key={longName} className="flex items-center gap-2">
                  <Input
                    placeholder="MONHOC"
                    value={longName}
                    onChange={(e) => updateMapping(longName, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold">→</span>
                  <Input
                    value={shortName}
                    disabled
                    className="w-16 text-center bg-slate-100 dark:bg-slate-800"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMapping(longName)}
                    className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={addMapping}
                  className=" cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm mapping
                </Button>
                <Button
                  onClick={reset}
                  disabled={Object.keys(attributeMapping).length === 0}
                  variant="outline"
                  className="cursor-pointer hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {dependencies.map((dep, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="w-8 h-8 flex items-center justify-center"
              >
                {index + 1}
              </Badge>
              <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <Input
                  placeholder="ABC"
                  value={dep.left}
                  onChange={(e) =>
                    updateDependency(index, "left", e.target.value)
                  }
                  className="text-center placeholder:text-slate-400"
                />
                <span className="text-lg font-bold">→</span>
                <Input
                  placeholder="DE"
                  value={dep.right}
                  onChange={(e) =>
                    updateDependency(index, "right", e.target.value)
                  }
                  className="text-center placeholder:text-slate-400"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer hover:bg-red-600 hover:text-white"
                onClick={() => removeDependency(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={addDependency}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm phụ thuộc hàm
        </Button>

        {problemType === ProblemType.Closure && (
          <Input
            placeholder={
              showMapping
                ? "Nhập thuộc tính đã mapping muốn tìm bao đóng, ví dụ MONHOV → A nhập A"
                : "Nhập thuộc tính muốn tìm bao đóng, ví dụ ABC"
            }
            value={attrsToClose}
            onChange={(e) => {
              setIsSolved(false);
              setAttrsToClose(e.target.value);
            }}
          />
        )}
      </CardContent>

      <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SolveButton
          handleSolve={handleSolve}
          isSolved={isSolved}
          isCalculating={isCalculating}
          dependencies={dependencies}
        />
        <Button
          variant="outline"
          className="cursor-pointer hover:bg-red-600 hover:text-white"
          onClick={clearAll}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa tất cả
        </Button>
      </CardFooter>
    </Card>
  );
}
