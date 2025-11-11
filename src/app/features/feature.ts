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

//Hàm lấy

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

export function findMinimalCover(fds: FunctionalDependency[]): string {
  const allAttributes = getAllAttributes(fds, "both");

  let solution = "\\section{Tìm phủ tối tiểu}\n\n";

  solution +=
    "Các thuộc tính trong tập phụ thuộc hàm ban đầu là: $\\{" +
    [...allAttributes].join(", ") +
    "\\}$.\n\n";

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
  solution +=
    "Các thuộc tính trong tập phụ thuộc hàm ban đầu là: $\\{" +
    [...getAllAttributes(fds, "both")].join(", ") +
    "\\}$.\n\n";
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
//Dùng tree để biểu diễn quá trình tìm khóa
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

  solution +=
    "Các thuộc tính trong tập phụ thuộc hàm ban đầu là: $\\{" +
    [...getAllAttributes(fds, "both")].join(", ") +
    "\\}$.\n\n";

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

  solution += "\\subsection{Kết luận}\n\n";
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
