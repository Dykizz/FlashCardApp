"use client";
import type { Node } from "@/app/features/feature";
import ReactFlow, {
  Node as FlowNode,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Controls,
  Background,
  BackgroundVariant,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

interface KeyTreeProps {
  steps: Node[];
  interactive?: boolean;
}

const getLayoutedElements = (nodes: FlowNode[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 75,
          y: nodeWithPosition.y - 25,
        },
      };
    }),
    edges,
  };
};

export default function KeyTree({ steps, interactive = false }: KeyTreeProps) {
  const initialNodes: FlowNode[] = steps.map((step) => ({
    id: step.id,
    data: {
      label: step.id === "root" ? "Root" : `{${[...step.attrs].join(",")}}`,
    },
    position: { x: 0, y: 0 },
    style: {
      background: step.isKey
        ? "#86efac"
        : step.id === "root"
        ? "#e0e7ff"
        : "#fff",
      border: step.isKey ? "2px solid #22c55e" : "1px solid #cbd5e1",
      borderRadius: "8px",
      padding: "10px",
      fontSize: "14px",
      fontWeight: step.isKey ? "bold" : "normal",
    },
    draggable: interactive,
    selectable: interactive,
  }));

  const initialEdges: Edge[] = steps
    .filter((step) => step.parentId)
    .map((step) => ({
      id: `${step.parentId}-${step.id}`,
      source: step.parentId!,
      target: step.id,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#94a3b8" },
      selectable: interactive,
    }));

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  return (
    <div
      style={{
        height: "600px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={interactive ? onNodesChange : undefined}
        onEdgesChange={interactive ? onEdgesChange : undefined}
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        preventScrolling={true}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
