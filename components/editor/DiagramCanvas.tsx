'use client';

import { useRef, useState, useEffect } from 'react';
import { DiagramNode, DiagramEdge } from '@/lib/types/diagram';
import {
  RectangleNode,
  RoundedNode,
  NoteNode,
  SwimlaneNode,
  PhaseNode,
  ProcessAreaNode,
  DiamondNode,
  EllipseNode,
  HexagonNode,
} from './shapes/NodeShapes';

interface DiagramCanvasProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onNodeClick?: (node: DiagramNode) => void;
  onEdgeClick?: (edge: DiagramEdge) => void;
  onCanvasDrop?: (data: any, position: { x: number; y: number }) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
}

export function DiagramCanvas({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  onCanvasDrop,
  onNodeMove,
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 5000, height: 5000 });

  useEffect(() => {
    if (nodes.length === 0) return;

    const maxX = Math.max(...nodes.map(n => n.position.x + n.size.w));
    const maxY = Math.max(...nodes.map(n => n.position.y + n.size.h));

    const newWidth = Math.max(5000, maxX + 1000);
    const newHeight = Math.max(5000, maxY + 1000);

    setCanvasSize({ width: newWidth, height: newHeight });
  }, [nodes]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (!canvasRef.current || !contentRef.current) return;

    const rect = contentRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    const position = {
      x: e.clientX - rect.left + scrollLeft,
      y: e.clientY - rect.top + scrollTop,
    };

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      onCanvasDrop?.(data, position);
    } catch (err) {
      console.error('Failed to parse drop data', err);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: DiagramNode) => {
    e.stopPropagation();

    if (!canvasRef.current || !contentRef.current) return;

    const rect = contentRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    setDraggedNode(node.id);
    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - node.position.x,
      y: e.clientY - rect.top + scrollTop - node.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current || !contentRef.current) return;

    const rect = contentRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    const node = nodes.find(n => n.id === draggedNode);
    if (!node) return;

    let newX = e.clientX - rect.left + scrollLeft - dragOffset.x;
    let newY = e.clientY - rect.top + scrollTop - dragOffset.y;

    newX = Math.max(0, newX);
    newY = Math.max(0, newY);

    onNodeMove?.(draggedNode, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-muted/30 overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={contentRef}
        className="relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          minWidth: '100%',
          minHeight: '100%',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
      <svg className="absolute inset-0 pointer-events-none" style={{ width: canvasSize.width, height: canvasSize.height }}>
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);

          if (!sourceNode || !targetNode) return null;

          const x1 = sourceNode.position.x + sourceNode.size.w / 2;
          const y1 = sourceNode.position.y + sourceNode.size.h / 2;
          const x2 = targetNode.position.x + targetNode.size.w / 2;
          const y2 = targetNode.position.y + targetNode.size.h / 2;

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <g key={edge.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edge.style?.strokeColor || '#64748b'}
                strokeWidth={edge.style?.strokeWidth || 2}
                strokeDasharray={edge.style?.strokeDasharray}
                markerEnd="url(#arrowhead)"
                className="cursor-pointer hover:stroke-primary transition-colors"
                onClick={() => onEdgeClick?.(edge)}
              />
              {edge.label && (
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-xs font-medium pointer-events-none"
                  style={{
                    paintOrder: 'stroke',
                    stroke: 'white',
                    strokeWidth: 3,
                  }}
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
          </marker>
        </defs>
      </svg>

      {nodes.map((node) => {
        const nodeProps = {
          node,
          isDragging: draggedNode === node.id,
          onMouseDown: (e: React.MouseEvent) => handleNodeMouseDown(e, node),
          onClick: () => onNodeClick?.(node),
        };

        const shape = node.style?.shape || 'rectangle';

        switch (shape) {
          case 'note':
            return <NoteNode key={node.id} {...nodeProps} />;
          case 'swimlane':
            return <SwimlaneNode key={node.id} {...nodeProps} />;
          case 'phase':
            return <PhaseNode key={node.id} {...nodeProps} />;
          case 'processArea':
            return <ProcessAreaNode key={node.id} {...nodeProps} />;
          case 'diamond':
            return <DiamondNode key={node.id} {...nodeProps} />;
          case 'ellipse':
            return <EllipseNode key={node.id} {...nodeProps} />;
          case 'hexagon':
            return <HexagonNode key={node.id} {...nodeProps} />;
          case 'rounded':
            return <RoundedNode key={node.id} {...nodeProps} />;
          case 'rectangle':
          default:
            return <RectangleNode key={node.id} {...nodeProps} />;
        }
      })}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Empty Canvas</p>
            <p className="text-sm">Drag items from the palette to start building</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
