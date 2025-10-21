'use client';

import { useState, useEffect } from 'react';
import { Palette } from '@/components/editor/Palette';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { DiagramCanvas } from '@/components/editor/DiagramCanvas';
import { DiagramNode, DiagramEdge, DiagramSchema } from '@/lib/types/diagram';
import { exportDiagramToJSON, validateDiagram } from '@/lib/validation/governance';
import { useToast } from '@/hooks/use-toast';

export default function EditorPage() {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [edges, setEdges] = useState<DiagramEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<DiagramEdge | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [connectionMode, setConnectionMode] = useState<'arrow' | 'line' | null>(null);

  const handleCanvasDrop = (data: any, position: { x: number; y: number }) => {
    const isContainer = data.isContainer || data.shape === 'swimlane' || data.shape === 'phase' || data.shape === 'processArea';

    const defaultSize = isContainer
      ? { w: 400, h: 300 }
      : data.shape === 'note'
      ? { w: 180, h: 150 }
      : { w: 200, h: 80 };

    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      type: data.id || 'capability',
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
      style: {
        strokeWidth: 2,
        strokeColor: '#64748b',
      },
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
      toast({
        title: 'Connection Mode Active',
        description: `Click two nodes to create ${mode} connection`,
      });
    }
  };

  const handleNodeClick = (node: DiagramNode, multiSelect?: boolean) => {
    if (multiSelect) {
      if (selectedNodes.includes(node.id)) {
        setSelectedNodes(selectedNodes.filter(id => id !== node.id));
      } else {
        setSelectedNodes([...selectedNodes, node.id]);
      }
    } else {
      setSelectedNode(node);
      setSelectedEdge(null);
      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  };

  const handleEdgeClick = (edge: DiagramEdge, multiSelect?: boolean) => {
    if (multiSelect) {
      if (selectedEdges.includes(edge.id)) {
        setSelectedEdges(selectedEdges.filter(id => id !== edge.id));
      } else {
        setSelectedEdges([...selectedEdges, edge.id]);
      }
    } else {
      setSelectedEdge(edge);
      setSelectedNode(null);
      setSelectedNodes([]);
      setSelectedEdges([]);
    }
  };

  const handleMultiSelect = (nodeIds: string[], edgeIds: string[]) => {
    setSelectedNodes(nodeIds);
    setSelectedEdges(edgeIds);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleUpdateNode = (id: string, updates: Partial<DiagramNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );

    if (selectedNode?.id === id) {
      setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleUpdateEdge = (id: string, updates: Partial<DiagramEdge>) => {
    setEdges((prev) =>
      prev.map((edge) => (edge.id === id ? { ...edge, ...updates } : edge))
    );

    if (selectedEdge?.id === id) {
      setSelectedEdge((prev) => (prev ? { ...prev, ...updates } : null));
    }
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

    toast({
      title: 'Diagram saved',
      description: 'Diagram exported to JSON file',
    });
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

    const report = validateDiagram(schema);

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
            const children = prev.filter(n => n.parentId === nodeId);
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
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, size } : node
      )
    );

    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, size } : null));
    }
  };

  const handleDelete = () => {
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      setNodes((prev) => prev.filter((n) => !selectedNodes.includes(n.id)));
      setEdges((prev) => prev.filter((e) =>
        !selectedEdges.includes(e.id) &&
        !selectedNodes.includes(e.source) &&
        !selectedNodes.includes(e.target)
      ));
      setSelectedNodes([]);
      setSelectedEdges([]);
      toast({
        title: `Deleted ${selectedNodes.length} node(s) and ${selectedEdges.length} edge(s)`
      });
    } else if (selectedNode) {
      setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
      setEdges((prev) =>
        prev.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
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
        onSave={handleSave}
        onExport={handleExport}
        onValidate={handleValidate}
        onDelete={handleDelete}
        onConnectionMode={handleConnectionModeChange}
        connectionMode={connectionMode}
      />

      <div className="flex-1 flex overflow-hidden">
        <Palette />

        <DiagramCanvas
          nodes={nodes}
          edges={edges}
          selectedEdge={selectedEdge}
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onCanvasDrop={handleCanvasDrop}
          onNodeMove={handleNodeMove}
          onNodeResize={handleNodeResize}
          onMultiSelect={handleMultiSelect}
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
    </div>
  );
}
