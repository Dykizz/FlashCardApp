"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Play, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Node } from "./feature";
import {
  createFD,
  findCandidateKeys,
  findClousure,
  findMinimalCover,
  FunctionalDependency,
} from "./feature";
import LatexContentRender from "@/components/LatexContentRender";
import KeyTree from "./KeyTree";
import { validateInput } from "./validate";
import { showToast } from "@/utils/toast";
import Loading from "@/components/Loading";
import { fetchWithAuth } from "@/utils/apiClient";

enum ProblemType {
  MinimalCover = "minimal-cover",
  CandidateKeys = "candidate-keys",
  Closure = "closure",
}

const SolveButton = ({
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

export default function FeaturePage() {
  const [dependencies, setDependencies] = useState<
    { left: string; right: string }[]
  >([{ left: "", right: "" }]);
  const [solution, setSolution] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [problemType, setProblemType] = useState<ProblemType>(
    ProblemType.MinimalCover
  );
  const solutionRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<Node[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [attrsToClose, setAttrsToClose] = useState<string>("");
  const [check, setCheck] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetchWithAuth("/api/check");
        if (response.success) {
          setCheck((pre) => !pre);
        }
      } catch (error) {
        showToast({
          title: "Lỗi",
          description:
            error instanceof Error ? error.message : "Đã có lỗi xảy ra",
          type: "error",
        });
      }
    };
    checkUser();
  }, [check]);

  const addDependency = () => {
    setIsSolved(false);
    setDependencies([...dependencies, { left: "", right: "" }]);
  };

  const removeDependency = (index: number) => {
    if (dependencies.length > 1) {
      setIsSolved(false);
      setDependencies(dependencies.filter((_, i) => i !== index));
    }
  };

  const updateDependency = (
    index: number,
    field: "left" | "right",
    value: string
  ) => {
    setIsSolved(false);
    setDependencies(
      dependencies.map((dep, i) =>
        i === index ? { ...dep, [field]: value } : dep
      )
    );
  };

  const clearAll = () => {
    setIsSolved(false);
    setDependencies([{ left: "", right: "" }]);
    setSolution("");
    setSteps([]);
  };

  const handleSolve = async () => {
    setIsCalculating(true);
    try {
      const fds: FunctionalDependency[] = dependencies.map((dep) =>
        createFD(dep.left, dep.right)
      );

      const validation = validateInput(problemType, fds, attrsToClose);
      if (!validation.valid) {
        showToast({
          title: "Lỗi đầu vào",
          description: validation.error || "Đầu vào không hợp lệ",
          type: "error",
        });
        setIsCalculating(false);
        return;
      }
      setCheck((pre) => !pre);

      let result: string = "";
      let calculatedSteps: Node[] = [];

      if (problemType === ProblemType.MinimalCover) {
        result = findMinimalCover(fds);
      } else if (problemType === ProblemType.CandidateKeys) {
        const data = findCandidateKeys(fds);
        result = data.solution;
        calculatedSteps = data.steps;
      } else if (problemType === ProblemType.Closure) {
        result = findClousure(attrsToClose, fds);
      }
      setTimeout(() => {
        setIsSolved(true);
        setSolution(result);
        if (problemType === ProblemType.CandidateKeys) {
          setSteps(calculatedSteps);
        }
        setIsCalculating(false);

        if (solutionRef.current) {
          const element = solutionRef.current;
          const y = element.getBoundingClientRect().top + window.pageYOffset; // ⭐ Lướt cao thêm 100px
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 2000);
    } catch (error) {
      console.error("Error during calculation:", error);
      setSolution("Đã có lỗi xảy ra trong quá trình tính toán.");
      setIsSolved(false);
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    setIsSolved(false);
    setSolution("");
    setSteps([]);
  }, [problemType]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {problemType === "minimal-cover"
              ? "Giải Phủ Tối Tiểu"
              : "Tìm Khóa Chính"}
          </h1>
          <p>
            {problemType === "minimal-cover"
              ? "Nhập các phụ thuộc hàm để tìm phủ tối tiểu"
              : "Nhập các phụ thuộc hàm để tìm các khóa chính"}
          </p>
        </div>

        <Tabs
          value={problemType}
          onValueChange={(v) => setProblemType(v as ProblemType)}
          className="mb-6"
        >
          <TabsList className="mb-15 md:mb-3 grid w-full grid-cols-1 md:grid-cols-3 max-w-md mx-auto">
            <TabsTrigger
              className="cursor-pointer"
              value={ProblemType.MinimalCover}
            >
              Tìm phủ tối tiểu
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer"
              value={ProblemType.CandidateKeys}
            >
              Tìm khóa chính
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value={ProblemType.Closure}>
              Tìm bao đóng
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Phụ thuộc hàm</span>
                <Badge variant="secondary">{dependencies.length}</Badge>
              </CardTitle>
              <CardDescription>
                Nhập các phụ thuộc hàm theo dạng: A → B
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
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
                        placeholder="A, B, C"
                        value={dep.left}
                        onChange={(e) =>
                          updateDependency(index, "left", e.target.value)
                        }
                        className="text-center"
                      />
                      <span className="text-lg font-bold">→</span>
                      <Input
                        placeholder="D, E"
                        value={dep.right}
                        onChange={(e) =>
                          updateDependency(index, "right", e.target.value)
                        }
                        className="text-center"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => removeDependency(index)}
                      disabled={dependencies.length === 1}
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
                  placeholder="Nhập thuộc tính muốn tìm bao đóng, ví dụ ABC"
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
                className="cursor-pointer"
                onClick={clearAll}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tất cả
              </Button>
            </CardFooter>
          </Card>

          {/* Example Section - Bên trái dưới Input */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Ví dụ</CardTitle>
              <CardDescription>Các ví dụ phổ biến</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full p-3 cursor-pointer h-auto whitespace-normal text-left justify-start"
                onClick={() => {
                  setIsSolved(false);
                  setDependencies([
                    { left: "AB", right: "C" },
                    { left: "C", right: "A" },
                    { left: "BC", right: "D" },
                    { left: "ACD", right: "B" },
                    { left: "D", right: "EG" },
                    { left: "BE", right: "C" },
                    { left: "C", right: "D" },
                    { left: "CE", right: "G" },
                  ]);
                  setSolution("");
                }}
              >
                <span className="text-left text-sm text-muted-foreground wrap-break-word whitespace-normal text-wrap">
                  <b>Ví dụ 1:</b> AB → C, C → A, BC → D, ACD → B, D → EG, BE →
                  C, C → D, CE → G
                </span>
              </Button>

              <Button
                variant="outline"
                className="w-full p-3 cursor-pointer h-auto whitespace-normal text-left justify-start"
                onClick={() => {
                  setIsSolved(false);
                  setDependencies([
                    { left: "A", right: "B" },
                    { left: "B", right: "C" },
                    { left: "C", right: "D" },
                  ]);
                  setSolution("");
                }}
              >
                <span className="text-left text-sm text-muted-foreground wrap-break-word whitespace-normal text-wrap">
                  <b>Ví dụ 2: </b> A → B, B → C, C → D
                </span>
              </Button>

              <Separator />

              <div className="text-sm space-y-2">
                <h4 className="font-semibold">Hướng dẫn:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Vế trái: Nhập các thuộc tính (VD: A, AB, ABC)</li>
                  <li>Vế phải: Nhập các thuộc tính (VD: B, CD)</li>
                  <li>Không cần nhập ký hiệu →</li>
                  <li>Có thể nhập nhiều thuộc tính liền nhau</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card ref={solutionRef} className="xl:col-span-2 xl:row-span-2">
            <CardHeader>
              <CardTitle>Lời giải</CardTitle>
              <CardDescription>
                Các bước tìm phủ tối tiểu của tập phụ thuộc hàm
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isCalculating ? (
                <Loading
                  message={
                    problemType === ProblemType.MinimalCover
                      ? "Đang tìm phủ tối tiểu..."
                      : problemType === ProblemType.CandidateKeys
                      ? "Đang tìm khóa chính..."
                      : "Đang tìm bao đóng..."
                  }
                  size="lg"
                />
              ) : solution ? (
                <div>
                  <div className="max-w-none">
                    <LatexContentRender content={solution} border={false} />
                  </div>

                  {problemType === ProblemType.CandidateKeys &&
                    steps &&
                    steps.length > 0 && (
                      <div>
                        <h2 className="text-center text-base md:text-lg font-semibold mt-6 mb-4">
                          Quá trình tìm các khóa chính
                        </h2>
                        <KeyTree steps={steps} />
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Chưa có lời giải
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Nhập các phụ thuộc hàm và nhấn <strong>Bắt đầu giải</strong>{" "}
                    để xem lời giải chi tiết
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
