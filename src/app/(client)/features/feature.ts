import { Node as FlowNode, Edge } from "reactflow";
type Attribute = string;

export interface FunctionalDependency {
  lhs: Set<Attribute>;
  rhs: Set<Attribute>;
}

export function createFD(lhsStr: string, rhsStr: string): FunctionalDependency {
  const lhs = new Set(
    lhsStr
      .split("")
      .map((attr) => attr.trim())
      .filter(Boolean)
  );
  const rhs = new Set(
    rhsStr
      .split("")
      .map((attr) => attr.trim())
      .filter(Boolean)
  );

  return { lhs, rhs };
}

// Hàm tính đóng đóng của tập thuộc tính X theo các phụ thuộc hàm F
export function closure(
  X: Set<Attribute>,
  F: FunctionalDependency[]
): {
  closure: Set<Attribute>;
  steps: Array<{ f: FunctionalDependency; addedAttr: Array<Attribute> }>;
} {
  const result = new Set(X);
  //Phụ thuộc hàm đã được áp dụng và các thuộc tính đã được thêm vào
  const steps: Array<{ f: FunctionalDependency; addedAttr: Array<Attribute> }> =
    [];
  let added: boolean;

  do {
    added = false;
    for (const fd of F) {
      // nếu fd.lhs ⊆ result
      if ([...fd.lhs].every((attr) => result.has(attr))) {
        const arrtAdded: Attribute[] = [];
        for (const attr of fd.rhs) {
          if (!result.has(attr)) {
            result.add(attr);
            added = true;
            arrtAdded.push(attr);
          }
        }
        if (arrtAdded.length > 0) {
          steps.push({ f: fd, addedAttr: arrtAdded });
        }
      }
    }
  } while (added);

  return {
    closure: result,
    steps: steps,
  };
}
// Hàm tách các phụ thuộc hàm có nhiều thuộc tính ở vế phải thành các phụ thuộc hàm có một thuộc tính ở vế phải
export function splitRHS(fds: FunctionalDependency[]): {
  fds: FunctionalDependency[];
  steps: Array<{
    originalFD: FunctionalDependency;
    splitFDs: FunctionalDependency[];
  }>;
} {
  const result: FunctionalDependency[] = [];
  const steps: Array<{
    originalFD: FunctionalDependency;
    splitFDs: FunctionalDependency[];
  }> = [];

  for (const fd of fds) {
    if (fd.rhs.size > 1) {
      const splitFDs: FunctionalDependency[] = [];
      for (const attr of fd.rhs) {
        const newFD = {
          lhs: new Set(fd.lhs),
          rhs: new Set([attr]),
        };
        result.push(newFD);
        splitFDs.push(newFD);
      }
      steps.push({ originalFD: fd, splitFDs });
    } else {
      result.push({
        lhs: new Set(fd.lhs),
        rhs: new Set(fd.rhs),
      });
    }
  }

  return { fds: result, steps };
}

function isSubset(child: Set<Attribute>, parent: Set<Attribute>): boolean {
  return [...child].every((elem) => parent.has(elem));
}

//Hàm lấy danh sách các thuộc tính cả 2 vế của tập phụ thuộc hàm
export function getAllAttributes(
  fds: FunctionalDependency[],
  side: "left" | "right" | "both"
): Set<Attribute> {
  const attrs = new Set<Attribute>();
  for (const fd of fds) {
    if (side === "left" || side === "both") {
      for (const attr of fd.lhs) {
        attrs.add(attr);
      }
    }
    if (side === "right" || side === "both") {
      for (const attr of fd.rhs) {
        attrs.add(attr);
      }
    }
  }
  return attrs;
}

// Hàm kiểm tra xem có thể loại bỏ thuộc tính dư ở vế trái của phụ thuộc hàm hay không
export function isCanMinimizeLHS(
  fd: FunctionalDependency,
  otherFDs: FunctionalDependency[]
): boolean {
  if (fd.lhs.size <= 1) return false;
  for (const otherFd of otherFDs) {
    if (isSubset(otherFd.lhs, fd.lhs)) {
      return true;
    }
  }
  return false;
}

// Hàm loại bỏ các thuộc tính dư ở vế trái của phụ thuộc hàm
export function minimizeLHS(
  fd: FunctionalDependency,
  fds: FunctionalDependency[]
): {
  steps: Array<{
    removedAttr: Attribute;
    tempLHS: Set<Attribute>;
    tempClosure: Set<Attribute>;
    canRemowe: boolean;
  }>;
  minizedFDs: Array<FunctionalDependency>;
} {
  const steps: Array<{
    removedAttr: Attribute;
    tempLHS: Set<Attribute>;
    tempClosure: Set<Attribute>;
    canRemowe: boolean;
  }> = [];

  const minizedFDs: Array<FunctionalDependency> = [];

  const currentLHS = new Set(fd.lhs);
  const lhsAttrs = [...currentLHS];
  let isCanMinimizeLHS = false;

  for (const attr of lhsAttrs) {
    const tempLHS = new Set(currentLHS);
    tempLHS.delete(attr);

    const { closure: tempClosure } = closure(tempLHS, fds);

    const rhsAttrs = [...fd.rhs];
    let isRedundant = true;
    for (const r of rhsAttrs) {
      if (!tempClosure.has(r)) {
        isRedundant = false;
        break;
      }
    }

    if (isRedundant) {
      isCanMinimizeLHS = true;
      const tmp = new Set(currentLHS);
      tmp.delete(attr);
      minizedFDs.push({ lhs: tmp, rhs: new Set(fd.rhs) });
    }

    steps.push({
      removedAttr: attr,
      tempLHS: tempLHS,
      tempClosure: tempClosure,
      canRemowe: isRedundant,
    });
  }

  // Nếu không thể giản ước vế trái, giữ nguyên FD ban đầu
  if (!isCanMinimizeLHS) minizedFDs.push(fd);

  return {
    steps,
    minizedFDs,
  };
}

export function hashFd(fd: FunctionalDependency): string {
  const lhs = [...fd.lhs].sort().join(",");
  const rhs = [...fd.rhs].sort().join(",");
  return `${lhs}->${rhs}`;
}

// Hàm loại bỏ các phụ thuộc hàm trùng lặp
export function removeDuplicateFDs(
  fds: FunctionalDependency[]
): FunctionalDependency[] {
  const seen = new Set<string>();
  const result: FunctionalDependency[] = [];

  for (const fd of fds) {
    const hash =
      [...fd.lhs].sort().join(",") + "->" + [...fd.rhs].sort().join(",");

    if (!seen.has(hash)) {
      seen.add(hash);
      result.push({
        lhs: new Set(fd.lhs),
        rhs: new Set(fd.rhs),
      });
    }
  }

  return result;
}
//Hàm lấy các fd có khả năng là phụ thuộc hàm thừa (lấy các fd có cùng vế phải xuất hiện nhiều lần)
export function getPotentialRedundantFDs(
  fds: FunctionalDependency[]
): FunctionalDependency[] {
  const rhsCount: { [key: string]: number } = {};
  const potentialFDs: FunctionalDependency[] = [];
  for (const fd of fds) {
    const rhsKey = [...fd.rhs].sort().join(",");
    rhsCount[rhsKey] = (rhsCount[rhsKey] || 0) + 1;
  }
  for (const fd of fds) {
    const rhsKey = [...fd.rhs].sort().join(",");
    if (rhsCount[rhsKey] > 1) {
      potentialFDs.push(fd);
    }
  }
  return potentialFDs;
}

// Hàm loại bỏ các phụ thuộc hàm thừa
export function removeRedundantFDs(fds: FunctionalDependency[]): {
  fds: FunctionalDependency[];
  steps: Array<{
    fd: FunctionalDependency;
    tempClosure: Set<Attribute>;
    isRedundant: boolean;
  }>;
} {
  const steps: Array<{
    fd: FunctionalDependency;
    tempClosure: Set<Attribute>;
    isRedundant: boolean;
  }> = [];

  const potentialFDs = getPotentialRedundantFDs(fds);

  const result: FunctionalDependency[] = [];

  for (const fd of fds) {
    if (!potentialFDs.includes(fd)) {
      result.push(fd);
      continue; // Nếu không phải FD tiềm năng, giữ nguyên
    }
    const otherFDs = fds.filter((x) => hashFd(x) !== hashFd(fd));
    const { closure: tempClosure } = closure(fd.lhs, otherFDs);

    const rhsAttrs = [...fd.rhs];
    let isRedundant = true;
    for (const r of rhsAttrs) {
      if (!tempClosure.has(r)) {
        isRedundant = false;
        break;
      }
    }

    if (!isRedundant) {
      result.push(fd);
    }

    steps.push({ fd, tempClosure, isRedundant });
  }

  return { fds: result, steps };
}

// --- ✅ KHU VỰC HELPER (ĐÃ DI CHUYỂN LÊN ĐÂY) ---
// Các hàm này giờ là global và các hàm logic chính sẽ gọi chúng

export function toLatexClosure(
  attrs: Set<Attribute>,
  closure: Set<Attribute>
): string {
  const attrsStr = [...attrs].join("");
  const closureStr = [...closure].join(", ");
  return `$(${attrsStr})^+ = \\{${closureStr}\\}$`;
}

export function fdsToLatex(fds: FunctionalDependency[]): string {
  return fds
    .map((fd) => {
      const lhs = [...fd.lhs].join("");
      const rhs = [...fd.rhs].join("");
      return `${lhs} \\to ${rhs}`;
    })
    .join(", ");
}

/** Biến Set thành chuỗi \{A, B, C\} (dùng bên trong math mode) */
const formatSet = (s: Set<Attribute>): string => {
  if (s.size === 0) {
    return `\\emptyset`; // Trả về ký hiệu rỗng nếu Set rỗng
  }
  return `\\{${[...s].join(", ")}\\}`;
};
/** Biến Set thành chuỗi AB (dùng bên trong math mode) */
const formatAttrs = (s: Set<Attribute>): string => [...s].join("");

/** Biến Set thành chuỗi (AB)+ (dùng bên trong math mode) */
const formatClosure = (s: Set<Attribute>): string => `(${formatAttrs(s)})^+`;

/** Trả về tập hợp các phần tử chung */
function intersection(
  setA: Set<Attribute>,
  setB: Set<Attribute>
): Set<Attribute> {
  const _intersection = new Set<Attribute>();
  setB.forEach((elem) => {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  });
  return _intersection;
}

/** Helper cho Thuật toán Chase: Lấy số từ a_{i} hoặc b_{ij} */
function getNumericIndex(val: string): number {
  try {
    const match = val.match(/\{(\d+)\}/);
    if (match) return parseInt(match[1], 10);
    const numMatch = val.match(/\d+$/);
    if (numMatch) return parseInt(numMatch[0], 10);
    return Infinity;
  } catch (e) {
    return Infinity;
  }
}
// --- KẾT THÚC KHU VỰC HELPER ---

export function findMinimalCover(fds: FunctionalDependency[]): string {
  const allAttributes = getAllAttributes(fds, "both");

  let solution = "\\section{Tìm phủ tối tiểu}\n\n";

  solution += solution +=
    "Các thuộc tính trong tập phụ thuộc hàm ban đầu là: $" +
    formatSet(allAttributes) +
    "$.\n\n";

  solution += "$$F = \\{" + fdsToLatex(fds) + "\\}$$\n\n";

  solution += "\\subsection{Bước 1: Tách vế phải thành thuộc tính đơn}\n\n";

  const { steps, fds: step1FDs } = splitRHS(fds);

  if (steps.length > 0) {
    solution += "\\begin{itemize}\n";
    for (const step of steps) {
      const originalLhs = [...step.originalFD.lhs].join("");
      const originalRhs = [...step.originalFD.rhs].join("");
      const splits = step.splitFDs
        .map((fd) => {
          const lhs = [...fd.lhs].join("");
          const rhs = [...fd.rhs].join("");
          return `$${lhs} \\to ${rhs}$`;
        })
        .join(", ");

      solution += `\\item Tách phụ thuộc hàm $${originalLhs} \\to ${originalRhs}$ thành các phụ thuộc hàm: ${splits}.\n`;
    }
    solution += "\\end{itemize}\n\n";
  }

  let currentFDs = removeDuplicateFDs(step1FDs);

  solution += "$$F_1 = \\{" + fdsToLatex(currentFDs) + "\\}$$\n\n";

  solution += "\\subsection{Bước 2: Loại bỏ thuộc tính dư ở vế trái}\n\n";

  const step2FDs: FunctionalDependency[] = [];

  for (let i = 0; i < currentFDs.length; i++) {
    const fd = currentFDs[i];
    const otherFDs = currentFDs.filter((_, idx) => idx !== i);

    if (!isCanMinimizeLHS(fd, otherFDs)) {
      step2FDs.push(fd);
      continue;
    }

    const { steps: step2Steps, minizedFDs } = minimizeLHS(fd, otherFDs);
    step2FDs.push(...minizedFDs);

    const fdLhs = [...fd.lhs].join("");
    const fdRhs = [...fd.rhs].join("");
    const rhsAttr = fd.rhs.values().next().value;

    solution += `\\textbf{Xét phụ thuộc hàm} $${fdLhs} \\to ${fdRhs}$:\n\n`;
    solution += "\\begin{itemize}\n";

    for (const step of step2Steps) {
      const tempLhsStr = [...step.tempLHS].join("");
      const closureStr = [...step.tempClosure].join(", ");

      solution += `\\item Giản ước $\\boldsymbol{${step.removedAttr}}$ : $(${tempLhsStr})^+ = \\{${closureStr}\\}$ `;

      if (step.canRemowe) {
        solution += `chứa $\\boldsymbol{${rhsAttr}}$ nên có thể loại bỏ $\\boldsymbol{${step.removedAttr}}$ khỏi vế trái.\n`;
      } else {
        solution += `không chứa $\\boldsymbol{${rhsAttr}}$ nên không thể loại bỏ $\\boldsymbol{${step.removedAttr}}$ khỏi vế trái.\n`;
      }
    }
    solution += "\\end{itemize}\n\n";
  }

  currentFDs = removeDuplicateFDs(step2FDs);

  solution += "$$F_2 = \\{" + fdsToLatex(currentFDs) + "\\}$$\n\n";

  solution += "\\subsection{Bước 3: Loại bỏ phụ thuộc hàm thừa}\n\n";

  const { fds: step3FDs, steps: step3Steps } = removeRedundantFDs(currentFDs);
  currentFDs = step3FDs;
  solution += "\\begin{itemize}\n";
  for (const step of step3Steps) {
    const fdLhs = [...step.fd.lhs].join("");
    const fdRhs = [...step.fd.rhs].join("");
    const closureStr = [...step.tempClosure].join(", ");
    const rhsAttr = step.fd.rhs.values().next().value;

    solution += `\\item \\textbf{Xét phụ thuộc hàm} $${fdLhs} \\to ${fdRhs}$: $(${fdLhs})^+ = \\{${closureStr}\\}$ `;

    if (step.isRedundant) {
      solution += `chứa $\\boldsymbol{${rhsAttr}}$ nên phụ thuộc hàm này là thừa và bị loại bỏ.\n`;
    } else {
      solution += `không chứa  $\\boldsymbol{${rhsAttr}}$ nên phụ thuộc hàm này không bị loại bỏ.\n`;
    }
  }
  solution += "\\end{itemize}\n\n";

  solution += "$$F_3 = \\{" + fdsToLatex(currentFDs) + "\\}$$\n\n";

  solution += "Vậy tập bao phủ tối tiểu là $F_3$.";

  return solution;
}

export function findClousure(
  attrs: string,
  fds: FunctionalDependency[]
): string {
  const attrsSet = new Set<Attribute>(
    attrs
      .split("")
      .map((attr) => attr.trim())
      .filter(Boolean)
  );
  const { closure: attrsClosure, steps } = closure(attrsSet, fds);

  let solution = "\\section{Tìm đóng của tập thuộc tính}\n\n";
  const allAttributes = getAllAttributes(fds, "both");
  solution +=
    "Các thuộc tính trong tập phụ thuộc hàm ban đầu là: $" +
    formatSet(allAttributes) +
    "$.\n\n";
  solution += "$$F = \\{" + fdsToLatex(fds) + "\\}$$\n\n";

  solution += `\\subsection{Tính bao đóng của tập thuộc tính $\\{${[
    ...attrs,
  ].join("")}\\}$}\n\n`;
  solution += `Bắt đầu với $(${[...attrs].join("")})^+ = \\{${[...attrs].join(
    ", "
  )}\\}$.\n\n`;
  solution += "\\begin{itemize}\n";
  for (const step of steps) {
    const lhsStr = [...step.f.lhs].join("");
    const rhsStr = [...step.f.rhs].join("");
    const closureStr = [...step.addedAttr].join(", ");
    solution += `\\item Áp dụng phụ thuộc hàm $${lhsStr} \\to ${rhsStr}$: thêm thuộc tính $\\{${closureStr}\\}$ vào đóng.\n`;
  }
  solution += "\\end{itemize}\n\n";

  solution += `Vậy bao đóng của tập thuộc tính $\\{${[...attrs].join(
    ""
  )}\\}$ là $\\{${[...attrsClosure].join(", ")}\\}$.`;
  return solution;
}

//Phần tìm các khóa của quan hệ
export interface Node {
  id: string;
  parentId: string | null;
  attrs: Set<Attribute>;
  isKey?: boolean;
}

function isPrimaryKey(
  attrs: Set<Attribute>,
  fds: FunctionalDependency[],
  allAttrs: Set<Attribute>
): boolean {
  const { closure: attrsClosure } = closure(attrs, fds);
  return attrsClosure.size === allAttrs.size;
}

function createNode(attr: Set<Attribute>, parentId: string | null): Node {
  const id = [...attr].sort().join(",");
  return { id, parentId, attrs: attr };
}
type Tree = Record<string, Node[]>; // map parentId -> danh sách con
export function findKeys(fds: FunctionalDependency[]): {
  keys: Array<Set<Attribute>>;
  steps: Node[];
} {
  const steps: Node[] = [];
  const keys = new Array<Set<Attribute>>();
  const allAttrs = getAllAttributes(fds, "both");
  const leftAttrs = getAllAttributes(fds, "left");
  const root: Node = { id: "root", parentId: null, attrs: new Set() };
  const currentNodes: Node[] = [];
  const tree: Tree = {};

  steps.push(root);
  tree[root.id] = [];

  for (const attr of leftAttrs) {
    root.attrs.add(attr);
    const childNode = createNode(new Set([attr]), root.id);
    tree[root.id].push(childNode);
    steps.push(childNode);
    if (isPrimaryKey(childNode.attrs, fds, allAttrs)) {
      childNode.isKey = true;
      keys.push(childNode.attrs);
      continue;
    }
    currentNodes.push(childNode);
  }

  while (currentNodes.length > 0) {
    const node = currentNodes.shift()!;
    if (isPrimaryKey(node.attrs, fds, allAttrs)) {
      node.isKey = true;
      keys.push(node.attrs);
      continue;
    }
    const siblingNodes: Node[] = tree[node.parentId!] || [];

    if (!tree[node.id]) {
      tree[node.id] = [];
    }
    let start = false;

    for (let i = 0; i < siblingNodes.length; i++) {
      const siblingNode = siblingNodes[i];
      if (siblingNode.id === node.id) {
        start = true;
        continue;
      }
      if (isPrimaryKey(siblingNode.attrs, fds, allAttrs)) continue;
      if (!start) continue;

      const newAttrs = new Set<Attribute>([
        ...node.attrs,
        ...siblingNode.attrs,
      ]);
      const newNode = createNode(newAttrs, node.id);
      steps.push(newNode);
      currentNodes.push(newNode);
      tree[node.id].push(newNode);
    }
  }
  return { keys, steps };
}
export function findCandidateKeys(fds: FunctionalDependency[]): {
  keys: Array<Set<Attribute>>;
  solution: string;
  steps: Node[];
} {
  const { keys, steps } = findKeys(fds);

  let solution = "\\section{Tìm khóa chính}\n\n";
  const allAttributes = getAllAttributes(fds, "both");
  solution += solution +=
    "Các thuộc tính trong tập phụ thuộc hàm ban đầu là: $" +
    formatSet(allAttributes) +
    "$.\n\n";

  solution += "$$F = \\{" + fdsToLatex(fds) + "\\}$$\n\n";

  const root = steps.shift();
  let level = 0;
  steps.forEach((step) => {
    if (step.attrs.size > level) {
      if (level > 0) {
        solution += "\\end{itemize}\n\n";
      }

      level = step.attrs.size;
      solution += `\\subsection{Xét các tập thuộc tính có ${level} thuộc tính}\n\n`;
      solution += "\\begin{itemize}\n";
    }

    const { closure: closureTemp } = closure(step.attrs, fds);

    solution += `\\item Xét tập $\\{${[...step.attrs].join("")}\\}$: `;
    solution += `$(${[...step.attrs].join("")})^+ = \\{${[...closureTemp].join(
      ", "
    )}\\}$ `;

    if (step.isKey) {
      solution += `$\\to$ Chứa tất cả các thuộc tính nên $\\{${[
        ...step.attrs,
      ].join("")}\\}$ là \\textbf{khóa chính}.\n`;
    } else {
      solution += `$\\to$ Không chứa tất cả các thuộc tính nên $\\{${[
        ...step.attrs,
      ].join("")}\\}$ \\textbf{không phải} khóa chính.\n`;
    }
  });

  if (level > 0) {
    solution += "\\end{itemize}\n\n";
  }

  solution += "\\textbf{Kết luận} :";
  if (keys.length === 0) {
    solution += "Không tìm thấy khóa chính nào.";
  } else {
    solution +=
      "Các khóa chính tìm được là: " +
      keys.map((key) => `$\\{${[...key].join("")}\\}$`).join(", ") +
      ".";
  }

  steps.unshift(root!); // Thêm lại node gốc
  return { keys, solution, steps };
}

export function convertToReactFlow(steps: Node[]): {
  nodes: FlowNode[];
  edges: Edge[];
} {
  const nodes: FlowNode[] = steps.map((step, index) => ({
    id: step.id,
    data: {
      label: `{${[...step.attrs].join(",")}}`,
      isKey: step.isKey,
    },
    position: { x: 0, y: index * 100 },
    style: {
      background: step.isKey ? "#86efac" : "#fff",
      border: step.isKey ? "2px solid #22c55e" : "1px solid #ddd",
    },
  }));

  const edges: Edge[] = steps
    .filter((step) => step.parentId)
    .map((step) => ({
      id: `${step.parentId}-${step.id}`,
      source: step.parentId!,
      target: step.id,
    }));

  return { nodes, edges };
}

//Xét tính phụ thuộc hàm tương đương
export function areEquivalentFDs(
  fds1: FunctionalDependency[],
  fds2: FunctionalDependency[]
): string {
  // ✅ Đã xóa định nghĩa hàm helper (formatSet, formatAttrs, ...) ở đây
  // vì chúng đã được chuyển lên global

  let f2CoversF1 = true; // Cờ cho F_1 \subseteq F_2^+
  let f1CoversF2 = true; // Cờ cho F_2 \subseteq F_1^+

  let solution =
    "\\section{Kiểm tra tính tương đương của \\( F_1 \\) và \\( F_2 \\)}\n\n";

  // --- Bước 1: Kiểm tra F_1 \subseteq F_2^+ ---
  solution += "\\subsection{Bước 1: Kiểm tra \\( F_1 \\subseteq F_2^+ \\)}\n";
  solution +=
    "Ta xét từng phụ thuộc hàm trong \\( F_1 \\) và tìm bao đóng của vế trái đối với \\( F_2 \\).\n";
  solution += "\\begin{itemize}\n";

  for (const fd of fds1) {
    const { closure: closure2 } = closure(fd.lhs, fds2);
    const isSubset = [...fd.rhs].every((attr) => closure2.has(attr));

    if (!isSubset) {
      f2CoversF1 = false;
    }

    const fdLatex = `\\( ${formatAttrs(fd.lhs)} \\to ${formatAttrs(
      fd.rhs
    )} \\)`;
    solution += `  \\item Xét ${fdLatex}: \\\\ \n`;
    solution += `  Tìm \\( ${formatClosure(
      fd.lhs
    )} \\) đối với \\( F_2 \\): \\( ${formatClosure(fd.lhs)} = ${formatSet(
      closure2
    )} \\). \\\\ \n`;
    solution += `  So sánh vế phải \\( ${formatSet(
      fd.rhs
    )} \\) với bao đóng: \\\\ \n`;

    if (isSubset) {
      solution += `  Ta thấy \\( ${formatSet(fd.rhs)} \\subseteq ${formatSet(
        closure2
      )} \\). (\\textbf{Đúng})\n`;
    } else {
      solution += `  Ta thấy \\( ${formatSet(fd.rhs)} \\nsubseteq ${formatSet(
        closure2
      )} \\). (\\textbf{Sai})\n`;
    }
  }
  solution += "\\end{itemize}\n";

  if (f2CoversF1) {
    solution +=
      "\\textbf{Kết luận Bước 1:} Mọi phụ thuộc hàm trong \\( F_1 \\) đều được \\( F_2 \\) suy ra. (\\( F_1 \\subseteq F_2^+ \\))\n\n";
  } else {
    solution +=
      "\\textbf{Kết luận Bước 1:} Tồn tại phụ thuộc hàm trong \\( F_1 \\) không được \\( F_2 \\) suy ra. (\\( F_1 \\nsubseteq F_2^+ \\))\n\n";
  }

  // --- Bước 2: Kiểm tra F_2 \subseteq F_1^+ ---
  solution += "\\subsection{Bước 2: Kiểm tra \\( F_2 \\subseteq F_1^+ \\)}\n";
  solution +=
    "Ta xét từng phụ thuộc hàm trong \\( F_2 \\) và tìm bao đóng của vế trái đối với \\( F_1 \\).\n";
  solution += "\\begin{itemize}\n";

  for (const fd of fds2) {
    const { closure: closure1 } = closure(fd.lhs, fds1);
    const isSubset = [...fd.rhs].every((attr) => closure1.has(attr));

    if (!isSubset) {
      f1CoversF2 = false;
    }

    const fdLatex = `\\( ${formatAttrs(fd.lhs)} \\to ${formatAttrs(
      fd.rhs
    )} \\)`;
    solution += `  \\item Xét ${fdLatex}: \\\\ \n`;
    solution += `  Tìm \\( ${formatClosure(
      fd.lhs
    )} \\) đối với \\( F_1 \\): \\( ${formatClosure(fd.lhs)} = ${formatSet(
      closure1
    )} \\). \\\\ \n`;
    solution += `  So sánh vế phải \\( ${formatSet(
      fd.rhs
    )} \\) với bao đóng: \\\\ \n`;

    if (isSubset) {
      solution += `  Ta thấy \\( ${formatSet(fd.rhs)} \\subseteq ${formatSet(
        closure1
      )} \\). (\\textbf{Đúng})\n`;
    } else {
      solution += `  Ta thấy \\( ${formatSet(fd.rhs)} \\nsubseteq ${formatSet(
        closure1
      )} \\). (\\textbf{Sai})\n`;
    }
  }
  solution += "\\end{itemize}\n";

  if (f1CoversF2) {
    solution +=
      "\\textbf{Kết luận Bước 2:} Mọi phụ thuộc hàm trong \\( F_2 \\) đều được \\( F_1 \\) suy ra. (\\( F_2 \\subseteq F_1^+ \\))\n\n";
  } else {
    solution +=
      "\\textbf{Kết luận Bước 2:} Tồn tại phụ thuộc hàm trong \\( F_2 \\) không được \\( F_1 \\) suy ra. (\\( F_2 \\nsubseteq F_1^+ \\))\n\n";
  }

  // --- Kết luận cuối cùng ---
  solution += "\n\n\\textbf{Kết luận cuối cùng}\n\n";
  if (f1CoversF2 && f2CoversF1) {
    solution +=
      "Vì \\( F_1 \\subseteq F_2^+ \\) và \\( F_2 \\subseteq F_1^+ \\), hai tập phụ thuộc hàm \\( F_1 \\) và \\( F_2 \\) là **tương đương**.";
  } else {
    solution +=
      "Vì một trong hai (hoặc cả hai) phép kiểm tra trên thất bại, hai tập phụ thuộc hàm \\( F_1 \\) và \\( F_2 \\) là **không tương đương**.";
  }

  return solution;
}

// Xác định dạng chuẩn của quan hệ
export function determineNormalForm(fds: FunctionalDependency[]): string {
  // ✅ Đã xóa định nghĩa hàm helper (formatSet, formatAttrs) ở đây

  const allAttributes = getAllAttributes(fds, "both");
  const { fds: simpleFDs } = splitRHS(fds);
  const { keys } = findKeys(fds);

  let solution = "\\section{Xác định dạng chuẩn của quan hệ}\n\n";

  solution +=
    "Các thuộc tính trong tập phụ thuộc hàm ban đầu là: $" +
    formatSet(allAttributes) +
    "$.\n\n";

  solution += "$$F = \\{" + fdsToLatex(fds) + "\\}$$\n\n";

  if (keys.length === 0) {
    return (
      solution +
      "Không tìm thấy khóa chính (tập phụ thuộc hàm rỗng hoặc không hợp lệ)."
    );
  }

  const primeAttrs = new Set<Attribute>();
  keys.forEach((key) => key.forEach((attr) => primeAttrs.add(attr)));

  const nonPrimeAttrs = new Set<Attribute>();
  allAttributes.forEach((attr) => {
    if (!primeAttrs.has(attr)) nonPrimeAttrs.add(attr);
  });

  solution += "\\subsection{Xác định khóa và thuộc tính}\n\n";
  solution += `\\begin{itemize}\n`;
  solution += `\\item \\textbf{Thuộc tính khóa (Prime):} $${formatSet(
    primeAttrs
  )}$ (thuộc các khóa: ${keys
    .map((k) => `$${formatAttrs(k)}$`)
    .join(", ")}).\n`;
  solution += `\\item \\textbf{Thuộc tính không khóa (Non-prime):} $${formatSet(
    nonPrimeAttrs
  )}$.\n`;
  solution += `\\end{itemize}\n\n`;

  // BƯỚC 2: KIỂM TRA 2NF

  solution += "\\subsection{Kiểm tra Dạng chuẩn 2 (2NF)}\n\n";
  solution +=
    "Dạng chuẩn 2 yêu cầu quan hệ đạt 1NF và \\textit{không} có phụ thuộc bộ phận (thuộc tính không khóa phụ thuộc vào một phần của khóa chính).\n\n";

  let is2NF = true;
  let violationFD_2NF: FunctionalDependency | null = null;
  let violationKey_2NF: Set<Attribute> | null = null;

  for (const fd of simpleFDs) {
    const rhsAttr = [...fd.rhs][0];
    if (primeAttrs.has(rhsAttr)) continue;

    for (const key of keys) {
      const lhsArr = [...fd.lhs];
      const keyArr = [...key];
      const isSubset = lhsArr.every((val) => key.has(val));
      const isProper = lhsArr.length < keyArr.length;

      if (isSubset && isProper) {
        is2NF = false;
        violationFD_2NF = fd;
        violationKey_2NF = key;
        break;
      }
    }
    if (!is2NF) break;
  }

  if (!is2NF) {
    solution += `\\textbf{Xét phụ thuộc hàm} $${formatAttrs(
      violationFD_2NF!.lhs
    )} \\to ${formatAttrs(violationFD_2NF!.rhs)}$:\n\n`;
    solution += "\\begin{itemize}\n";
    solution += `\\item $${formatAttrs(
      violationFD_2NF!.rhs
    )}$ là thuộc tính không khóa.\n`;
    solution += `\\item $${formatAttrs(
      violationFD_2NF!.lhs
    )}$ là một phần thực sự của khóa $${formatSet(
      violationKey_2NF!
    )}$ (vì $${formatAttrs(violationFD_2NF!.lhs)} \\subset ${formatAttrs(
      violationKey_2NF!
    )}$).\n`;
    solution += `\\item $\\to$ Đây là một \\textbf{phụ thuộc bộ phận}.\n`;
    solution += "\\end{itemize}\n\n";
    solution += "Do đó, lược đồ quan hệ \\textbf{không đạt 2NF}.\n\n";
    solution +=
      "Vì quan hệ không đạt 2NF, thì nó cũng \\textbf{không đạt 3NF} và \\textbf{không đạt BCNF}.\n\n";
    solution +=
      "\\textbf{Kết luận} : Quan hệ đạt dạng chuẩn cao nhất là \\textbf{1NF}.";
    return solution;
  }

  solution +=
    "Nhận xét: Mọi thuộc tính không khóa đều phụ thuộc đầy đủ vào khóa chính. Quan hệ \\textbf{đạt 2NF}.\n\n";

  // BƯỚC 3: KIỂM TRA 3NF

  solution += "\\subsection{Kiểm tra Dạng chuẩn 3 (3NF)}\n\n";
  solution +=
    "Dạng chuẩn 3 yêu cầu đạt 2NF và \\textit{không} có phụ thuộc bắc cầu (thuộc tính không khóa phụ thuộc vào thuộc tính không khóa khác).\n\n";

  let is3NF = true;
  let violationFD_3NF: FunctionalDependency | null = null;

  for (const fd of simpleFDs) {
    const rhsAttr = [...fd.rhs][0];
    if (primeAttrs.has(rhsAttr)) continue;

    let isSuperKey = false;
    for (const key of keys) {
      if ([...key].every((k) => fd.lhs.has(k))) {
        isSuperKey = true;
        break;
      }
    }

    if (!isSuperKey) {
      is3NF = false;
      violationFD_3NF = fd;
      break;
    }
  }

  if (!is3NF) {
    solution += `\\textbf{Xét phụ thuộc hàm} $${formatAttrs(
      violationFD_3NF!.lhs
    )} \\to ${formatAttrs(violationFD_3NF!.rhs)}$:\n\n`;
    solution += "\\begin{itemize}\n";
    solution += `\\item $${formatAttrs(
      violationFD_3NF!.rhs
    )}$ là thuộc tính không khóa.\n`;
    solution += `\\item $${formatAttrs(
      violationFD_3NF!.lhs
    )}$ không phải là siêu khóa (không chứa khóa nào).\n`;
    solution += `\\item $\\to$ Đây là một \\textbf{phụ thuộc bắc cầu}.\n`;
    solution += "\\end{itemize}\n\n";
    solution += "Do đó, lược đồ quan hệ \\textbf{không đạt 3NF}.\n\n";
    solution +=
      "Vì quan hệ không đạt 3NF, nó cũng \\textbf{không đạt BCNF}.\n\n";
    solution +=
      "\\textbf{Kết luận} : Quan hệ đạt dạng chuẩn cao nhất là \\textbf{2NF}.";
    return solution;
  }

  solution +=
    "Nhận xét: Mọi phụ thuộc hàm đều thỏa mãn (vế trái là siêu khóa hoặc vế phải là thuộc tính khóa). Quan hệ \\textbf{đạt 3NF}.\n\n";

  // BƯỚC 4: KIỂM TRA BCNF

  solution += "\\subsection{Kiểm tra Dạng chuẩn Boyce-Codd (BCNF)}\n\n";
  solution +=
    "BCNF yêu cầu với mọi phụ thuộc hàm (không hiển nhiên), vế trái phải là siêu khóa.\n\n";

  let isBCNF = true;
  let violationFD_BCNF: FunctionalDependency | null = null;

  for (const fd of simpleFDs) {
    if (fd.rhs.has([...fd.lhs][0])) continue;

    let isSuperKey = false;
    for (const key of keys) {
      if ([...key].every((k) => fd.lhs.has(k))) {
        isSuperKey = true;
        break;
      }
    }

    if (!isSuperKey) {
      isBCNF = false;
      violationFD_BCNF = fd;
      break;
    }
  }

  if (!isBCNF) {
    solution += `\\textbf{Xét phụ thuộc hàm} $${formatAttrs(
      violationFD_BCNF!.lhs
    )} \\to ${formatAttrs(violationFD_BCNF!.rhs)}$:\n\n`;
    solution += "\\begin{itemize}\n";
    solution += `\\item Vế trái $${formatAttrs(
      violationFD_BCNF!.lhs
    )}$ không phải là siêu khóa.\n`;
    solution += `\\item $\\to$ Vi phạm điều kiện BCNF.\n`;
    solution += "\\end{itemize}\n\n";
    solution += "\\textbf{Kết luận} :";
    solution +=
      "Lược đồ quan hệ \\textbf{không đạt BCNF}. Dạng chuẩn cao nhất là \\textbf{3NF}.";
    return solution;
  }

  solution += "Nhận xét: Mọi định thức đều là siêu khóa.\n\n";
  solution += "\\textbf{Kết luận} :";
  solution += "Quan hệ \\textbf{đạt chuẩn BCNF}.";

  return solution;
}

//Kiểm tra tính bảo toàn dữ liệu
export interface Cell {
  value: string;
  isOriginal: boolean;
  row: number;
  col: number;
}
export interface ChaseStep {
  description: string;
  matrix: string[][];
  highlightCells: { row: number; col: number }[];
}
export interface ChaseResult {
  solution: string;
  steps: ChaseStep[];
  isLossless: boolean;
  headers: string[];
  rowNames: string[];
}

export function matrixToLatex(
  headers: string[],
  rows: string[], // mảng này sẽ chứa "R_{1}", "R_{2}"...
  matrix: string[][],
  highlightCells: { row: number; col: number }[] = []
): string {
  let latex = `\\begin{array}{|c|${"c|".repeat(headers.length)}} \\hline\n`;

  const headerRow = headers.map((h) => `\\text{${h}}`).join(" & ");
  latex += `\\text{Lược đồ} & ${headerRow} \\\\ \\hline\n`;

  matrix.forEach((row, rowIndex) => {
    const rowName = rows[rowIndex]; // VD: "R_{1}"
    const rowCells = row.map((val, colIndex) => {
      const isHighlight = highlightCells.some(
        (h) => h.row === rowIndex && h.col === colIndex
      );
      return isHighlight ? `\\textcolor{red}{${val}}` : val;
    });
    latex += `${rowName} & ${rowCells.join(" & ")} \\\\ \\hline\n`;
  });

  latex += `\\end{array}`;
  return latex;
}

export function checkDataPreservation(
  fds: FunctionalDependency[],
  relations: Set<string>[]
): ChaseResult {
  const allAttrs = Array.from(getAllAttributes(fds, "both")).sort();
  const headers = allAttrs;

  const rowNames = relations.map(
    (rel, i) => `R_{${i + 1}}(\\text{${formatAttrs(rel)}})`
  );

  // 1. Khởi tạo bảng ban đầu (Logic a_j chuẩn)
  const matrix: string[][] = relations.map((rel, rowIndex) => {
    return allAttrs.map((attr, colIndex) => {
      if (rel.has(attr)) {
        return `a_{${colIndex + 1}}`; // a_j (theo cột)
      } else {
        return `b_{${rowIndex + 1}${colIndex + 1}}`; // b_ij
      }
    });
  });

  const steps: ChaseStep[] = [];
  let solution =
    "\\section{Kiểm tra bảo toàn thông tin (Thuật toán Chase)}\n\n";

  // Thông tin input
  solution += `\\begin{itemize}\n`;
  solution += `\\item Lược đồ gốc $R = ${formatSet(new Set(allAttrs))}$.\n`;
  solution += `\\item Phép tách $\\rho = ${formatSet(new Set(rowNames))}$.\n`;
  solution += `\\item Tập phụ thuộc hàm $F = \\{ ${fdsToLatex(fds)} \\}$.\n`;
  solution += `\\end{itemize}\n\n`;

  solution +=
    "Ta lập bảng tableau ban đầu (điền $a_j$ nếu $R_i$ có thuộc tính $j$, ngược lại điền $b_{ij}$):\n\n";
  solution += `$$${matrixToLatex(headers, rowNames, matrix)}$$\n\n`;

  steps.push({
    description: "Bảng khởi tạo",
    matrix: JSON.parse(JSON.stringify(matrix)),
    highlightCells: [],
  });

  // 2. Vòng lặp Chase
  let changed = true;
  let loopCount = 0;
  const MAX_LOOP = 20;

  while (changed && loopCount < MAX_LOOP) {
    changed = false;
    loopCount++;

    for (const fd of fds) {
      const lhsIndices = Array.from(fd.lhs).map((attr) =>
        allAttrs.indexOf(attr)
      );
      const rhsIndices = Array.from(fd.rhs).map((attr) =>
        allAttrs.indexOf(attr)
      );

      const groups = new Map<string, number[]>();
      matrix.forEach((row, rowIndex) => {
        const key = lhsIndices
          .map((colIdx) => (colIdx !== -1 ? row[colIdx] : ""))
          .join("|");
        groups.set(key, (groups.get(key) || []).concat(rowIndex));
      });

      for (const [key, rowIndices] of groups) {
        if (rowIndices.length < 2) continue;

        for (const rhsColIdx of rhsIndices) {
          if (rhsColIdx === -1) continue;

          const values = rowIndices.map((rIdx) => matrix[rIdx][rhsColIdx]);
          const uniqueValues = new Set(values);

          if (uniqueValues.size <= 1) continue;

          let targetVal = [...uniqueValues].find((v) => v.startsWith("a"));
          if (!targetVal) {
            targetVal = [...uniqueValues].sort(
              (a, b) => getNumericIndex(a) - getNumericIndex(b)
            )[0];
          }

          const valuesToReplace = [...uniqueValues].filter(
            (v) => v !== targetVal
          );

          if (valuesToReplace.length > 0) {
            const stepHighlights: { row: number; col: number }[] = [];

            for (const oldVal of valuesToReplace) {
              rowIndices.forEach((rIdx) => {
                if (matrix[rIdx][rhsColIdx] === oldVal) {
                  matrix[rIdx][rhsColIdx] = targetVal!;
                  stepHighlights.push({ row: rIdx, col: rhsColIdx });
                  changed = true;
                }
              });
            }

            if (changed) {
              const fdLatex = `${Array.from(fd.lhs).join("")} \\to ${Array.from(
                fd.rhs
              ).join("")}`;
              const rowsLatex = rowIndices
                .map((i) => `R_{${i + 1}}`)
                .join(", ");
              const colLatex = allAttrs[rhsColIdx];

              const desc = `Áp dụng PTH $${fdLatex}$: Đồng nhất các dòng $${rowsLatex}$ tại cột $${colLatex}$. (Hợp nhất $${valuesToReplace
                .map((v) => `$${v}$`)
                .join(", ")}$ vào $${targetVal}$).`;

              solution += `${desc}\n\n`;
              solution += `$$${matrixToLatex(
                headers,
                rowNames,
                matrix,
                stepHighlights
              )}$$\n\n`;

              steps.push({
                description: desc,
                matrix: JSON.parse(JSON.stringify(matrix)),
                highlightCells: stepHighlights,
              });
            }
          }
        }
      }
    }
  }

  // 3. Kết luận
  const losslessRowIndex = matrix.findIndex((row) =>
    row.every((cell) => cell.startsWith("a"))
  );
  const isLossless = losslessRowIndex !== -1;

  solution += "\\textbf{Kết luận:}\n\n";
  if (isLossless) {
    solution += `Dòng $R_{${
      losslessRowIndex + 1
    }}$ chứa toàn các ký hiệu $a$ (không còn $b$).\n\n`;
    solution +=
      "$\\to$ Lược đồ phân rã \\textbf{BẢO TOÀN THÔNG TIN} (Lossless Join).";
  } else {
    solution += "Không có dòng nào chứa toàn các ký hiệu $a$.\n\n";
    solution +=
      "$\\to$ Lược đồ phân rã \\textbf{KHÔNG BẢO TOÀN THÔNG TIN} (Lossy Join).";
  }

  return {
    solution,
    steps,
    isLossless,
    headers,
    rowNames,
  };
}

export function checkDependencyPreservation(
  fds: FunctionalDependency[],
  relations: Set<Attribute>[]
): string {
  const allAttrs = getAllAttributes(fds, "both");

  let solution = "\\section{Kiểm tra bảo toàn phụ thuộc hàm}\n\n";

  // Thông tin input
  solution += `\\begin{itemize}\n`;
  solution += `\\item Lược đồ gốc $R = ${formatSet(allAttrs)}$.\n`;
  solution += `\\item Phép tách $\\rho = \\{ ${relations
    .map((r) => formatAttrs(r))
    .join(", ")} \\}$.\n`;
  solution += `\\item Tập phụ thuộc hàm $F = \\{ ${fdsToLatex(fds)} \\}$.\n`;
  solution += `\\end{itemize}\n\n`;

  let allPreserved = true;

  // 1. DUYỆT QUA TỪNG PHỤ THUỘC HÀM TRONG F
  for (const fd of fds) {
    const fdLatex = `$${formatAttrs(fd.lhs)} \\to ${formatAttrs(fd.rhs)}$`;
    solution += `\\subsection{Kiểm tra phụ thuộc hàm ${fdLatex}}\n\n`;

    // 2. KIỂM TRA TRƯỜNG HỢP HIỂN NHIÊN
    const combinedAttrs = new Set([...fd.lhs, ...fd.rhs]);
    let isObvious = false;
    let obviousRelation: Set<Attribute> | null = null;

    for (const r of relations) {
      if (isSubset(combinedAttrs, r)) {
        isObvious = true;
        obviousRelation = r;
        break;
      }
    }

    if (isObvious) {
      solution += `Phụ thuộc hàm này \\textbf{được bảo toàn} (một cách hiển nhiên), vì tất cả các thuộc tính ($${formatAttrs(
        combinedAttrs
      )}$) đều nằm trong lược đồ con $R(${formatAttrs(
        obviousRelation!
      )})$.\n\n`;
      continue;
    }

    // 3. THUẬT TOÁN Z (Chạy ngầm)
    solution +=
      "Đây là trường hợp không hiển nhiên. Ta phải dùng thuật toán Z (thuật toán 'đuổi') để tính bao đóng $Z$ của vế trái theo phép chiếu $\\rho$.\n\n";

    const Z = new Set(fd.lhs);
    let changed = true;
    let loopCount = 0;

    // --- Bắt đầu chạy ngầm ---
    while (changed && loopCount < 10) {
      changed = false;
      loopCount++;

      for (const [i, r_i] of relations.entries()) {
        const V = intersection(Z, r_i);
        if (V.size === 0) continue;

        const { closure: V_plus } = closure(V, fds);
        const newAttrsInRi = intersection(V_plus, r_i);

        const oldZSize = Z.size;
        newAttrsInRi.forEach((attr) => Z.add(attr));
        const newZSize = Z.size;

        if (newZSize > oldZSize) {
          changed = true;
        }
      }
    }
    // --- Kết thúc chạy ngầm ---

    // 4. BÁO CÁO KẾT QUẢ (Lời giải)
    const isPreserved = isSubset(fd.rhs, Z);
    solution += `\\begin{itemize}\n`;
    solution += `\\item Khởi tạo: $Z = ${formatSet(fd.lhs)}$.\n`;
    solution += `\\item Kết quả (sau khi chạy thuật toán): $Z = \\textbf{${formatSet(
      Z
    )}}$.\n`;
    solution += `\\item Kiểm tra vế phải $${formatSet(
      fd.rhs
    )} \\subseteq Z$? \n`;

    if (isPreserved) {
      solution += `\\quad $\\to$ \\textbf{ĐÚNG}. Phụ thuộc hàm này \\textbf{được bảo toàn}.\n`;
    } else {
      solution += `\\quad $\\to$ \\textbf{SAI}. Phụ thuộc hàm này \\textbf{KHÔNG được bảo toàn}.\n`;
      allPreserved = false;
    }
    solution += `\\end{itemize}\n\n`;
  }

  // 5. KẾT LUẬN CUỐI CÙNG
  solution += "\\section{Kết luận cuối cùng}\n\n";
  if (allPreserved) {
    solution += "Tất cả các phụ thuộc hàm trong $F$ đều được bảo toàn.\n\n";
    solution += "$\\to$ Phép phân rã này \\textbf{BẢO TOÀN PHỤ THUỘC HÀM}.";
  } else {
    solution +=
      "Tồn tại ít nhất một phụ thuộc hàm trong $F$ không được bảo toàn.\n\n";
    solution +=
      "$\\to$ Phép phân rã này \\textbf{KHÔNG BẢO TOÀN PHỤ THUỘC HÀM}.\n\n";
  }

  solution += `\\quad \\textit{Giải thích: Thuật toán Z khởi tạo $Z$ bằng vế trái (LHS). 
    Nó lặp đi lặp lại qua tất cả các lược đồ con $R_i$. 
    Tại mỗi $R_i$, nó tính toán những gì $Z$ có thể suy ra thêm (dùng $F$ gốc), 
    nhưng chỉ giới hạn trong các thuộc tính mà $R_i$ sở hữu. 
    Kết quả mới được thêm lại vào $Z$. Quá trình dừng lại khi $Z$ không thể lớn thêm. 
    Mục tiêu là xem $Z$ cuối cùng có chứa được vế phải (RHS) hay không.} \n\n`;

  return solution;
}
//Nâng cấp lên 3NF
export function decomposeTo3NF(fds: FunctionalDependency[]): string {
  const allAttrs = getAllAttributes(fds, "both");
  let solution = "\\section{Phân rã thành 3NF (Thuật toán Tổng hợp)}\n\n";

  // Thông tin input
  solution += `\\begin{itemize}\n`;
  solution += `\\item Lược đồ gốc $R = ${formatSet(allAttrs)}$.\n`;
  solution += `\\item Tập phụ thuộc hàm $F = \\{ ${fdsToLatex(fds)} \\}$.\n`;
  solution += `\\end{itemize}\n\n`;

  // --- BƯỚC 1: TÌM PHỦ TỐI TIỂU (F_min) ---
  solution += "\\subsection{Bước 1: Tìm Phủ Tối Tiểu ($F_{min}$)}\n\n";

  // Chạy ngầm 3 bước của Phủ Tối Tiểu
  const { fds: step1FDs } = splitRHS(fds);
  let currentFDs = removeDuplicateFDs(step1FDs);
  const step2FDs: FunctionalDependency[] = [];
  for (let i = 0; i < currentFDs.length; i++) {
    const fd = currentFDs[i];
    const otherFDs = currentFDs.filter((_, idx) => idx !== i);
    if (!isCanMinimizeLHS(fd, otherFDs)) {
      step2FDs.push(fd);
    } else {
      const { minizedFDs } = minimizeLHS(fd, otherFDs);
      step2FDs.push(...minizedFDs);
    }
  }
  currentFDs = removeDuplicateFDs(step2FDs);
  const { fds: step3FDs } = removeRedundantFDs(currentFDs);
  const minimalCoverFDs = step3FDs; // Đây chính là F_min

  solution +=
    "Sau khi thực hiện 3 bước (tách vế phải, loại bỏ vế trái dư, loại bỏ PTH thừa), ta thu được Phủ Tối Tiểu:\n\n";
  solution += `$$F_{min} = \\{ ${fdsToLatex(minimalCoverFDs)} \\}$$\n\n`;

  // --- BƯỚC 2: TẠO LƯỢC ĐỒ CON (TỪ F_min) ---
  solution += "\\subsection{Bước 2: Tạo lược đồ con từ $F_{min}$}\n\n";
  solution +=
    "Ta nhóm các PTH trong $F_{min}$ có cùng vế trái lại để tạo các lược đồ con:\n\n";

  const groupedSchemas = new Map<string, Set<Attribute>>();
  for (const fd of minimalCoverFDs) {
    const lhsKey = [...fd.lhs].sort().join("");
    if (!groupedSchemas.has(lhsKey)) {
      groupedSchemas.set(lhsKey, new Set(fd.lhs));
    }
    fd.rhs.forEach((attr) => groupedSchemas.get(lhsKey)!.add(attr));
  }
  const newRelations: Set<Attribute>[] = Array.from(groupedSchemas.values());

  solution += `\\begin{itemize}\n`;
  for (const [i, rel] of newRelations.entries()) {
    solution += `\\item $R_{${i + 1}}(${formatAttrs(rel)})$ \n`;
  }
  solution += `\\end{itemize}\n\n`;

  // --- BƯỚC 3: TÌM KHÓA CHÍNH (CỦA F GỐC) - ĐÃ LÀM RÕ ---
  solution += "\\subsection{Bước 3: Tìm khóa chính của lược đồ gốc $R$}\n\n";

  // 1. Phân loại thuộc tính (L, R, LR, N)
  solution +=
    "Ta sử dụng phương pháp phân loại thuộc tính (dựa trên $F$ gốc):\n";
  const leftAttrs = getAllAttributes(fds, "left");
  const rightAttrs = getAllAttributes(fds, "right");

  const L = new Set([...leftAttrs].filter((x) => !rightAttrs.has(x)));
  const R = new Set([...rightAttrs].filter((x) => !leftAttrs.has(x)));
  const LR = intersection(leftAttrs, rightAttrs);
  const N = new Set(
    [...allAttrs].filter((x) => !leftAttrs.has(x) && !rightAttrs.has(x))
  );

  solution += `\\begin{itemize}\n`;
  solution += `\\item Thuộc tính chỉ vế trái (L): $${formatSet(L)}$.\n`;
  solution += `\\item Thuộc tính chỉ vế phải (R): $${formatSet(R)}$.\n`;
  solution += `\\item Thuộc tính trung gian (LR): $${formatSet(LR)}$.\n`;
  solution += `\\item Thuộc tính không xuất hiện (N): $${formatSet(N)}$.\n`;
  solution += `\\end{itemize}\n\n`;

  // 2. Tính bao đóng tập nguồn
  const Base = new Set([...L, ...N]); // Tập nguồn = L U N
  solution += `Tập nguồn (Base) để bắt đầu tìm khóa là (L $\\cup$ N): $${formatSet(
    Base
  )}$.\n\n`;
  const { closure: baseClosure } = closure(Base, fds);

  solution += `Ta tính bao đóng của tập nguồn: ${toLatexClosure(
    Base,
    baseClosure
  )} .\n`;

  // 3. Kết luận về khóa
  // Chạy hàm findKeys thật để lấy kết quả chính xác (phòng trường hợp L/R/N shortcut bị sai)
  const { keys } = findKeys(fds);

  if (isSubset(allAttrs, baseClosure) && keys.length === 1) {
    solution += `Vì bao đóng của $${formatAttrs(
      Base
    )}$ chứa tất cả thuộc tính của $R$, nên $${formatSet(
      Base
    )}$ là khóa chính duy nhất.\n\n`;
  } else {
    // Nếu Base không là khóa, hoặc có nhiều hơn 1 khóa
    solution += `Bao đóng của tập nguồn không chứa đủ thuộc tính, hoặc tồn tại nhiều khóa. 
    Sau khi chạy thuật toán tìm khóa đầy đủ, ta có:\n\n`;
  }

  solution += `Các khóa chính của $R$ là: ${keys
    .map((k) => `$${formatSet(k)}$`)
    .join(", ")}.\n\n`;

  // --- BƯỚC 4: KIỂM TRA VÀ THÊM KHÓA (NẾU CẦN) ---
  solution += "\\subsection{Bước 4: Kiểm tra và thêm khóa (nếu cần)}\n\n";

  let keyIsPresent = false;
  for (const r of newRelations) {
    for (const k of keys) {
      if (isSubset(k, r)) {
        keyIsPresent = true;
        solution += `Lược đồ con $R(${formatAttrs(
          r
        )})$ đã chứa (bao hàm) khóa chính $${formatSet(k)}$.\n\n`;
        break;
      }
    }
    if (keyIsPresent) break;
  }

  if (!keyIsPresent) {
    solution +=
      "Không có lược đồ con nào ở Bước 2 chứa khóa chính. Để đảm bảo Bảo toàn thông tin, ta cần thêm một lược đồ con mới chỉ chứa khóa.\n\n";
    const keyToAdd = keys[0]; // Chọn khóa đầu tiên
    newRelations.push(keyToAdd);
    solution += `\\begin{itemize}\n`;
    solution += `\\item Thêm lược đồ khóa: $R_{khóa}(${formatAttrs(
      keyToAdd
    )})$ \n`;
    solution += `\\end{itemize}\n\n`;
  } else {
    solution += "Không cần thêm lược đồ khóa.\n\n";
  }

  // --- KẾT LUẬN CUỐI CÙNG ---
  solution += "\\section{Kết luận cuối cùng}\n\n";
  solution +=
    "Phép phân rã 3NF (bảo toàn thông tin và bảo toàn phụ thuộc hàm) là:\n\n";
  solution += `$$\\rho = \\{ ${newRelations
    .map((r) => formatAttrs(r))
    .join(", ")} \\}$$`;

  return solution;
}
