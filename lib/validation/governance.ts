import { DiagramSchema, ValidationIssue, GovernanceReport, DiagramNode, DiagramEdge } from '@/lib/types/diagram';

export function validateDiagram(schema: DiagramSchema): GovernanceReport {
  const issues: ValidationIssue[] = [];

  const orphanNodes = findOrphanNodes(schema.nodes, schema.edges);
  orphanNodes.forEach(node => {
    issues.push({
      type: 'warning',
      message: `Node "${node.label}" is not connected to any other node`,
      nodeId: node.id,
      category: 'orphan',
    });
  });

  const unlabeledEdges = findUnlabeledEdges(schema.edges);
  unlabeledEdges.forEach(edge => {
    issues.push({
      type: 'info',
      message: `Edge from ${edge.source} to ${edge.target} has no label`,
      edgeId: edge.id,
      category: 'unlabeled',
    });
  });

  const missingProperties = findMissingProperties(schema.nodes);
  missingProperties.forEach(node => {
    issues.push({
      type: 'warning',
      message: `Node "${node.label}" is missing framework properties (TOGAF/eTOM/SID)`,
      nodeId: node.id,
      category: 'missing-property',
    });
  });

  const phaseMismatches = findPhaseMismatches(schema.edges, schema.nodes);
  phaseMismatches.forEach(edge => {
    issues.push({
      type: 'error',
      message: `Edge connects nodes from incompatible phases`,
      edgeId: edge.id,
      category: 'phase-mismatch',
    });
  });

  const coverage = calculateCoverage(schema.nodes);

  const completeness = calculateCompleteness(schema, issues);

  return {
    issues,
    coverage,
    completeness,
  };
}

function findOrphanNodes(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
  const connectedNodeIds = new Set<string>();

  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  return nodes.filter(node =>
    !connectedNodeIds.has(node.id) &&
    node.type !== 'swimlane' &&
    node.type !== 'group' &&
    node.type !== 'note'
  );
}

function findUnlabeledEdges(edges: DiagramEdge[]): DiagramEdge[] {
  return edges.filter(edge => !edge.label || edge.label.trim() === '');
}

function findMissingProperties(nodes: DiagramNode[]): DiagramNode[] {
  return nodes.filter(node =>
    node.type !== 'note' &&
    node.type !== 'group' &&
    node.type !== 'swimlane' &&
    !node.framework
  );
}

function findPhaseMismatches(edges: DiagramEdge[], nodes: DiagramNode[]): DiagramEdge[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const mismatches: DiagramEdge[] = [];

  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (sourceNode?.framework?.togafPhase && targetNode?.framework?.togafPhase) {
      if (sourceNode.framework.togafPhase !== targetNode.framework.togafPhase) {
      }
    }
  });

  return mismatches;
}

function calculateCoverage(nodes: DiagramNode[]) {
  const togafPhases = new Set<string>();
  const etomAreas = new Set<string>();
  const sidEntities = new Set<string>();

  nodes.forEach(node => {
    if (node.framework?.togafPhase) {
      togafPhases.add(node.framework.togafPhase);
    }
    if (node.framework?.etom) {
      etomAreas.add(node.framework.etom);
    }
    if (node.framework?.sid) {
      node.framework.sid.forEach(entity => sidEntities.add(entity));
    }
  });

  return {
    togafPhases: Array.from(togafPhases),
    etomAreas: Array.from(etomAreas),
    sidEntities: Array.from(sidEntities),
  };
}

function calculateCompleteness(schema: DiagramSchema, issues: ValidationIssue[]): number {
  const totalNodes = schema.nodes.length;
  const totalEdges = schema.edges.length;

  if (totalNodes === 0) return 0;

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  const errorPenalty = errorCount * 10;
  const warningPenalty = warningCount * 5;

  const baseScore = 100;
  const finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty);

  return Math.round(finalScore);
}

export function exportDiagramToJSON(schema: DiagramSchema): string {
  return JSON.stringify(schema, null, 2);
}

export function importDiagramFromJSON(json: string): DiagramSchema {
  const parsed = JSON.parse(json);

  if (!parsed.$schema || !parsed.version || !parsed.meta || !parsed.nodes) {
    throw new Error('Invalid diagram schema');
  }

  return parsed as DiagramSchema;
}
