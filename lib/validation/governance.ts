import { DiagramSchema, ValidationIssue, GovernanceReport, DiagramNode, DiagramEdge } from '@/lib/types/diagram';
import { isNodeTypeAllowedInLayer, isFrameworkAllowedInLayer } from '@/lib/constants/layers';

/**
 * Layer framework policy:
 * - L0: TOGAF phases only (Preliminary..H). No eTOM, no SID.
 * - L1: eTOM allowed (all areas). TOGAF recommended B. No SID.
 * - L2: SID allowed (all). TOGAF recommended C. No eTOM (warn).
 * - L3: SID allowed only Resource family. TOGAF recommended D.
 * - L4: TOGAF recommended E/F/G (implementation/runtimes). No eTOM, no SID.
 */
const RESOURCE_SID_WHITELIST = new Set([
  'Resource',
  'ResourceSpecification',
  'ResourceOrder',
  'ResourceFunction',
  // tambahkan kalau kamu punya varian lain di constants
]);

const LAYER_FRAMEWORK_POLICY: Record<number, {
  togafAllowed?: 'any' | Set<string>;
  togafRecommended?: Set<string>;
  etomAllowed?: 'any' | Set<string>;
  sidAllowed?: 'any' | Set<string>;
}> = {
  0: {
    togafAllowed: 'any',        // Enterprise overview boleh refer semua phase
    togafRecommended: new Set(['Preliminary', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']),
    etomAllowed: new Set(),     // none
    sidAllowed: new Set(),      // none
  },
  1: {
    togafAllowed: 'any',
    togafRecommended: new Set(['B']),
    etomAllowed: 'any',         // eTOM landscape & capabilities
    sidAllowed: new Set(),      // none
  },
  2: {
    togafAllowed: 'any',
    togafRecommended: new Set(['C']),
    etomAllowed: new Set(),     // default: warn jika ada eTOM di L2
    sidAllowed: 'any',          // seluruh SID di Application & Data
  },
  3: {
    togafAllowed: 'any',
    togafRecommended: new Set(['D']),
    etomAllowed: new Set(),     // none
    sidAllowed: RESOURCE_SID_WHITELIST, // hanya Resource family
  },
  4: {
    togafAllowed: 'any',
    togafRecommended: new Set(['E', 'F', 'G']),
    etomAllowed: new Set(),     // none
    sidAllowed: new Set(),      // none
  },
};

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
    layerViolations.forEach(issue => issues.push(issue));

    // tambahkan framework alignment check pakai isFrameworkAllowedInLayer
    schema.nodes.forEach(node => {
      const fw = node.framework;
      if (!fw) return;

      const { togafOk, etomOk } = isFrameworkAllowedInLayer(fw, currentLayer);

      if (!togafOk && fw.togafPhase) {
        issues.push({
          type: 'warning',
          message: `TOGAF phase "${fw.togafPhase}" on "${node.label}" may not align with Layer L${currentLayer}.`,
          nodeId: node.id,
          category: 'framework',
        });
      }

      if (!etomOk && fw.etom) {
        const areas = Array.isArray(fw.etom) ? fw.etom.join(', ') : fw.etom;
        issues.push({
          type: 'warning',
          message: `eTOM process area "${areas}" is not typical for Layer L${currentLayer}.`,
          nodeId: node.id,
          category: 'framework',
        });
      }
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

// reserved for future: detect cross-phase edges if you want to flag them.
function findPhaseMismatches(edges: DiagramEdge[], nodes: DiagramNode[]): DiagramEdge[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const mismatches: DiagramEdge[] = [];
  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (sourceNode?.framework?.togafPhase && targetNode?.framework?.togafPhase) {
      // Example: If you later want to restrict certain cross-phase hops, add logic here.
      // Currently we collect none.
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

/** existing: technical node-type vs layer allowance */
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

/** NEW: framework alignment (TOGAF/eTOM/SID) vs active layer */
function validateFrameworkLayerAlignment(nodes: DiagramNode[], currentLayer: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const policy = LAYER_FRAMEWORK_POLICY[currentLayer];

  nodes.forEach(node => {
    const fw = node.framework;

    // TOGAF phase checks
    if (fw?.togafPhase && policy?.togafAllowed !== undefined) {
      const norm = normalizeTogafPhase(fw.togafPhase);
      if (policy.togafAllowed !== 'any' && !policy.togafAllowed.has(norm)) {
        issues.push({
          type: 'warning',
          message: `TOGAF phase "${fw.togafPhase}" on "${node.label}" may not be ideal for L${currentLayer}`,
          nodeId: node.id,
          category: 'framework',
        });
      }
      if (policy.togafRecommended && !policy.togafRecommended.has(norm)) {
        issues.push({
          type: 'info',
          message: `Consider aligning "${node.label}" to TOGAF phase ${Array.from(policy.togafRecommended).join('/')} for L${currentLayer}`,
          nodeId: node.id,
          category: 'framework',
        });
      }
    }

    // eTOM checks
    if (fw?.etom !== undefined) {
      // allow single string or array
      const etoms: string[] = Array.isArray(fw.etom) ? fw.etom : [fw.etom];
      if (policy?.etomAllowed instanceof Set && policy.etomAllowed.size === 0) {
        // not allowed at this layer
        etoms.forEach(val => {
          issues.push({
            type: 'warning',
            message: `eTOM "${val}" should not be placed at Layer L${currentLayer}. Move to L1: Capability & Process.`,
            nodeId: node.id,
            category: 'framework',
          });
        });
      }
      // if 'any' we accept silently
    }

    // SID checks
    if (fw?.sid && policy?.sidAllowed !== undefined) {
      const sids: string[] = Array.isArray(fw.sid) ? fw.sid : [fw.sid];
      const sidAllowed = policy.sidAllowed; // Store in local variable
      if (sidAllowed === 'any') {
        // allowed
      } else {
        // only specific sets allowed (e.g., L3 Resource family). Others warned.
        sids.forEach(sid => {
          if (!sidAllowed.has(sid)) {
            issues.push({
              type: currentLayer === 3 ? 'warning' : 'error',
              message:
                currentLayer === 3
                  ? `SID "${sid}" is not typical for L3. Only Resource-family entities are recommended in L3.`
                  : `SID "${sid}" should not be placed at Layer L${currentLayer}.`,
              nodeId: node.id,
              category: 'framework',
            });
          }
        });
      }
    }

    // Extra: hard rules by layer vs node.type, to nudge users
    if (currentLayer === 1 && fw?.sid) {
      issues.push({
        type: 'warning',
        message: `SID on "${node.label}" found at L1. Move data/application entities to L2.`,
        nodeId: node.id,
        category: 'framework',
      });
    }
    if (currentLayer === 2 && fw?.etom) {
      issues.push({
        type: 'warning',
        message: `eTOM on "${node.label}" found at L2. eTOM processes sebaiknya berada di L1.`,
        nodeId: node.id,
        category: 'framework',
      });
    }
    if (currentLayer === 4 && (fw?.sid || fw?.etom)) {
      issues.push({
        type: 'warning',
        message: `Framework references (SID/eTOM) jarang ditempatkan di L4 Runtime. Pertimbangkan memindahkan ke L2 (SID) atau L1 (eTOM).`,
        nodeId: node.id,
        category: 'framework',
      });
    }
  });

  return issues;
}

/** Normalize "togafPhase" values into canonical codes: Preliminary, A..H */
function normalizeTogafPhase(phaseRaw: string): string {
  const p = (phaseRaw || '').trim().toLowerCase();

  if (p.startsWith('pre')) return 'Preliminary';
  if (/^a\b|vision/.test(p)) return 'A';
  if (/^b\b|business/.test(p)) return 'B';
  if (/^c\b|information|application|data/.test(p)) return 'C';
  if (/^d\b|tech/.test(p)) return 'D';
  if (/^e\b|opportunities|solution/.test(p)) return 'E';
  if (/^f\b|migration/.test(p)) return 'F';
  if (/^g\b|implementation/.test(p)) return 'G';
  if (/^h\b|change/.test(p)) return 'H';

  // fallback to raw upper letter if user passes "A/B/.."
  const single = p.toUpperCase();
  if (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(single)) return single;

  // keep original if unknown
  return phaseRaw;
}

function calculateCoverage(nodes: DiagramNode[]) {
  const togafPhases = new Set<string>();
  const etomAreas = new Set<string>();
  const sidEntities = new Set<string>();

  nodes.forEach(node => {
    if (node.framework?.togafPhase) {
      togafPhases.add(normalizeTogafPhase(node.framework.togafPhase));
    }
    if (node.framework?.etom) {
      (Array.isArray(node.framework.etom) ? node.framework.etom : [node.framework.etom]).forEach(a => etomAreas.add(a));
    }
    if (node.framework?.sid) {
      (Array.isArray(node.framework.sid) ? node.framework.sid : [node.framework.sid]).forEach(entity => sidEntities.add(entity));
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