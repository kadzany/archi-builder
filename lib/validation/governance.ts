// lib/governance.ts

import { DiagramSchema, ValidationIssue, GovernanceReport, DiagramNode, DiagramEdge } from '@/lib/types/diagram';
import { isNodeTypeAllowedInLayer, isFrameworkAllowedInLayer, getLayerDefinition, LAYER_DEFINITIONS } from '@/lib/constants/layers';

/** ----------------------------------------------------------------
 *  Main validator
 *  ---------------------------------------------------------------- */
export function validateDiagram(schema: DiagramSchema, currentLayer?: number): GovernanceReport {
  const issues: ValidationIssue[] = [];

  // Connectivity checks
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

  // Metadata checks
  const missingProperties = findMissingProperties(schema.nodes);
  missingProperties.forEach(node => {
    issues.push({
      type: 'warning',
      message: `Node "${node.label}" is missing framework properties (TOGAF/eTOM/SID)`,
      nodeId: node.id,
      category: 'missing-property',
    });
  });

  // Domain-specific checks
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
  piiDataIssues.forEach(issue => issues.push(issue));

  // Layer-level checks
  if (currentLayer !== undefined) {
    // Technical allowance (node.type vs layer)
    const layerViolations = validateLayerCompliance(schema.nodes, currentLayer);
    layerViolations.forEach(issue => issues.push(issue));

    // Framework alignment (TOGAF & eTOM) with dynamic severity & suggestions
    schema.nodes.forEach(node => {
      const fw = node.framework;
      if (!fw) return;

      const { togafOk, etomOk } = isFrameworkAllowedInLayer(fw, currentLayer);

      // --- TOGAF ---
      if (fw.togafPhase) {
        if (!togafOk) {
          const dist = togafDistanceToLayer(fw.togafPhase, currentLayer);
          const severity: 'info' | 'warning' = dist <= 1 ? 'info' : 'warning';
          const suggested = fmtLayers(layersForTogafPhase(fw.togafPhase));
          issues.push({
            type: severity,
            message:
              suggested.length > 0
                ? `TOGAF phase "${fw.togafPhase}" on "${node.label}" is not ideal for L${currentLayer}. Consider moving to ${suggested}.`
                : `TOGAF phase "${fw.togafPhase}" on "${node.label}" is not aligned with L${currentLayer}.`,
            nodeId: node.id,
            category: 'framework',
          });
        } else {
          // Optional: nudge if close but not primary
          const dist = togafDistanceToLayer(fw.togafPhase, currentLayer);
          if (dist > 0 && dist <= 1) {
            issues.push({
              type: 'info',
              message: `TOGAF phase "${fw.togafPhase}" is close but not the primary alignment for L${currentLayer}.`,
              nodeId: node.id,
              category: 'framework',
            });
          }
        }
      }

      // --- eTOM ---
      if (fw.etom) {
        const areas: string[] = Array.isArray(fw.etom) ? fw.etom : [fw.etom];
        if (!etomOk) {
          areas.forEach(a => {
            const suggested = fmtLayers(layersForEtomArea(a));
            issues.push({
              type: 'warning',
              message:
                suggested.length > 0
                  ? `eTOM area "${a}" is not typical for L${currentLayer}. Consider moving to ${suggested}.`
                  : `eTOM area "${a}" is not aligned with L${currentLayer}.`,
              nodeId: node.id,
              category: 'framework',
            });
          });
        }
      }
    });
  }

  // Coverage + score
  const coverage = calculateCoverage(schema.nodes);
  const completeness = calculateCompleteness(schema, issues);

  return { issues, coverage, completeness };
}

/** ----------------------------------------------------------------
 *  Connectivity & metadata helpers
 *  ---------------------------------------------------------------- */
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

/** ----------------------------------------------------------------
 *  Domain-specific rules
 *  ---------------------------------------------------------------- */
function validateProcessServiceMapping(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramNode[] {
  const processNodes = nodes.filter(n => n.type === 'process');
  const issues: DiagramNode[] = [];
  processNodes.forEach(process => {
    const hasServiceConnection = edges.some(edge =>
      (edge.source === process.id || edge.target === process.id) &&
      (edge.props?.relationshipType === 'serves' || edge.props?.relationshipType === 'uses')
    );
    if (!hasServiceConnection) issues.push(process);
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
    if (!hasRealization) issues.push(capability);
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

/** ----------------------------------------------------------------
 *  Technical layer/type allowance
 *  ---------------------------------------------------------------- */
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

/** ----------------------------------------------------------------
 *  Alignment scoring utilities (TOGAF/eTOM)
 *  ---------------------------------------------------------------- */
const TOGAF_ORDER: Record<string, number> = {
  Preliminary: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
};

function togafDistanceToLayer(phaseId: string, layerLevel: number): number {
  const layer = getLayerDefinition(layerLevel);
  const allowed = (layer.togafAlignment || []) as readonly string[];
  if (!allowed.length || TOGAF_ORDER[phaseId] === undefined) return Number.POSITIVE_INFINITY;
  const p = TOGAF_ORDER[phaseId];
  return Math.min(...allowed
    .filter(a => TOGAF_ORDER[a] !== undefined)
    .map(a => Math.abs(TOGAF_ORDER[a] - p)));
}

function layersForTogafPhase(phaseId: string): number[] {
  return LAYER_DEFINITIONS
    .filter(ld => (ld.togafAlignment as readonly string[] | undefined)?.includes(phaseId))
    .map(ld => ld.level);
}

function layersForEtomArea(areaId: string): number[] {
  return LAYER_DEFINITIONS
    .filter(ld => (ld.etomAlignment as readonly string[] | undefined)?.includes(areaId))
    .map(ld => ld.level);
}

function fmtLayers(levels: number[]): string {
  const uniq = Array.from(new Set(levels)).sort((a, b) => a - b);
  return uniq.map(l => `L${l}`).join(', ');
}

/** ----------------------------------------------------------------
 *  Coverage + scoring
 *  ---------------------------------------------------------------- */
function calculateCoverage(nodes: DiagramNode[]) {
  const togafPhases = new Set<string>();
  const etomAreas = new Set<string>();
  const sidEntities = new Set<string>();

  nodes.forEach(node => {
    if (node.framework?.togafPhase) {
      togafPhases.add(node.framework.togafPhase.trim());
    }
    if (node.framework?.etom) {
      (Array.isArray(node.framework.etom) ? node.framework.etom : [node.framework.etom])
        .forEach(a => etomAreas.add(a));
    }
    if (node.framework?.sid) {
      (Array.isArray(node.framework.sid) ? node.framework.sid : [node.framework.sid])
        .forEach(entity => sidEntities.add(entity));
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
  if (totalNodes === 0) return 0;

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  const errorPenalty = errorCount * 10;
  const warningPenalty = warningCount * 5;

  const baseScore = 100;
  const finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty);

  return Math.round(finalScore);
}

/** ----------------------------------------------------------------
 *  JSON import/export helpers
 *  ---------------------------------------------------------------- */
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
