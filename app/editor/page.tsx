'use client';

import { useState, useEffect } from 'react';
import { Palette } from '@/components/editor/Palette';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { DiagramCanvas } from '@/components/editor/DiagramCanvas';
import { LayerTransitionDialog } from '@/components/editor/LayerTransitionDialog';
import { DiagramNode, DiagramEdge, DiagramSchema } from '@/lib/types/diagram';
import { exportDiagramToJSON, validateDiagram } from '@/lib/validation/governance';
import { useToast } from '@/hooks/use-toast';
import { isNodeTypeAllowedInLayer, isFrameworkAllowedInLayer } from '@/lib/constants/layers';

const makeEmptyDiagram = () => ({ nodes: [] as DiagramNode[], edges: [] as DiagramEdge[] });

export default function EditorPage() {
  const { toast } = useToast();
  const [currentLayer, setCurrentLayer] = useState<number>(0);
  const [pendingLayer, setPendingLayer] = useState<number | null>(null);
  const [showLayerDialog, setShowLayerDialog] = useState(false);

  // NEW: storage per layer
  const [layerDiagrams, setLayerDiagrams] = useState<Record<number, { nodes: DiagramNode[]; edges: DiagramEdge[] }>>({
    0: makeEmptyDiagram(),
    1: makeEmptyDiagram(),
    2: makeEmptyDiagram(),
    3: makeEmptyDiagram(),
    4: makeEmptyDiagram(),
  });

  // working set bound to DiagramCanvas
  const [nodes, setNodes] = useState<DiagramNode[]>(layerDiagrams[0].nodes);
  const [edges, setEdges] = useState<DiagramEdge[]>(layerDiagrams[0].edges);

  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<DiagramEdge | null>(null);
  const [connectionMode, setConnectionMode] = useState<'arrow' | 'line' | null>(null);

  // keep storage updated when working set changes
  useEffect(() => {
    setLayerDiagrams((prev) => ({
      ...prev,
      [currentLayer]: { nodes, edges },
    }));
  }, [nodes, edges, currentLayer]);

  const handleCanvasDrop = (data: any, position: { x: number; y: number }) => {
    const nodeType = data.id || 'capability';

    if (!isNodeTypeAllowedInLayer(nodeType, currentLayer) && 
    !isFrameworkAllowedInLayer(nodeType, currentLayer) &&
    !['note', 'group'].includes(nodeType)) {
      toast({
        title: 'Node type not recommended',
        description: `"${nodeType}" is not recommended for Layer L${currentLayer}. Consider switching layers.`,
        variant: 'destructive',
      });
      return;
    }

    const isContainer = data.isContainer || data.shape === 'swimlane' || data.shape === 'phase' || data.shape === 'processArea';

    const defaultSize = isContainer
      ? { w: 400, h: 300 }
      : data.shape === 'note'
        ? { w: 180, h: 150 }
        : { w: 200, h: 80 };

    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      label: data.label || 'New Node',
      position,
      size: defaultSize,
      style: {
        color: data.color || '#3b82f6',
        icon: data.icon,
        shape: data.shape || 'rectangle',
      },
      framework: data.togafPhase
        ? { togafPhase: data.id }
        : data.etom
          ? { etom: data.id }
          : data.sid
            ? { sid: [data.id] }
            : undefined,
      isContainer,
      zIndex: isContainer ? 0 : 1,
    };

    setNodes((prev) => [...prev, newNode]);

    toast({
      title: isContainer ? 'Container added' : 'Node added',
      description: `Added ${newNode.label} to canvas`,
    });
  };

  const handleConnectionStart = (nodeId: string) => {
    toast({
      title: 'Connection Started',
      description: 'Click another node to complete the connection',
    });
  };

  const handleConnectionEnd = (sourceId: string, targetId: string) => {
    const newEdge: DiagramEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'straight',
      animated: connectionMode === 'arrow',
      style: { strokeWidth: 2, strokeColor: '#64748b' },
    };

    setEdges((prev) => [...prev, newEdge]);
    setConnectionMode(null);

    toast({
      title: 'Connection Created',
      description: `${connectionMode === 'arrow' ? 'Arrow' : 'Line'} connection created`,
    });
  };

  const handleConnectionModeChange = (mode: 'arrow' | 'line' | null) => {
    setConnectionMode(mode);
    if (mode) {
      toast({ title: 'Connection Mode Active', description: `Click two nodes to create ${mode} connection` });
    }
  };

  const handleNodeClick = (node: DiagramNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (edge: DiagramEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handleUpdateNode = (id: string, updates: Partial<DiagramNode>) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...updates } : node)));
    if (selectedNode?.id === id) setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleUpdateEdge = (id: string, updates: Partial<DiagramEdge>) => {
    setEdges((prev) => prev.map((edge) => (edge.id === id ? { ...edge, ...updates } : edge)));
    if (selectedEdge?.id === id) setSelectedEdge((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = () => {
    const schema: DiagramSchema = {
      $schema: 'https://archibuilder.dev/schema/v1',
      version: '1.0.0',
      meta: {
        title: 'Untitled Diagram',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      layers: [
        { id: 'diagram', type: 'reactflow' },
        { id: 'annotations', type: 'konva' },
      ],
      nodes,
      edges,
      annotations: [],
    };

    const json = exportDiagramToJSON(schema);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Diagram saved', description: 'Diagram exported to JSON file' });
  };

  const handleExport = (format: 'json' | 'png' | 'svg' | 'pdf') => {
    if (format === 'json') {
      handleSave();
    } else {
      toast({
        title: 'Export',
        description: `Export to ${format.toUpperCase()} will be available when React Flow is installed`,
        variant: 'default',
      });
    }
  };

  const handleLayerChange = (newLayer: number) => {
    if (newLayer !== currentLayer) {
      setPendingLayer(newLayer);
      setShowLayerDialog(true);
    }
  };

  const handleConfirmLayerChange = () => {
    if (pendingLayer === null) {
      setShowLayerDialog(false);
      return;
    }

    // snapshot current layer (safety)
    setLayerDiagrams((prev) => ({
      ...prev,
      [currentLayer]: { nodes, edges },
    }));

    // load target layer or empty diagram
    const target = layerDiagrams[pendingLayer] ?? makeEmptyDiagram();

    setNodes(target.nodes);
    setEdges(target.edges);

    // reset UI state
    setSelectedNode(null);
    setSelectedEdge(null);
    setConnectionMode(null);

    setCurrentLayer(pendingLayer);

    toast({ title: 'Layer changed', description: `Switched to Layer L${pendingLayer}` });

    setShowLayerDialog(false);
    setPendingLayer(null);
  };

  const handleCancelLayerChange = () => {
    setShowLayerDialog(false);
    setPendingLayer(null);
  };

  const handleValidate = () => {
    const schema: DiagramSchema = {
      $schema: 'https://archibuilder.dev/schema/v1',
      version: '1.0.0',
      meta: {
        title: 'Untitled Diagram',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      layers: [
        { id: 'diagram', type: 'reactflow' },
        { id: 'annotations', type: 'konva' },
      ],
      nodes,
      edges,
      annotations: [],
    };

    const report = validateDiagram(schema, currentLayer);

    toast({
      title: 'Validation Report',
      description: `Found ${report.issues.length} issues. Completeness: ${report.completeness}%`,
    });

    console.log('Governance Report:', report);
  };

  const handleNodeMove = (nodeId: string, position: { x: number; y: number }) => {
    setNodes((prev) => {
      const movingNode = prev.find(n => n.id === nodeId);
      if (!movingNode) return prev;

      const deltaX = position.x - movingNode.position.x;
      const deltaY = position.y - movingNode.position.y;

      return prev.map((node) => {
        if (node.id === nodeId) {
          const newNode = { ...node, position };

          if (node.isContainer) {
            return newNode;
          }

          const container = prev.find(c =>
            c.isContainer &&
            position.x >= c.position.x &&
            position.y >= c.position.y &&
            position.x + node.size.w <= c.position.x + c.size.w &&
            position.y + node.size.h <= c.position.y + c.size.h
          );

          return { ...newNode, parentId: container?.id };
        }

        if (node.parentId === nodeId) {
          return {
            ...node,
            position: {
              x: node.position.x + deltaX,
              y: node.position.y + deltaY
            }
          };
        }

        return node;
      });
    });

    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, position } : null));
    }
  };

  const handleNodeResize = (nodeId: string, size: { w: number; h: number }) => {
    setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, size } : node)));
    if (selectedNode?.id === nodeId) setSelectedNode((prev) => (prev ? { ...prev, size } : null));
  };

  const handleDelete = () => {
    if (selectedNode) {
      setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
      setEdges((prev) => prev.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      toast({ title: 'Node deleted' });
    } else if (selectedEdge) {
      setEdges((prev) => prev.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      toast({ title: 'Edge deleted' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const target = event.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        if (!isInputField && (selectedNode || selectedEdge)) {
          event.preventDefault();
          handleDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge]);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        currentLayer={currentLayer}
        onLayerChange={handleLayerChange}
        onSave={handleSave}
        onExport={handleExport}
        onValidate={handleValidate}
        onDelete={handleDelete}
        onConnectionMode={handleConnectionModeChange}
        connectionMode={connectionMode}
      />

      <div className="flex-1 flex overflow-hidden">
        <Palette currentLayer={currentLayer} />

        <DiagramCanvas
          key={`layer-${currentLayer}`}
          nodes={nodes}
          edges={edges}
          selectedEdge={selectedEdge}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onCanvasDrop={handleCanvasDrop}
          onNodeMove={handleNodeMove}
          onNodeResize={handleNodeResize}
          connectionMode={connectionMode}
          onConnectionStart={handleConnectionStart}
          onConnectionEnd={handleConnectionEnd}
        />

        <PropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={handleUpdateNode}
          onUpdateEdge={handleUpdateEdge}
        />
      </div>

      <LayerTransitionDialog
        open={showLayerDialog}
        onClose={handleCancelLayerChange}
        fromLayer={currentLayer}
        toLayer={pendingLayer ?? currentLayer}
        onConfirm={handleConfirmLayerChange}
      />
    </div>
  );
}
