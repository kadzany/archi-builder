'use client';

import { useState } from 'react';
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

  const handleNodeClick = (node: DiagramNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (edge: DiagramEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
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
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      )
    );

    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, position } : null));
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
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

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onSave={handleSave}
        onExport={handleExport}
        onValidate={handleValidate}
        onDelete={handleDelete}
      />

      <div className="flex-1 flex overflow-hidden">
        <Palette />

        <DiagramCanvas
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onCanvasDrop={handleCanvasDrop}
          onNodeMove={handleNodeMove}
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
