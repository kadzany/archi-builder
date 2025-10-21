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
import { getEdgeAnchorPoint } from '@/lib/utils/edge-anchors';

interface DiagramCanvasProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  selectedEdge?: DiagramEdge | null;
  selectedNodes?: string[];
  selectedEdges?: string[];
  onNodeClick?: (node: DiagramNode, multiSelect?: boolean) => void;
  onEdgeClick?: (edge: DiagramEdge, multiSelect?: boolean) => void;
  onCanvasDrop?: (data: any, position: { x: number; y: number }) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeResize?: (nodeId: string, size: { w: number; h: number }) => void;
  onMultiSelect?: (nodeIds: string[], edgeIds: string[]) => void;
  connectionMode?: 'arrow' | 'line' | null;
  onConnectionStart?: (nodeId: string) => void;
  onConnectionEnd?: (sourceId: string, targetId: string) => void;
}

export function DiagramCanvas({
  nodes,
  edges,
  selectedEdge,
  selectedNodes = [],
  selectedEdges = [],
  onNodeClick,
  onEdgeClick,
  onCanvasDrop,
  onNodeMove,
  onNodeResize,
  onMultiSelect,
  connectionMode,
  onConnectionStart,
  onConnectionEnd,
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 5000, height: 5000 });
  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

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

    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    setSelectedNode(node.id);
    onNodeClick?.(node, isMultiSelect);

    if (connectionMode) {
      if (!connectionSource) {
        setConnectionSource(node.id);
        onConnectionStart?.(node.id);
      } else if (connectionSource !== node.id) {
        onConnectionEnd?.(connectionSource, node.id);
        setConnectionSource(null);
      }
      return;
    }

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

  const handleResizeMouseDown = (e: React.MouseEvent, node: DiagramNode, handle: string) => {
    e.stopPropagation();
    if (!canvasRef.current || !contentRef.current) return;

    const rect = contentRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    setResizingNode(node.id);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX - rect.left + scrollLeft,
      y: e.clientY - rect.top + scrollTop,
      w: node.size.w,
      h: node.size.h,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !contentRef.current) return;

    const rect = contentRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    const currentX = e.clientX - rect.left + scrollLeft;
    const currentY = e.clientY - rect.top + scrollTop;

    setMousePosition({ x: currentX, y: currentY });

    if (isSelecting && selectionBox) {
      setSelectionBox({ ...selectionBox, end: { x: currentX, y: currentY } });
      return;
    }

    if (resizingNode && resizeHandle) {
      const node = nodes.find(n => n.id === resizingNode);
      if (!node) return;

      const currentX = e.clientX - rect.left + scrollLeft;
      const currentY = e.clientY - rect.top + scrollTop;
      const deltaX = currentX - resizeStart.x;
      const deltaY = currentY - resizeStart.y;

      let newW = resizeStart.w;
      let newH = resizeStart.h;

      if (resizeHandle.includes('e')) newW = Math.max(80, resizeStart.w + deltaX);
      if (resizeHandle.includes('w')) newW = Math.max(80, resizeStart.w - deltaX);
      if (resizeHandle.includes('s')) newH = Math.max(60, resizeStart.h + deltaY);
      if (resizeHandle.includes('n')) newH = Math.max(60, resizeStart.h - deltaY);

      onNodeResize?.(resizingNode, { w: newW, h: newH });
      return;
    }

    if (draggedNode) {
      const node = nodes.find(n => n.id === draggedNode);
      if (!node) return;

      let newX = e.clientX - rect.left + scrollLeft - dragOffset.x;
      let newY = e.clientY - rect.top + scrollTop - dragOffset.y;

      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      onNodeMove?.(draggedNode, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionBox) {
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y);
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y);

      const selectedNodeIds = nodes
        .filter(node => {
          const nodeRight = node.position.x + node.size.w;
          const nodeBottom = node.position.y + node.size.h;
          return (
            node.position.x < maxX &&
            nodeRight > minX &&
            node.position.y < maxY &&
            nodeBottom > minY
          );
        })
        .map(node => node.id);

      const selectedEdgeIds = edges
        .filter(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return false;

          const sourceCenterX = sourceNode.position.x + sourceNode.size.w / 2;
          const sourceCenterY = sourceNode.position.y + sourceNode.size.h / 2;
          const targetCenterX = targetNode.position.x + targetNode.size.w / 2;
          const targetCenterY = targetNode.position.y + targetNode.size.h / 2;

          const edgeMinX = Math.min(sourceCenterX, targetCenterX);
          const edgeMaxX = Math.max(sourceCenterX, targetCenterX);
          const edgeMinY = Math.min(sourceCenterY, targetCenterY);
          const edgeMaxY = Math.max(sourceCenterY, targetCenterY);

          return (
            edgeMinX < maxX &&
            edgeMaxX > minX &&
            edgeMinY < maxY &&
            edgeMaxY > minY
          );
        })
        .map(edge => edge.id);

      onMultiSelect?.(selectedNodeIds, selectedEdgeIds);
      setIsSelecting(false);
      setSelectionBox(null);
    }

    setDraggedNode(null);
    setResizingNode(null);
    setResizeHandle(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== contentRef.current && e.target !== canvasRef.current) return;
    if (connectionMode) return;

    const rect = contentRef.current?.getBoundingClientRect();
    const scrollLeft = canvasRef.current?.scrollLeft || 0;
    const scrollTop = canvasRef.current?.scrollTop || 0;

    if (!rect) return;

    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;

    setIsSelecting(true);
    setSelectionBox({ start: { x, y }, end: { x, y } });
    setSelectedNode(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === contentRef.current || e.target === canvasRef.current) {
      setSelectedNode(null);
      if (!isSelecting) {
        onMultiSelect?.([], []);
      }
    }
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-muted/30 overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
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
      {nodes.map((node) => {
        const isConnectionSource = connectionSource === node.id;
        const isHoverable = connectionMode && connectionSource && connectionSource !== node.id;
        const isHovered = hoveredNode === node.id;
        const isMultiSelected = selectedNodes.includes(node.id);

        const nodeProps = {
          node,
          isDragging: draggedNode === node.id,
          onMouseDown: (e: React.MouseEvent) => handleNodeMouseDown(e, node),
          onClick: () => onNodeClick?.(node),
        };

        const shape = node.style?.shape || 'rectangle';

        const NodeComponent = (() => {
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
        })();

        return (
          <div
            key={node.id}
            onMouseEnter={() => isHoverable && setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {isConnectionSource && (
              <div
                className="absolute rounded-lg animate-pulse"
                style={{
                  left: node.position.x - 8,
                  top: node.position.y - 8,
                  width: node.size.w + 16,
                  height: node.size.h + 16,
                  border: '3px solid #3b82f6',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                  zIndex: node.zIndex || 1,
                  pointerEvents: 'none',
                }}
              />
            )}
            {isHoverable && isHovered && (
              <div
                className="absolute rounded-lg"
                style={{
                  left: node.position.x - 6,
                  top: node.position.y - 6,
                  width: node.size.w + 12,
                  height: node.size.h + 12,
                  border: '2px solid #10b981',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
                  zIndex: node.zIndex || 1,
                  pointerEvents: 'none',
                }}
              />
            )}
            {isMultiSelected && (
              <div
                className="absolute rounded-lg"
                style={{
                  left: node.position.x - 4,
                  top: node.position.y - 4,
                  width: node.size.w + 8,
                  height: node.size.h + 8,
                  border: '2px solid #8b5cf6',
                  boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                  zIndex: node.zIndex || 1,
                  pointerEvents: 'none',
                }}
              />
            )}
            {NodeComponent}
            {!connectionMode && selectedNode === node.id && (
              <>
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x - 6,
                    top: node.position.y - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 'nw');
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x + node.size.w - 6,
                    top: node.position.y - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 'ne');
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x + node.size.w - 6,
                    top: node.position.y + node.size.h - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 'se');
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x - 6,
                    top: node.position.y + node.size.h - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 'sw');
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x + node.size.w / 2 - 6,
                    top: node.position.y - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 'n');
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x + node.size.w - 6,
                    top: node.position.y + node.size.h / 2 - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 'e');
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x + node.size.w / 2 - 6,
                    top: node.position.y + node.size.h - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 's');
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-md"
                  style={{
                    left: node.position.x - 6,
                    top: node.position.y + node.size.h / 2 - 6,
                    zIndex: 10000,
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResizeMouseDown(e, node, 'w');
                  }}
                />
              </>
            )}
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Empty Canvas</p>
            <p className="text-sm">Drag items from the palette to start building</p>
          </div>
        </div>
      )}

      <svg className="absolute inset-0 pointer-events-none" style={{ width: canvasSize.width, height: canvasSize.height, zIndex: 9999 }}>
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
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>
          <marker
            id="arrowhead-hover"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);

          if (!sourceNode || !targetNode) return null;

          const sourceCenterX = sourceNode.position.x + sourceNode.size.w / 2;
          const sourceCenterY = sourceNode.position.y + sourceNode.size.h / 2;
          const targetCenterX = targetNode.position.x + targetNode.size.w / 2;
          const targetCenterY = targetNode.position.y + targetNode.size.h / 2;

          const sourceAnchor = getEdgeAnchorPoint(
            sourceNode,
            { x: targetCenterX, y: targetCenterY }
          );
          const targetAnchor = getEdgeAnchorPoint(
            targetNode,
            { x: sourceCenterX, y: sourceCenterY }
          );

          const midX = (sourceAnchor.x + targetAnchor.x) / 2;
          const midY = (sourceAnchor.y + targetAnchor.y) / 2;

          const hasArrow = edge.type !== 'straight' || edge.animated;
          const isSelected = selectedEdge?.id === edge.id;
          const isHovered = hoveredEdge === edge.id;
          const isMultiSelected = selectedEdges.includes(edge.id);

          const strokeColor = isSelected ? '#3b82f6' : isMultiSelected ? '#8b5cf6' : isHovered ? '#10b981' : edge.style?.strokeColor || '#64748b';
          const strokeWidth = isSelected ? 3 : isMultiSelected ? 3 : isHovered ? 3 : edge.style?.strokeWidth || 2;
          const markerEnd = hasArrow
            ? isSelected
              ? "url(#arrowhead-selected)"
              : isMultiSelected
                ? "url(#arrowhead-selected)"
                : isHovered
                  ? "url(#arrowhead-hover)"
                  : "url(#arrowhead)"
            : undefined;

          return (
            <g key={edge.id}>
              {isSelected && (
                <line
                  x1={sourceAnchor.x}
                  y1={sourceAnchor.y}
                  x2={targetAnchor.x}
                  y2={targetAnchor.y}
                  stroke="#3b82f6"
                  strokeWidth={8}
                  opacity={0.2}
                  className="pointer-events-none"
                />
              )}
              <line
                x1={sourceAnchor.x}
                y1={sourceAnchor.y}
                x2={targetAnchor.x}
                y2={targetAnchor.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={edge.style?.strokeDasharray}
                markerEnd={markerEnd}
                className="cursor-pointer transition-all pointer-events-auto"
                onClick={() => onEdgeClick?.(edge)}
                onMouseEnter={() => setHoveredEdge(edge.id)}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{
                  filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : undefined,
                }}
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

        {connectionSource && connectionMode && (() => {
          const sourceNode = nodes.find(n => n.id === connectionSource);
          if (!sourceNode) return null;

          const sourceCenterX = sourceNode.position.x + sourceNode.size.w / 2;
          const sourceCenterY = sourceNode.position.y + sourceNode.size.h / 2;

          const sourceAnchor = getEdgeAnchorPoint(
            sourceNode,
            { x: mousePosition.x, y: mousePosition.y }
          );

          return (
            <line
              x1={sourceAnchor.x}
              y1={sourceAnchor.y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5,5"
              className="pointer-events-none"
              opacity={0.7}
            />
          );
        })()}

        {selectionBox && (
          <rect
            x={Math.min(selectionBox.start.x, selectionBox.end.x)}
            y={Math.min(selectionBox.start.y, selectionBox.end.y)}
            width={Math.abs(selectionBox.end.x - selectionBox.start.x)}
            height={Math.abs(selectionBox.end.y - selectionBox.start.y)}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="5,5"
            className="pointer-events-none"
          />
        )}
      </svg>
      </div>
    </div>
  );
}
