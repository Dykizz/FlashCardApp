import { FunctionalDependency, getAllAttributes } from "./feature";

export function validateInput(
  problemType: string,
  fds: FunctionalDependency[],
  attrsToClose?: string
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
    case "minimal-cover":
      // Minimal cover can handle more FDs
      if (fds.length > 25) {
        return {
          valid: false,
          error: `Tìm phủ tối tiểu: Số phụ thuộc hàm không được vượt quá 25 (hiện tại: ${fds.length})`,
        };
      }
      break;

    case "candidate-keys":
      // Candidate keys is most expensive - stricter limits
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

      // Check for trivial cases
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

    case "closure":
      // Validate attrsToClose
      if (!attrsToClose || attrsToClose.trim() === "") {
        return {
          valid: false,
          error: "Vui lòng nhập thuộc tính muốn tìm bao đóng",
        };
      }

      // Check if all attributes in attrsToClose exist in FDs
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

    default:
      return {
        valid: false,
        error: "Loại bài toán không hợp lệ",
      };
  }

  return { valid: true };
}
