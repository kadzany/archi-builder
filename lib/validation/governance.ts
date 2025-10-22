import { DiagramSchema, ValidationIssue, GovernanceReport, DiagramNode, DiagramEdge } from '@/lib/types/diagram';
import { isNodeTypeAllowedInLayer } from '@/lib/constants/layers';

export function validateDiagram(schema: DiagramSchema, currentLayer?: number): GovernanceReport {
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

  const processWithoutService = validateProcessServiceMapping(schema.nodes, schema.edges);
  processWithoutService.forEach(node => {
    issues.push({
      type: 'error',
      message: `Process "${node.label}" must have at least one Service/API connection`,
      nodeId: node.id,
      category: 'missing-property',
    });
  });

  const capabilityWithoutApp = validateCapabilityRealization(schema.nodes, schema.edges);
  capabilityWithoutApp.forEach(node => {
    issues.push({
      type: 'error',
      message: `Capability "${node.label}" must be realized by at least one Application`,
      nodeId: node.id,
      category: 'missing-property',
    });
  });

  const piiDataIssues = validatePIIDataCompliance(schema.nodes);
  piiDataIssues.forEach(issue => {
    issues.push(issue);
  });

  if (currentLayer !== undefined) {
    const layerViolations = validateLayerCompliance(schema.nodes, currentLayer);
    layerViolations.forEach(issue => {
      issues.push(issue);
    });
  }

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

function validateProcessServiceMapping(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
  const processNodes = nodes.filter(n => n.type === 'process');
  const issues: DiagramNode[] = [];

  processNodes.forEach(process => {
    const hasServiceConnection = edges.some(edge =>
      (edge.source === process.id || edge.target === process.id) &&
      (edge.props?.relationshipType === 'serves' || edge.props?.relationshipType === 'uses')
    );

    if (!hasServiceConnection) {
      issues.push(process);
    }
  });

  return issues;
}

function validateCapabilityRealization(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
  const capabilityNodes = nodes.filter(n => n.type === 'capability');
  const issues: DiagramNode[] = [];

  capabilityNodes.forEach(capability => {
    const hasRealization = edges.some(edge =>
      edge.source === capability.id &&
      edge.props?.relationshipType === 'realizes' &&
      nodes.some(n => n.id === edge.target && n.type === 'app')
    );

    if (!hasRealization) {
      issues.push(capability);
    }
  });

  return issues;
}

function validatePIIDataCompliance(nodes: DiagramNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const dataNodes = nodes.filter(n => n.type === 'data');

  dataNodes.forEach(dataNode => {
    const hasPII = dataNode.props?.containsPII === true;
    const hasRetention = dataNode.props?.retentionPolicy;
    const hasClassification = dataNode.props?.dataClassification;

    if (hasPII && !hasRetention) {
      issues.push({
        type: 'error',
        message: `Data node "${dataNode.label}" contains PII but lacks retention policy`,
        nodeId: dataNode.id,
        category: 'missing-property',
      });
    }

    if (hasPII && !hasClassification) {
      issues.push({
        type: 'error',
        message: `Data node "${dataNode.label}" contains PII but lacks data classification`,
        nodeId: dataNode.id,
        category: 'missing-property',
      });
    }
  });

  return issues;
}

function validateLayerCompliance(nodes: DiagramNode[], currentLayer: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  nodes.forEach(node => {
    const nodeType = node.type;
    const isAllowed = isNodeTypeAllowedInLayer(nodeType, currentLayer);

    if (!isAllowed && !['note', 'group'].includes(nodeType)) {
      issues.push({
        type: 'warning',
        message: `Node type "${nodeType}" is not recommended for Layer L${currentLayer}`,
        nodeId: node.id,
        category: 'coverage',
      });
    }
  });

  return issues;
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
