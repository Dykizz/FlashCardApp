"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Node } from "./feature";
import {
  areEquivalentFDs,
  createFD,
  determineNormalForm,
  findCandidateKeys,
  findClousure,
  findMinimalCover,
  checkDataPreservation,
  FunctionalDependency,
  ChaseResult,
  checkDependencyPreservation,
  decomposeTo3NF,
} from "./feature";
import LatexContentRender from "@/components/LatexContentRender";
import KeyTree from "./KeyTree";
import { validateInput } from "./validate";
import { showToast } from "@/utils/toast";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { NotLogin } from "@/components/NotLogin";
import { useMapping } from "./useMapping";
import { ProblemType } from "@/types/enum";
import NotSolution from "./NotSolution";
import InputCard from "./InputCard";
import Example from "./Example";
import Header from "./Header";
import ProblemTabs from "./ProblemTabs";
import RelationTable from "./RelationTable";
import { ChaseTable } from "./ChaseTable";

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

  const [relations, setRelations] = useState<string[]>([""]);
  const [chaseResult, setChaseResult] = useState<ChaseResult | null>(null);

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

  const addRelation = () => {
    setIsSolved(false);
    setRelations([...relations, ""]);
  };
  const removeRelation = (index: number) => {
    setIsSolved(false);
    setRelations(relations.filter((_, i) => i !== index));
  };
  const updateRelation = (index: number, value: string) => {
    setIsSolved(false);
    setRelations(relations.map((rel, i) => (i === index ? value : rel)));
  };
  const clearAllRelations = () => {
    setIsSolved(false);
    setRelations([""]);
  };
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
    setChaseResult(null);
  };
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

  const handleSolve = async () => {
    setIsCalculating(true);
    setChaseResult(null);

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
      const validation = validateInput(
        problemType,
        fds,
        attrsToClose,
        relations
      );
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      let result: string = "";
      let calculatedSteps: Node[] = [];
      let parsedRelations: Set<string>[] = [];
      if (
        problemType === ProblemType.DataPreservation ||
        problemType === ProblemType.FDPreservation
      ) {
        parsedRelations = relations.map((relStr) => {
          const cleaned = relStr.replace(/[^a-zA-Z0-9]/g, "");
          return new Set(cleaned.split(""));
        });
      }

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
      } else if (problemType === ProblemType.NormalForm) {
        result = determineNormalForm(fds);
      } else if (problemType === ProblemType.DataPreservation) {
        const data = checkDataPreservation(fds, parsedRelations);
        setChaseResult(data);
        result = data.solution;
      } else if (problemType === ProblemType.FDPreservation) {
        result = checkDependencyPreservation(fds, parsedRelations);
      } else if (problemType === ProblemType.Decompose3NF) {
        result = decomposeTo3NF(fds);
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
      }, 1000);
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
  }, [problemType, session]);

  useEffect(() => {
    setSolution("");
    setChaseResult(null);
    setSteps([]);
  }, [problemType]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Đang xác thực" size="lg" />
      </div>
    );

  if (!session) {
    return <NotLogin />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header problemType={problemType} />
        <ProblemTabs
          problemType={problemType}
          setProblemType={setProblemType}
        />

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <InputCard
            dependencies={dependencies}
            showMapping={showMapping}
            setShowMapping={setShowMapping}
            updateDependency={updateDependency}
            addDependency={addDependency}
            removeDependency={removeDependency}
            clearAll={clearAll}
            attrsToClose={attrsToClose}
            setAttrsToClose={setAttrsToClose}
            handleSolve={handleSolve}
            isSolved={isSolved}
            setIsSolved={setIsSolved}
            isCalculating={isCalculating}
            problemType={problemType}
            attributeMapping={attributeMapping}
            updateMapping={updateMapping}
            addMapping={addMapping}
            removeMapping={removeMapping}
            reset={reset}
          />

          {problemType === ProblemType.Equivalence && (
            <InputCard
              dependencies={secondDependencies}
              showMapping={showMapping}
              setShowMapping={setShowMapping}
              updateDependency={updateSecondDependency}
              addDependency={addSecondDependency}
              removeDependency={removeSecondDependency}
              clearAll={clearSecondAll}
              attrsToClose={attrsToClose}
              setAttrsToClose={setAttrsToClose}
              handleSolve={handleSolve}
              isSolved={isSolved}
              setIsSolved={setIsSolved}
              isCalculating={isCalculating}
              problemType={problemType}
              attributeMapping={attributeMapping}
              updateMapping={updateMapping}
              addMapping={addMapping}
              removeMapping={removeMapping}
              reset={reset}
            />
          )}

          {(problemType === ProblemType.DataPreservation ||
            problemType === ProblemType.FDPreservation) && (
            <RelationTable
              relations={relations}
              addRelation={addRelation}
              removeRelation={removeRelation}
              updateRelation={updateRelation}
              clearAllRelations={clearAllRelations}
              isSolved={isSolved}
            />
          )}

          {problemType !== ProblemType.Equivalence &&
            problemType !== ProblemType.DataPreservation &&
            problemType !== ProblemType.FDPreservation && (
              <Example
                setDependencies={setDependencies}
                setIsSolved={setIsSolved}
                setSolution={setSolution}
              />
            )}

          <Card ref={solutionRef} className="xl:col-span-2 xl:row-span-2">
            <CardHeader className="p-5 pb-1">
              <CardTitle className="text-base md:text-xl ">Lời giải</CardTitle>
              {/* ✅ SỬA: Cập nhật mô tả cho FDPreservation */}
              <CardDescription>
                {problemType === ProblemType.DataPreservation
                  ? "Các bước kiểm tra thuật toán Chase (Bảo toàn thông tin)"
                  : problemType === ProblemType.FDPreservation
                  ? "Các bước kiểm tra thuật toán Z (Bảo toàn phụ thuộc hàm)"
                  : "Chi tiết các bước thực hiện toán"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isCalculating ? (
                // ✅ SỬA: Cập nhật text loading
                <Loading
                  message={
                    problemType === ProblemType.DataPreservation
                      ? "Đang chạy thuật toán Chase..."
                      : problemType === ProblemType.FDPreservation
                      ? "Đang kiểm tra bảo toàn PTH..."
                      : problemType === ProblemType.CandidateKeys
                      ? "Đang tìm khóa chính..."
                      : problemType === ProblemType.MinimalCover
                      ? "Đang tìm phủ tối tiểu..."
                      : "Đang tính toán..."
                  }
                  size="lg"
                />
              ) : solution ? (
                <div className="space-y-8">
                  <div className="max-w-none">
                    <LatexContentRender content={solution} border={false} />
                  </div>

                  {problemType === ProblemType.DataPreservation &&
                    chaseResult && (
                      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                          Minh họa trực quan bảng Tableau
                        </h3>
                        <ChaseTable
                          data={chaseResult}
                          headers={chaseResult.headers}
                          rowNames={chaseResult.rowNames}
                        />
                      </div>
                    )}

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
                <NotSolution />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
