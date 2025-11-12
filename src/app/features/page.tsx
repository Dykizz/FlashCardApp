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
import { Plus, X, Play, Trash2, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Node } from "./feature";
import {
  areEquivalentFDs,
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
import { useSession } from "next-auth/react";
import { NotLogin } from "@/components/NotLogin";
import { useMapping } from "./useMapping";

export enum ProblemType {
  MinimalCover = "minimal-cover",
  CandidateKeys = "candidate-keys",
  Closure = "closure",
  Equivalence = "equivalence",
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
  const { data: session, status } = useSession();
  const [dependencies, setDependencies] = useState<
    { left: string; right: string }[]
  >([{ left: "", right: "" }]);

  const [secondDependencies, setSecondDependencies] = useState<
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

  const {
    showMapping,
    setShowMapping,
    attributeMapping,
    addMapping,
    removeMapping,
    updateMapping,
    applyMapping,
    decodeString,
    reverseMapping,
    reset,
  } = useMapping();
  const addDependency = () => {
    setIsSolved(false);
    setDependencies([...dependencies, { left: "", right: "" }]);
  };

  const removeDependency = (index: number) => {
    setIsSolved(false);
    setDependencies(dependencies.filter((_, i) => i !== index));
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

  //Second
  // Thêm sau clearAll
  const addSecondDependency = () => {
    setIsSolved(false);
    setSecondDependencies([...secondDependencies, { left: "", right: "" }]);
  };

  const removeSecondDependency = (index: number) => {
    setIsSolved(false);
    setSecondDependencies(secondDependencies.filter((_, i) => i !== index));
  };

  const updateSecondDependency = (
    index: number,
    field: "left" | "right",
    value: string
  ) => {
    setIsSolved(false);
    setSecondDependencies(
      secondDependencies.map((dep, i) =>
        i === index ? { ...dep, [field]: value } : dep
      )
    );
  };

  const clearSecondAll = () => {
    setIsSolved(false);
    setSecondDependencies([{ left: "", right: "" }]);
  };
  //End Second

  const handleSolve = async () => {
    setIsCalculating(true);
    try {
      if (showMapping && Object.keys(attributeMapping).length === 0) {
        throw new Error(
          "Vui lòng thêm ít nhất một mapping thuộc tính hoặc tắt tính năng Mapping."
        );
      }
      const regex = /^[a-zA-Z0-9]+$/;
      dependencies.forEach((dep, index) => {
        if (!regex.test(dep.left) || !regex.test(dep.right)) {
          throw new Error(
            `Phụ thuộc hàm thứ ${
              index + 1
            } có định dạng không hợp lệ. Chỉ chấp nhận các thuộc tính a-z, A-Z, 0-9.`
          );
        }
      });
      let mappedDependencies = dependencies;
      if (showMapping) {
        mappedDependencies = applyMapping(dependencies);
      }
      const fds: FunctionalDependency[] = mappedDependencies.map((dep) =>
        createFD(dep.left, dep.right)
      );

      const validation = validateInput(problemType, fds, attrsToClose);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      let result: string = "";
      let calculatedSteps: Node[] = [];

      if (problemType === ProblemType.MinimalCover) {
        result = findMinimalCover(fds);
      } else if (problemType === ProblemType.CandidateKeys) {
        const data = findCandidateKeys(fds);
        result = data.solution;
        calculatedSteps = data.steps;
      } else if (problemType === ProblemType.Closure) {
        if (!regex.test(attrsToClose)) {
          throw new Error(
            `Thuộc tính cần tìm bao đóng có định dạng không hợp lệ. Chỉ chấp nhận các thuộc tính a-z, A-Z, 0-9 và viết liền.`
          );
        }
        result = findClousure(attrsToClose, fds);
      } else if (problemType === ProblemType.Equivalence) {
        let mappedDependencies1 = dependencies;
        let mappedDependencies2 = secondDependencies;
        if (showMapping) {
          mappedDependencies1 = applyMapping(dependencies);
          mappedDependencies2 = applyMapping(secondDependencies);
        }
        const fds1: FunctionalDependency[] = mappedDependencies1.map((dep) =>
          createFD(dep.left, dep.right)
        );
        const fds2: FunctionalDependency[] = mappedDependencies2.map((dep) =>
          createFD(dep.left, dep.right)
        );
        result = areEquivalentFDs(fds1, fds2);
      }
      setTimeout(() => {
        setIsSolved(true);
        if (showMapping) {
          result = decodeString(result);
          calculatedSteps.forEach((step) => {
            step.attrs = new Set(
              Array.from(step.attrs).map((attr) => reverseMapping[attr] || attr)
            );
            return step;
          });
        }

        setSolution(result);
        if (problemType === ProblemType.CandidateKeys) {
          setSteps(calculatedSteps);
        }
        setIsCalculating(false);

        if (solutionRef.current) {
          const element = solutionRef.current;
          const y = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 2000);
    } catch (error) {
      showToast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Đã có lỗi xảy ra",
        type: "error",
      });
      setSolution("Đã có lỗi xảy ra trong quá trình tính toán.");
      setIsSolved(false);
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    setIsSolved(false);
    setSolution("");
    setSteps([]);
  }, [problemType, session]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Đang xác thực" size="lg" />
      </div>
    );

  if (!session) {
    return <NotLogin />;
  }
  const user = session.user;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {problemType === ProblemType.MinimalCover
              ? "Giải Phủ Tối Tiểu"
              : problemType === ProblemType.CandidateKeys
              ? "Tìm Khóa Chính"
              : problemType === ProblemType.Closure
              ? "Tìm Bao Đóng"
              : user.role === "admin"
              ? "Xét Tương Đương"
              : ""}
          </h1>
          <p>
            {problemType === ProblemType.MinimalCover
              ? "Nhập các phụ thuộc hàm để tìm phủ tối tiểu"
              : problemType === ProblemType.CandidateKeys
              ? "Nhập các phụ thuộc hàm để tìm các khóa chính"
              : problemType === ProblemType.Closure
              ? "Nhập các phụ thuộc hàm và thuộc tính để tìm bao đóng"
              : "Nhập 2 tập phụ thuộc hàm để xét tính tương đương"}
          </p>
        </div>

        <Tabs
          value={problemType}
          onValueChange={(v) => setProblemType(v as ProblemType)}
          className="mb-6"
        >
          <TabsList
            className={
              "mb-20 md:mb-3 grid w-full grid-cols-1  max-w-xl mx-auto " +
              (user.role === "admin" ? " md:grid-cols-4" : "md:grid-cols-3")
            }
          >
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
            {user.role === "admin" && (
              <TabsTrigger
                className="cursor-pointer"
                value={ProblemType.Equivalence}
              >
                Xét tương đương
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
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
                      Chuyển đổi thuộc tính dài (VD: MONHOC) thành chữ cái ngắn
                      (VD: A)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(attributeMapping).map(
                      ([longName, shortName]) => (
                        <div key={longName} className="flex items-center gap-2">
                          <Input
                            placeholder="MONHOC"
                            value={longName}
                            onChange={(e) =>
                              updateMapping(longName, e.target.value)
                            }
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
                      )
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={addMapping}
                        className="flex-1 cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm mapping
                      </Button>
                      <Button
                        onClick={reset}
                        disabled={Object.keys(attributeMapping).length === 0}
                        variant="outline"
                        className="flex-1 cursor-pointer hover:bg-red-600 hover:text-white"
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

          {problemType === ProblemType.Equivalence && (
            <Card className="xl:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Phụ thuộc hàm thứ 2</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="mb-2">
                      {secondDependencies.length}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Nhập các phụ thuộc hàm theo dạng: A → B
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {secondDependencies.map((dep, index) => (
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
                            updateSecondDependency(
                              index,
                              "left",
                              e.target.value
                            )
                          }
                          className="text-center placeholder:text-slate-400"
                        />
                        <span className="text-lg font-bold">→</span>
                        <Input
                          placeholder="DE"
                          value={dep.right}
                          onChange={(e) =>
                            updateSecondDependency(
                              index,
                              "right",
                              e.target.value
                            )
                          }
                          className="text-center placeholder:text-slate-400"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer hover:bg-red-600 hover:text-white"
                        onClick={() => removeSecondDependency(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={addSecondDependency}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm phụ thuộc hàm
                </Button>
              </CardContent>

              <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <SolveButton
                  handleSolve={handleSolve}
                  isSolved={isSolved}
                  isCalculating={isCalculating}
                  dependencies={secondDependencies}
                />
                <Button
                  variant="outline"
                  className="cursor-pointer hover:bg-red-600 hover:text-white"
                  onClick={clearSecondAll}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tất cả
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Example Section - Bên trái dưới Input */}
          {problemType !== ProblemType.Equivalence && (
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
                    <li className="text-red-500 dark:text-red-300">
                      <strong>Lưu ý:</strong> Chỉ chấp nhận các thuộc tính a-z,
                      A-Z, 0-9 và viết liền. Hệ thống sẽ phân biệt viết hoa và
                      thường. Với thuộc tính dài vui lòng sử dụng tính năng
                      Mapping
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card ref={solutionRef} className="xl:col-span-2 xl:row-span-2">
            <CardHeader className="p-5 pb-1">
              <CardTitle className="text-base md:text-xl ">Lời giải</CardTitle>
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
