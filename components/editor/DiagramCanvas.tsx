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
  onNodeClick?: (node: DiagramNode) => void;
  onEdgeClick?: (edge: DiagramEdge) => void;
  onCanvasDrop?: (data: any, position: { x: number; y: number }) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeResize?: (nodeId: string, size: { w: number; h: number }) => void;
  connectionMode?: 'arrow' | 'line' | null;
  onConnectionStart?: (nodeId: string) => void;
  onConnectionEnd?: (sourceId: string, targetId: string) => void;
}

const GRID_SIZE = 20;
const MIN_W = 80;
const MIN_H = 60;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.05;

function snap(v: number) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

export function DiagramCanvas({
  nodes,
  edges,
  selectedEdge,
  onNodeClick,
  onEdgeClick,
  onCanvasDrop,
  onNodeMove,
  onNodeResize,
  connectionMode,
  onConnectionStart,
  onConnectionEnd,
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);   // scroll container
  const contentRef = useRef<HTMLDivElement>(null);  // large content surface

  // interaction states
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 5000, height: 5000 });

  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0, nodeRight: 0, nodeBottom: 0, nodeX: 0, nodeY: 0 });

  const [connectionSource, setConnectionSource] = useState<string | null>(null);

  const [selectedNodeLocal, setSelectedNodeLocal] = useState<string | null>(null);
  const [multiSelection, setMultiSelection] = useState<Set<string>>(new Set());

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // zoom & pan (pan tetap via scroll; plus Space+drag untuk geser scroll)
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);

  // marquee selection
  const [isMarquee, setIsMarquee] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // ---- Helpers ----

  // Konversi client -> koordinat konten, mempertimbangkan scroll & zoom
  const getCanvasPoint = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left + canvas.scrollLeft) / zoom;
    const y = (e.clientY - rect.top + canvas.scrollTop) / zoom;
    return { x, y };
  };

  // Hit-test node dengan rect (partial overlap)
  const nodeIntersectsRect = (node: DiagramNode, rect: { x: number; y: number; w: number; h: number }) => {
    const nx1 = node.position.x;
    const ny1 = node.position.y;
    const nx2 = nx1 + node.size.w;
    const ny2 = ny1 + node.size.h;

    const rx1 = Math.min(rect.x, rect.x + rect.w);
    const ry1 = Math.min(rect.y, rect.y + rect.h);
    const rx2 = Math.max(rect.x, rect.x + rect.w);
    const ry2 = Math.max(rect.y, rect.y + rect.h);

    const overlap = !(nx2 < rx1 || nx1 > rx2 || ny2 < ry1 || ny1 > ry2);
    return overlap;
  };

  // ---- Effects ----

  useEffect(() => {
    if (nodes.length === 0) return;
    const maxX = Math.max(...nodes.map(n => n.position.x + n.size.w));
    const maxY = Math.max(...nodes.map(n => n.position.y + n.size.h));
    const newWidth = Math.max(5000, maxX + 1000);
    const newHeight = Math.max(5000, maxY + 1000);
    setCanvasSize({ width: newWidth, height: newHeight });
  }, [nodes]);

  // key handlers untuk Space (pan)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(false);
        setIsPanning(false);
        panStartRef.current = null;
      }
    };
    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up, { passive: false });
    return () => {
      window.removeEventListener('keydown', down as any);
      window.removeEventListener('keyup', up as any);
    };
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    // Zoom hanya untuk viewport kanvas
    const onWheelNative = (ev: WheelEvent) => {
      // Chrome/Win: ctrlKey true saat pinch/ctrl+wheel. macOS: metaKey (⌘) umumnya utk key combos,
      // tapi kita jaga-jaga — kalau mau tetap strict Ctrl saja, ganti kondisi jadi (ev.ctrlKey).
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault(); // blok zoom halaman
        const delta = -Math.sign(ev.deltaY) * ZOOM_STEP; // scroll down => zoom out
        setZoom((z) => {
          const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, parseFloat((z + delta).toFixed(2))));
          return next;
        });
      }
    };

    // Safari: blok pinch gesture agar gak nge-zoom page
    const blockGesture = (ev: Event) => {
      ev.preventDefault();
    };

    el.addEventListener('wheel', onWheelNative, { passive: false });
    el.addEventListener('gesturestart', blockGesture as any, { passive: false } as any);
    el.addEventListener('gesturechange', blockGesture as any, { passive: false } as any);
    el.addEventListener('gestureend', blockGesture as any, { passive: false } as any);

    return () => {
      el.removeEventListener('wheel', onWheelNative as any);
      el.removeEventListener('gesturestart', blockGesture as any);
      el.removeEventListener('gesturechange', blockGesture as any);
      el.removeEventListener('gestureend', blockGesture as any);
    };
  }, []);


  // ---- Drag & Drop dari Palette (drop offset fix + zoom aware) ----

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !contentRef.current) return;

    const point = getCanvasPoint(e);

    try {
      const raw = e.dataTransfer.getData('application/json');
      const data = JSON.parse(raw);
      // Snap posisi awal ke grid juga (lebih rapi)
      onCanvasDrop?.(data, { x: snap(point.x), y: snap(point.y) });
    } catch (err) {
      console.error('Failed to parse drop data', err);
    }
  };

  // ---- Node interactions ----

  const handleNodeMouseDown = (e: React.MouseEvent, node: DiagramNode) => {
    e.stopPropagation();

    // multi-select toggle dengan Shift
    if (e.shiftKey) {
      setMultiSelection((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    } else {
      // kalau node ini sudah termasuk multiSelection, biarkan (untuk group move)
      setMultiSelection((prev) => (prev.has(node.id) ? prev : new Set([node.id])));
    }
    setSelectedNodeLocal(node.id);
    onNodeClick?.(node);

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

    if (!canvasRef.current) return;

    const point = getCanvasPoint(e);

    setDraggedNode(node.id);
    setDragOffset({
      x: point.x - node.position.x,
      y: point.y - node.position.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, node: DiagramNode, handle: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;

    const p = getCanvasPoint(e);
    setResizingNode(node.id);
    setResizeHandle(handle);
    setResizeStart({
      x: p.x,
      y: p.y,
      w: node.size.w,
      h: node.size.h,
      nodeRight: node.position.x + node.size.w,
      nodeBottom: node.position.y + node.size.h,
      nodeX: node.position.x,
      nodeY: node.position.y,
    });
  };

  // ---- Canvas interactions ----

  const handleWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return; // hanya zoom jika ctrl/cmd ditekan
    e.preventDefault();

    const delta = -Math.sign(e.deltaY) * ZOOM_STEP; // scroll down => zoom out
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, parseFloat((zoom + delta).toFixed(2))));
    setZoom(next);
  };

  const beginPanIfNeeded = (e: React.MouseEvent) => {
    if (!spacePressed) return false;
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      scrollLeft: canvas.scrollLeft,
      scrollTop: canvas.scrollTop,
    };
    return true;
  };

  const handleMouseDownOnCanvas = (e: React.MouseEvent) => {
    // Space+drag => pan
    if (beginPanIfNeeded(e)) return;

    // klik di area kosong => mulai marquee
    if (e.target === contentRef.current || e.target === canvasRef.current) {
      const p = getCanvasPoint(e);
      setIsMarquee(true);
      setMarqueeStart(p);
      setMarqueeRect({ x: p.x, y: p.y, w: 0, h: 0 });
      // reset selection kalau tidak menahan Shift
      if (!e.shiftKey) {
        setMultiSelection(new Set());
        setSelectedNodeLocal(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !contentRef.current) return;

    const point = getCanvasPoint(e);
    setMousePosition(point);

    // Pan mode (Space+drag)
    if (isPanning && panStartRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const dx = (e.clientX - rect.left) - panStartRef.current.x;
      const dy = (e.clientY - rect.top) - panStartRef.current.y;
      canvas.scrollLeft = panStartRef.current.scrollLeft - dx;
      canvas.scrollTop = panStartRef.current.scrollTop - dy;
      return;
    }

    // Marquee update
    if (isMarquee && marqueeStart) {
      setMarqueeRect({
        x: marqueeStart.x,
        y: marqueeStart.y,
        w: point.x - marqueeStart.x,
        h: point.y - marqueeStart.y,
      });
      return;
    }

    // Resize
    if (resizingNode && resizeHandle) {
      const node = nodes.find(n => n.id === resizingNode);
      if (!node) return;

      const dx = point.x - resizeStart.x;
      const dy = point.y - resizeStart.y;

      // Hitung newW/newH dan (opsional) newX/newY untuk handle W/N agar snap konsisten
      let newW = resizeStart.w;
      let newH = resizeStart.h;
      let newX = node.position.x;
      let newY = node.position.y;

      if (resizeHandle.includes('e')) {
        const wRaw = Math.max(MIN_W, resizeStart.w + dx);
        newW = snap(wRaw);
      }
      if (resizeHandle.includes('s')) {
        const hRaw = Math.max(MIN_H, resizeStart.h + dy);
        newH = snap(hRaw);
      }
      if (resizeHandle.includes('w')) {
        const wRaw = Math.max(MIN_W, resizeStart.w - dx);
        newW = snap(wRaw);
        // jaga right-edge tetap, geser X
        newX = snap(resizeStart.nodeRight - newW);
      }
      if (resizeHandle.includes('n')) {
        const hRaw = Math.max(MIN_H, resizeStart.h - dy);
        newH = snap(hRaw);
        // jaga bottom-edge tetap, geser Y
        newY = snap(resizeStart.nodeBottom - newH);
      }

      // apply: jika X/Y berubah (handle N/W) maka pindah node dulu, lalu ubah size
      if (newX !== node.position.x || newY !== node.position.y) {
        onNodeMove?.(resizingNode, { x: newX, y: newY });
      }
      onNodeResize?.(resizingNode, { w: newW, h: newH });
      return;
    }

    // Drag single / group
    if (draggedNode) {
      const primary = nodes.find(n => n.id === draggedNode);
      if (!primary) return;

      const baseNewX = Math.max(0, point.x - dragOffset.x);
      const baseNewY = Math.max(0, point.y - dragOffset.y);
      const snappedX = snap(baseNewX);
      const snappedY = snap(baseNewY);

      const selection = multiSelection.size > 0 ? multiSelection : new Set([draggedNode]);

      // Hitung delta terhadap posisi node yang sedang di-drag
      const dx = snappedX - primary.position.x;
      const dy = snappedY - primary.position.y;

      // Gerakkan semua yang terseleksi, masing-masing di-callback
      selection.forEach((id) => {
        const node = nodes.find(n => n.id === id);
        if (!node) return;
        const nx = Math.max(0, snap(node.position.x + dx));
        const ny = Math.max(0, snap(node.position.y + dy));
        onNodeMove?.(id, { x: nx, y: ny });
      });
    }
  };

  const finalizeMarqueeSelection = () => {
    if (!marqueeRect) return;
    const selected = new Set<string>();
    nodes.forEach((n) => {
      if (nodeIntersectsRect(n, marqueeRect)) selected.add(n.id);
    });
    setMultiSelection((prev) => {
      const merged = new Set(prev);
      selected.forEach(id => merged.add(id));
      return merged;
    });
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setResizingNode(null);
    setResizeHandle(null);

    if (isMarquee) {
      finalizeMarqueeSelection();
    }
    setIsMarquee(false);
    setMarqueeStart(null);
    setMarqueeRect(null);

    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === contentRef.current || e.target === canvasRef.current) {
      // clear selection jika klik kosong tanpa Shift
      if (!e.shiftKey) {
        setSelectedNodeLocal(null);
        setMultiSelection(new Set());
      }
    }
  };

  // --- tambahkan di atas (dalam komponen), dekat helper lain ---
  const handleBlockContextMenu = (e: React.MouseEvent) => {
    // Blokir menu konteks bawaan browser (right click & ctrl+click pada macOS)
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseDownCapture = (e: React.MouseEvent) => {
    // Beberapa browser/OS treat ctrl+left sebagai context menu (terutama macOS)
    const isRightClick = e.button === 2;
    const isCtrlLeftClick = e.ctrlKey && e.button === 0;
    if (isRightClick || isCtrlLeftClick) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // ---- Render ----

  return (
    <div
      ref={canvasRef}
      className={`flex-1 relative overflow-auto ${spacePressed ? 'cursor-grab' : 'cursor-default'} bg-muted/30`}
      // onWheel={handleWheel}
      onMouseDownCapture={handleMouseDownCapture}
      onContextMenu={handleBlockContextMenu} 
      onMouseDown={handleMouseDownOnCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      style={{ userSelect: isMarquee || isPanning ? 'none' : undefined }}
    >
      <div
        ref={contentRef}
        className="relative will-change-transform"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          minWidth: '100%',
          minHeight: '100%',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      >
        {nodes.map((node) => {
          const isConnectionSource = connectionSource === node.id;
          const isHoverable = connectionMode && connectionSource && connectionSource !== node.id;
          const isHovered = hoveredNode === node.id;
          const isSelected = multiSelection.has(node.id);

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
              {(isConnectionSource || isSelected) && (
                <div
                  className="absolute rounded-lg"
                  style={{
                    left: node.position.x - 8,
                    top: node.position.y - 8,
                    width: node.size.w + 16,
                    height: node.size.h + 16,
                    border: isConnectionSource ? '3px solid #3b82f6' : '2px solid #60a5fa',
                    boxShadow: isConnectionSource
                      ? '0 0 20px rgba(59, 130, 246, 0.5)'
                      : '0 0 12px rgba(96, 165, 250, 0.5)',
                    zIndex: (node.zIndex || 1) + 1,
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
                    zIndex: (node.zIndex || 1) + 1,
                    pointerEvents: 'none',
                  }}
                />
              )}
              {NodeComponent}
              {!connectionMode && selectedNodeLocal === node.id && (
                <>
                  {/* 8 resize handles */}
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x - 6, top: node.position.y - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 'nw'); }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x + node.size.w - 6, top: node.position.y - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 'ne'); }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x + node.size.w - 6, top: node.position.y + node.size.h - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 'se'); }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x - 6, top: node.position.y + node.size.h - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 'sw'); }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x + node.size.w / 2 - 6, top: node.position.y - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 'n'); }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x + node.size.w - 6, top: node.position.y + node.size.h / 2 - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 'e'); }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ns-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x + node.size.w / 2 - 6, top: node.position.y + node.size.h - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 's'); }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-md"
                    style={{ left: node.position.x - 6, top: node.position.y + node.size.h / 2 - 6, zIndex: 10000, pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResizeMouseDown(e, node, 'w'); }}
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

        {/* EDGES (SVG) */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: canvasSize.width, height: canvasSize.height, zIndex: 9999 }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
            </marker>
            <marker id="arrowhead-selected" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
            </marker>
            <marker id="arrowhead-hover" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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

            const sourceAnchor = getEdgeAnchorPoint(sourceNode, { x: targetCenterX, y: targetCenterY });
            const targetAnchor = getEdgeAnchorPoint(targetNode, { x: sourceCenterX, y: sourceCenterY });

            const midX = (sourceAnchor.x + targetAnchor.x) / 2;
            const midY = (sourceAnchor.y + targetAnchor.y) / 2;

            const hasArrow = edge.type !== 'straight' || edge.animated;
            const isSelected = selectedEdge?.id === edge.id;
            const isHovered = hoveredEdge === edge.id;

            const strokeColor = isSelected ? '#3b82f6' : isHovered ? '#10b981' : edge.style?.strokeColor || '#64748b';
            const strokeWidth = isSelected ? 3 : isHovered ? 3 : edge.style?.strokeWidth || 2;
            const markerEnd = hasArrow
              ? isSelected
                ? 'url(#arrowhead-selected)'
                : isHovered
                  ? 'url(#arrowhead-hover)'
                  : 'url(#arrowhead)'
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
                  style={{ filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : undefined }}
                />
                {edge.label && (
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-xs font-medium pointer-events-none"
                    style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: 3 }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Connection preview */}
          {connectionSource && connectionMode && (() => {
            const sourceNode = nodes.find(n => n.id === connectionSource);
            if (!sourceNode) return null;
            const sourceAnchor = getEdgeAnchorPoint(sourceNode, { x: mousePosition.x, y: mousePosition.y });
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
        </svg>

        {/* Marquee rectangle */}
        {isMarquee && marqueeRect && (
          <div
            className="absolute border-2 border-blue-400/70 bg-blue-400/10"
            style={{
              left: Math.min(marqueeRect.x, marqueeRect.x + marqueeRect.w),
              top: Math.min(marqueeRect.y, marqueeRect.y + marqueeRect.h),
              width: Math.abs(marqueeRect.w),
              height: Math.abs(marqueeRect.h),
              pointerEvents: 'none',
              zIndex: 100000,
            }}
          />
        )}
      </div>
    </div>
  );
}
