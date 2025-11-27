import { ProblemType } from "@/types/enum";

export default function Header({ problemType }: { problemType: ProblemType }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-snug pb-1">
        {problemType === ProblemType.MinimalCover
          ? "Tìm Phủ Tối Tiểu"
          : problemType === ProblemType.CandidateKeys
          ? "Tìm Khóa Chính"
          : problemType === ProblemType.Closure
          ? "Tìm Bao Đóng"
          : problemType === ProblemType.Equivalence
          ? "Xét Tính Tương Đương"
          : problemType === ProblemType.DataPreservation
          ? "Xét BT Dữ Liệu"
          : problemType === ProblemType.FDPreservation
          ? "Xét BT PTH"
          : problemType === ProblemType.NormalForm
          ? "Xét Dạng Chuẩn"
          : "Nâng cấp lên 3NF"}
      </h1>
      <p>
        {problemType === ProblemType.MinimalCover
          ? "Nhập các phụ thuộc hàm để tìm phủ tối tiểu"
          : problemType === ProblemType.CandidateKeys
          ? "Nhập các phụ thuộc hàm để tìm các khóa chính"
          : problemType === ProblemType.Closure
          ? "Nhập các phụ thuộc hàm và thuộc tính để tính bao đóng của một tập thuộc tính"
          : problemType === ProblemType.Equivalence
          ? "Nhập 2 tập phụ thuộc hàm để xét tính tương đương"
          : problemType === ProblemType.DataPreservation
          ? "Nhập phụ thuộc hàm và các quan hệ R để xét tính bảo toàn dữ liệu"
          : problemType === ProblemType.FDPreservation
          ? "Nhập phụ thuộc hàm và phân rã để kiểm tra bảo toàn phụ thuộc hàm"
          : problemType === ProblemType.NormalForm
          ? "Nhập phụ thuộc hàm để xác định dạng chuẩn (2NF, 3NF, BCNF)"
          : "Chọn loại bài toán và nhập dữ liệu tương ứng"}
      </p>
    </div>
  );
}
