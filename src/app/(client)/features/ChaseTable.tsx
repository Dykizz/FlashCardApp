import React from "react";
import { ChaseResult } from "./feature";
import LatexContentRender from "@/components/LatexContentRender";

const CellDisplay = ({
  val,
  isHighlight,
}: {
  val: string;
  isHighlight: boolean;
}) => {
  const latexVal = `$${val}$`;
  return (
    <td
      className={`border border-gray-300 px-2 py-2 text-center align-middle transition-colors duration-300 ${
        isHighlight ? "bg-red-50" : ""
      }`}
    >
      <div className="flex justify-center items-center min-w-10">
        <LatexContentRender
          content={latexVal}
          border={false}
          className={`p-0! [&_p]:mb-0 text-base ${
            isHighlight
              ? "[&_.katex]:text-red-600 [&_p]:text-red-600 font-bold"
              : ""
          }`}
        />
      </div>
    </td>
  );
};

interface ChaseTableProps {
  data: ChaseResult | null;
  headers: string[];
  rowNames: string[];
}

export const ChaseTable: React.FC<ChaseTableProps> = ({
  data,
  headers,
  rowNames,
}) => {
  if (!data || !data.steps || data.steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10 w-full max-w-5xl mx-auto mt-8">
      {data.steps.map((step, stepIndex) => (
        <div
          key={stepIndex}
          className="bg-white dark:bg-slate-900 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              {stepIndex === 0
                ? "Bước 1: Khởi tạo bảng Tableau"
                : `Bước ${stepIndex + 1}: Biến đổi`}
            </h3>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              <LatexContentRender
                content={step.description}
                border={false}
                className="!p-0 [&_p]:mb-0 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-sm md:text-base bg-white dark:bg-slate-950">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="border border-gray-300 px-4 py-2 w-24 text-slate-700 dark:text-slate-200">
                    Lược đồ
                  </th>
                  {headers.map((h, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-4 py-2 font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <div className="flex justify-center">
                        {h ? (
                          <LatexContentRender
                            content={`$${h}$`}
                            border={false}
                            className="p-0! [&_p]:mb-0 font-bold"
                          />
                        ) : (
                          <span>&nbsp;</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.matrix.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <td className="border border-gray-300 px-4 py-2 font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 text-center align-middle">
                      <div className="flex justify-center items-center">
                        <LatexContentRender
                          content={`$${rowNames[rIdx] || `R_{${rIdx + 1}}`}$`}
                          border={false}
                          className="p-0! [&_p]:mb-0"
                        />
                      </div>
                    </td>
                    {row.map((cellVal, cIdx) => {
                      const isHighlight = step.highlightCells.some(
                        (h) => h.row === rIdx && h.col === cIdx
                      );
                      return (
                        <CellDisplay
                          key={`${rIdx}-${cIdx}`}
                          val={cellVal}
                          isHighlight={isHighlight}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="text-center mt-6">
        <h3 className="text-lg font-medium">
          {data.isLossless ? "Bảo toàn thông tin" : "Không bảo toàn thông tin"}
        </h3>
        <p className="text-sm mt-1">
          <LatexContentRender
            content={
              data.isLossless
                ? "(Tìm thấy ít nhất một dòng chứa toàn bộ các ký hiệu $a$)"
                : "(Không có dòng nào chứa toàn bộ các ký hiệu $a$)"
            }
            border={false}
            className="p-0! [&_p]:mb-0 inline-block"
          />
        </p>
      </div>
    </div>
  );
};
