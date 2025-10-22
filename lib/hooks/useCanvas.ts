import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DiagramNode, DiagramEdge } from '@/lib/types/diagram';

export interface CanvasData {
  id: string;
  name: string;
  projectId: string;
  parentCanvasId: string | null;
  layerLevel: number;
  layerType: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  layerLevel: number;
}

export function useCanvas(canvasId: string | null) {
  const [canvas, setCanvas] = useState<CanvasData | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasId) return;
    loadCanvas(canvasId);
  }, [canvasId]);

  const loadCanvas = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: canvasData, error: canvasError } = await supabase
        .from('canvases')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (canvasError) throw canvasError;
      if (!canvasData) throw new Error('Canvas not found');

      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .eq('canvas_id', id);

      if (nodesError) throw nodesError;

      const { data: edgesData, error: edgesError } = await supabase
        .from('edges')
        .select('*')
        .eq('canvas_id', id);

      if (edgesError) throw edgesError;

      const nodes: DiagramNode[] = (nodesData || []).map(node => ({
        id: node.id,
        type: node.type as any,
        label: node.label,
        position: { x: node.position_x, y: node.position_y },
        size: { w: node.width, h: node.height },
        style: {
          color: node.color,
          icon: node.icon || undefined,
          shape: node.shape as any,
        },
        framework: {
          togafPhase: node.togaf_phase as any,
          etom: node.etom_area as any,
          sid: node.sid_entities,
        },
        props: {
          ...node.properties,
          owner: node.owner,
          status: node.status,
          tags: node.tags,
          domain: node.domain,
          description: node.description,
          childCanvasId: node.child_canvas_id,
        },
        isContainer: node.is_container,
        parentId: node.parent_node_id || undefined,
        zIndex: node.z_index,
        locked: node.locked,
      }));

      const edges: DiagramEdge[] = (edgesData || []).map(edge => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        type: edge.edge_type as any,
        label: edge.label || undefined,
        animated: edge.animated,
        style: {
          strokeWidth: edge.stroke_width,
          strokeColor: edge.stroke_color,
          strokeDasharray: edge.stroke_dasharray || undefined,
        },
        props: {
          ...edge.properties,
          relationshipType: edge.relationship_type,
        },
      }));

      setCanvas({
        id: canvasData.id,
        name: canvasData.name,
        projectId: canvasData.project_id,
        parentCanvasId: canvasData.parent_canvas_id,
        layerLevel: canvasData.layer_level,
        layerType: canvasData.layer_type,
        nodes,
        edges,
      });

      await loadBreadcrumbs(canvasData.id, canvasData.parent_canvas_id);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading canvas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBreadcrumbs = async (currentCanvasId: string, parentCanvasId: string | null) => {
    const crumbs: BreadcrumbItem[] = [];
    let currentId: string | null = parentCanvasId;

    while (currentId) {
      const { data, error } = await supabase
        .from('canvases')
        .select('id, name, layer_level, parent_canvas_id')
        .eq('id', currentId)
        .maybeSingle();

      if (error || !data) break;

      crumbs.unshift({
        id: data.id,
        name: data.name,
        layerLevel: data.layer_level,
      });

      currentId = data.parent_canvas_id;
    }

    const { data: currentData } = await supabase
      .from('canvases')
      .select('id, name, layer_level')
      .eq('id', currentCanvasId)
      .maybeSingle();

    if (currentData) {
      crumbs.push({
        id: currentData.id,
        name: currentData.name,
        layerLevel: currentData.layer_level,
      });
    }

    setBreadcrumbs(crumbs);
  };

  const saveNode = async (node: Partial<DiagramNode>) => {
    if (!canvas) return;

    const nodeData = {
      canvas_id: canvas.id,
      type: node.type || 'capability',
      label: node.label || 'New Node',
      description: node.props?.description || '',
      position_x: node.position?.x || 0,
      position_y: node.position?.y || 0,
      width: node.size?.w || 200,
      height: node.size?.h || 80,
      shape: node.style?.shape || 'rectangle',
      color: node.style?.color || '#3b82f6',
      icon: node.style?.icon || null,
      togaf_phase: node.framework?.togafPhase || null,
      etom_area: node.framework?.etom || null,
      sid_entities: node.framework?.sid || [],
      owner: node.props?.owner || '',
      status: node.props?.status || 'proposed',
      tags: node.props?.tags || [],
      domain: node.props?.domain || '',
      child_canvas_id: node.props?.childCanvasId || null,
      properties: node.props || {},
      z_index: node.zIndex || 1,
      is_container: node.isContainer || false,
      parent_node_id: node.parentId || null,
      locked: node.locked || false,
    };

    if (node.id) {
      const { error } = await supabase
        .from('nodes')
        .update(nodeData)
        .eq('id', node.id);

      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('nodes')
        .insert(nodeData)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    }
  };

  const saveEdge = async (edge: Partial<DiagramEdge>) => {
    if (!canvas) return;

    const edgeData = {
      canvas_id: canvas.id,
      source_node_id: edge.source!,
      target_node_id: edge.target!,
      relationship_type: edge.props?.relationshipType || 'depends-on',
      label: edge.label || '',
      edge_type: edge.type || 'straight',
      animated: edge.animated || false,
      stroke_width: edge.style?.strokeWidth || 2,
      stroke_color: edge.style?.strokeColor || '#64748b',
      stroke_dasharray: edge.style?.strokeDasharray || null,
      properties: edge.props || {},
    };

    if (edge.id) {
      const { error } = await supabase
        .from('edges')
        .update(edgeData)
        .eq('id', edge.id);

      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('edges')
        .insert(edgeData)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    }
  };

  const deleteNode = async (nodeId: string) => {
    const { error } = await supabase
      .from('nodes')
      .delete()
      .eq('id', nodeId);

    if (error) throw error;
  };

  const deleteEdge = async (edgeId: string) => {
    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('id', edgeId);

    if (error) throw error;
  };

  const updateCanvasLayer = async (canvasId: string, newLayer: number) => {
    const { error } = await supabase
      .from('canvases')
      .update({
        layer_level: newLayer,
        layer_type: getLayerTypeForLevel(newLayer),
        updated_at: new Date().toISOString(),
      })
      .eq('id', canvasId);

    if (error) throw error;

    if (canvas && canvas.id === canvasId) {
      setCanvas({
        ...canvas,
        layerLevel: newLayer,
        layerType: getLayerTypeForLevel(newLayer),
      });
    }
  };

  const createChildCanvas = async (parentNodeId: string, name: string) => {
    if (!canvas) return null;

    const { data: canvasData, error: canvasError } = await supabase
      .from('canvases')
      .insert({
        project_id: canvas.projectId,
        parent_canvas_id: canvas.id,
        name,
        layer_level: canvas.layerLevel + 1,
        layer_type: getNextLayerType(canvas.layerType),
      })
      .select()
      .single();

    if (canvasError) throw canvasError;

    const { error: nodeError } = await supabase
      .from('nodes')
      .update({ child_canvas_id: canvasData.id })
      .eq('id', parentNodeId);

    if (nodeError) throw nodeError;

    return canvasData.id;
  };

  return {
    canvas,
    breadcrumbs,
    loading,
    error,
    loadCanvas,
    saveNode,
    saveEdge,
    deleteNode,
    deleteEdge,
    updateCanvasLayer,
    createChildCanvas,
  };
}

function getLayerTypeForLevel(level: number): string {
  const types = ['enterprise', 'capability', 'application', 'technology', 'runtime'];
  return types[level] || 'enterprise';
}

function getNextLayerType(currentType: string): string {
  const layerSequence = ['enterprise', 'capability', 'application', 'technology', 'runtime'];
  const currentIndex = layerSequence.indexOf(currentType);
  return currentIndex < layerSequence.length - 1 ? layerSequence[currentIndex + 1] : 'runtime';
}
