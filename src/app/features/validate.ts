import { ProblemType } from "@/types/enum";
import { FunctionalDependency, getAllAttributes } from "./feature";

export function validateInput(
  problemType: string,
  fds: FunctionalDependency[],
  attrsToClose: string,
  relations: string[]
): { valid: boolean; error?: string } {
  if (fds.length === 0) {
    return {
      valid: false,
      error: "Vui lòng nhập ít nhất một phụ thuộc hàm",
    };
  }

  for (const fd of fds) {
    if (fd.lhs.size === 0 || fd.rhs.size === 0) {
      return {
        valid: false,
        error: "Phụ thuộc hàm không được có vế trái hoặc vế phải rỗng",
      };
    }
  }

  const attrs = getAllAttributes(fds, "both");

  if (attrs.size > 15) {
    return {
      valid: false,
      error: `Số thuộc tính không được vượt quá 15 (hiện tại: ${attrs.size})`,
    };
  }

  if (fds.length > 30) {
    return {
      valid: false,
      error: `Số phụ thuộc hàm không được vượt quá 30 (hiện tại: ${fds.length})`,
    };
  }

  // Specific validation for each problem type
  switch (problemType) {
    case ProblemType.MinimalCover:
      if (fds.length > 25) {
        return {
          valid: false,
          error: `Tìm phủ tối tiểu: Số phụ thuộc hàm không được vượt quá 25 (hiện tại: ${fds.length})`,
        };
      }
      break;

    case ProblemType.CandidateKeys:
      if (attrs.size > 12) {
        return {
          valid: false,
          error: `Tìm khóa chính: Số thuộc tính không được vượt quá 12 (hiện tại: ${attrs.size})`,
        };
      }
      if (fds.length > 20) {
        return {
          valid: false,
          error: `Tìm khóa chính: Số phụ thuộc hàm không được vượt quá 20 (hiện tại: ${fds.length})`,
        };
      }
      const leftOnly = getAllAttributes(fds, "left");
      const rightOnly = new Set(
        [...getAllAttributes(fds, "right")].filter(
          (attr) => !leftOnly.has(attr)
        )
      );
      if (rightOnly.size === attrs.size) {
        return {
          valid: false,
          error:
            "Không tồn tại khóa chính: Tất cả thuộc tính chỉ xuất hiện ở vế phải",
        };
      }
      break;

    case ProblemType.Closure:
      if (!attrsToClose || attrsToClose.trim() === "") {
        return {
          valid: false,
          error: "Vui lòng nhập thuộc tính muốn tìm bao đóng",
        };
      }
      const attrsToCloseSet = new Set(
        attrsToClose
          .split("")
          .map((attr) => attr.trim())
          .filter(Boolean)
      );
      for (const attr of attrsToCloseSet) {
        if (!attrs.has(attr)) {
          return {
            valid: false,
            error: `Thuộc tính "${attr}" không tồn tại trong tập phụ thuộc hàm`,
          };
        }
      }
      if (attrsToCloseSet.size === 0) {
        return {
          valid: false,
          error: "Vui lòng nhập ít nhất một thuộc tính hợp lệ",
        };
      }
      break;

    // ✅ BẮT ĐẦU SỬA
    case ProblemType.DataPreservation:
    case ProblemType.FDPreservation:
      // Thêm logic kiểm tra cho relations
      if (!relations || relations.length < 2) {
        return {
          valid: false,
          error:
            "Cần nhập ít nhất 2 lược đồ con (ví dụ: R1, R2) để thực hiện bài toán này.",
        };
      }
      for (const [index, relStr] of relations.entries()) {
        const cleaned = relStr.replace(/[^a-zA-Z0-9]/g, "");
        if (cleaned.length === 0) {
          return {
            valid: false,
            error: `Lược đồ con R${index + 1} không được để trống.`,
          };
        }
        // Kiểm tra xem thuộc tính trong lược đồ con có tồn tại trong FDs không
        for (const attr of cleaned.split("")) {
          if (!attrs.has(attr)) {
            return {
              valid: false,
              error: `Thuộc tính "${attr}" trong R${
                index + 1
              } không tồn tại trong tập phụ thuộc hàm.`,
            };
          }
        }
      }
      break;

    case ProblemType.Decompose3NF:
    case ProblemType.Equivalence:
    case ProblemType.NormalForm:
      break;

    default:
      return {
        valid: false,
        error: "Loại bài toán không hợp lệ",
      };
  }

  return { valid: true };
}
