// lib/constants/layers.ts

// Import framework catalogs so we can normalize node types
import { SID_ENTITIES, TOGAF_PHASES, ETOM_AREAS } from '@/lib/constants/frameworks';

/** ----------------------------------------------------------------
 *  Normalization helpers
 *  ---------------------------------------------------------------- */
const SID_IDS = new Set<string>(SID_ENTITIES.map(e => e.id));            // e.g. 'Customer','Party',...
const TOGAF_PHASE_IDS = new Set<string>(TOGAF_PHASES.map(p => p.id));    // 'Preliminary','A','B',...,'H'
const ETOM_AREA_IDS = new Set<string>(ETOM_AREAS.map(a => a.id));        // 'Strategy','Operations','Fulfillment','Assurance','Billing'

/**
 * Normalize node.type when the UI accidentally sets the framework ID
 * as the type:
 * - SID entity id   -> 'sid'
 * - TOGAF phase id  -> 'phase'
 * - eTOM area id    -> 'processArea'
 * - otherwise       -> keep original
 */
function normalizeNodeType(nodeType: string): string {
  const t = String(nodeType || '').trim();
  if (SID_IDS.has(t)) return 'sid';
  if (TOGAF_PHASE_IDS.has(t)) return 'phase';
  if (ETOM_AREA_IDS.has(t)) return 'processArea';
  return t;
}

/** ----------------------------------------------------------------
 *  Layer definitions (L0–L4)
 *  ---------------------------------------------------------------- */
export const LAYER_DEFINITIONS = [
  {
    level: 0,
    type: 'enterprise',
    label: 'L0: Enterprise Overview',
    shortLabel: 'L0',
    description: 'Strategic view with TOGAF phases and enterprise domains',
    icon: 'Building2',
    color: '#8b5cf6',
    // No SID here
    allowedNodeTypes: ['phase', 'swimlane', 'capability', 'group', 'note'],
    allowedContainers: ['phase', 'swimlane'],
    recommendations: [
      'Use Phase containers for TOGAF ADM phases',
      'Map strategic capabilities and domains',
      'Keep high-level and avoid technical details',
      'Focus on business value and objectives',
    ],
    // Alignment is used by governance checks for severity hints
    togafAlignment: ['Preliminary', 'A', 'B'],
    etomAlignment: ['Strategy'],
  },
  {
    level: 1,
    type: 'capability',
    label: 'L1: Capability & Process',
    shortLabel: 'L1',
    description: 'Business capabilities and eTOM process landscape',
    icon: 'Layers',
    color: '#3b82f6',
    // No SID at capability/process view
    allowedNodeTypes: ['capability', 'process', 'processArea', 'swimlane', 'group', 'note'],
    allowedContainers: ['processArea', 'swimlane'],
    recommendations: [
      'Define business capabilities with clear outcomes',
      'Map eTOM Level 1 and Level 2 processes',
      'Link capabilities to supporting processes',
      'Associate with SID Customer, Product, Service entities',
    ],
    togafAlignment: ['B', 'C'],
    etomAlignment: ['Operations', 'Fulfillment', 'Assurance', 'Billing'],
  },
  {
    level: 2,
    type: 'application',
    label: 'L2: Application & Data',
    shortLabel: 'L2',
    description: 'Application components, services, and data architecture',
    icon: 'Box',
    color: '#10b981',
    // MAIN place for SID (all entities), plus app & data
    allowedNodeTypes: ['app', 'data', 'sid', 'group', 'swimlane', 'note'],
    allowedContainers: ['swimlane', 'group'],
    recommendations: [
      'Map applications that realize capabilities',
      'Define data entities and flows',
      'Show integration patterns and APIs',
      'Use SID entities (Customer/Product/Service/Resource/etc.)',
    ],
    togafAlignment: ['C', 'D'],
    etomAlignment: ['Operations'],
  },
  {
    level: 3,
    type: 'technology',
    label: 'L3: Technology & Infrastructure',
    shortLabel: 'L3',
    description: 'Technology stack, infrastructure, and deployment',
    icon: 'Server',
    color: '#f59e0b',
    // SID allowed here ONLY for Resource family (enforced in governance)
    allowedNodeTypes: ['tech', 'data', 'sid', 'group', 'swimlane', 'note'],
    allowedContainers: ['swimlane', 'group'],
    recommendations: [
      'Detail technology components and platforms',
      'Show deployment topology and hosting',
      'Define infrastructure dependencies',
      'Map to physical and virtual resources',
    ],
    togafAlignment: ['D', 'E'],
    etomAlignment: [],
  },
  {
    level: 4,
    type: 'runtime',
    label: 'L4: Runtime & Operations',
    shortLabel: 'L4',
    description: 'Runtime environments, CI/CD, monitoring, and operations',
    icon: 'Activity',
    color: '#ef4444',
    // No SID at runtime; focus on tech/process ops
    allowedNodeTypes: ['tech', 'process', 'group', 'swimlane', 'note'],
    allowedContainers: ['swimlane', 'group'],
    recommendations: [
      'Define CI/CD pipelines and automation',
      'Show monitoring and observability setup',
      'Map operational processes (ITIL/DevOps)',
      'Include disaster recovery and resilience',
    ],
    togafAlignment: ['G', 'H'],
    etomAlignment: ['Operations'],
  },
] as const;

/** ----------------------------------------------------------------
 *  Public helpers
 *  ---------------------------------------------------------------- */
export function getLayerDefinition(level: number) {
  return LAYER_DEFINITIONS.find(l => l.level === level) || LAYER_DEFINITIONS[0];
}

export function getLayerForNodeType(nodeType: string): number[] {
  const normalized = normalizeNodeType(nodeType);
  const layers: number[] = [];
  LAYER_DEFINITIONS.forEach(layer => {
    if (layer.allowedNodeTypes.includes(normalized as any)) {
      layers.push(layer.level);
    }
  });
  return layers.length > 0 ? layers : [0, 1, 2, 3, 4];
}

export function isNodeTypeAllowedInLayer(nodeType: string, layerLevel: number): boolean {
  const normalized = normalizeNodeType(nodeType);
  const layer = getLayerDefinition(layerLevel);
  return layer.allowedNodeTypes.includes(normalized as any);
}

/** Suggestable nodes (exclude generic containers/notes) */
export function getRecommendedNodesForLayer(layerLevel: number) {
  const layer = getLayerDefinition(layerLevel);
  return layer.allowedNodeTypes.filter(type => !['note', 'group'].includes(type));
}

/**
 * Alignment helper (used by governance):
 * - Checks whether a node.framework (togafPhase / etom) aligns with the current layer's
 *   alignment hints (togafAlignment / etomAlignment). Returns booleans only;
 *   severity & messages are handled in governance.ts.
 */
export function isFrameworkAllowedInLayer(
  framework: { togafPhase?: string; etom?: string | string[] } | undefined,
  layerLevel: number
): { togafOk: boolean; etomOk: boolean } {
  const layer = getLayerDefinition(layerLevel);

  // TOGAF phase alignment (accepts exact IDs found in TOGAF_PHASES)
  let togafOk = true;
  if (framework?.togafPhase && Array.isArray(layer.togafAlignment)) {
    const phase = framework.togafPhase.trim();
    togafOk = (layer.togafAlignment as readonly string[]).includes(phase);
  }

  // eTOM area alignment (accept string or array)
  let etomOk = true;
  if (framework?.etom && Array.isArray(layer.etomAlignment)) {
    const etoms = Array.isArray(framework.etom) ? framework.etom : [framework.etom];
    etomOk = etoms.every(a => (layer.etomAlignment as readonly string[]).includes(a));
  }

  return { togafOk, etomOk };
}
