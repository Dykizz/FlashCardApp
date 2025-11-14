import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemType } from "@/types/enum";

export default function ProblemTabs({
  problemType,
  setProblemType,
}: {
  problemType: ProblemType;
  setProblemType: (type: ProblemType) => void;
}) {
  return (
    <>
      <Tabs
        value={problemType}
        onValueChange={(v) => setProblemType(v as ProblemType)}
        className="mb-6"
      >
        <TabsList
          className={
            // Sử dụng grid 2 cột trên mobile và 4 cột trên desktop
            // h-auto là quan trọng để cho phép nhiều hàng
            "h-auto grid w-full grid-cols-2 max-w-xl mx-auto md:grid-cols-4 gap-2"
          }
        >
          {/* Hàng 1 (trên desktop) */}
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
          <TabsTrigger
            className="cursor-pointer"
            value={ProblemType.Equivalence}
          >
            Xét tương đương
          </TabsTrigger>

          {/* Hàng 2 (trên desktop) */}
          <TabsTrigger
            className="cursor-pointer"
            value={ProblemType.DataPreservation}
          >
            Xét BT dữ liệu
          </TabsTrigger>
          <TabsTrigger
            className="cursor-pointer"
            value={ProblemType.FDPreservation}
          >
            Xét BT PTH
          </TabsTrigger>
          <TabsTrigger
            className="cursor-pointer"
            value={ProblemType.NormalForm}
          >
            Xét dạng chuẩn
          </TabsTrigger>
          <TabsTrigger
            className="cursor-pointer"
            value={ProblemType.Decompose3NF}
          >
            Nâng cấp lên 3NF
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
}
