export const LAYER_DEFINITIONS = [
  {
    level: 0,
    type: 'enterprise',
    label: 'L0: Enterprise Overview',
    shortLabel: 'L0',
    description: 'Strategic view with TOGAF phases and enterprise domains',
    icon: 'Building2',
    color: '#8b5cf6',
    allowedNodeTypes: ['phase', 'swimlane', 'capability', 'group', 'note'],
    allowedContainers: ['phase', 'swimlane'],
    recommendations: [
      'Use Phase containers for TOGAF ADM phases',
      'Map strategic capabilities and domains',
      'Keep high-level and avoid technical details',
      'Focus on business value and objectives',
    ],
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
    allowedNodeTypes: ['app', 'data', 'group', 'swimlane', 'note'],
    allowedContainers: ['swimlane', 'group'],
    recommendations: [
      'Map applications that realize capabilities',
      'Define data entities and flows',
      'Show integration patterns and APIs',
      'Use SID Service and Resource entities',
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
    allowedNodeTypes: ['tech', 'data', 'group', 'swimlane', 'note'],
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

export function getLayerDefinition(level: number) {
  return LAYER_DEFINITIONS.find(l => l.level === level) || LAYER_DEFINITIONS[0];
}

export function getLayerForNodeType(nodeType: string): number[] {
  const layers: number[] = [];

  LAYER_DEFINITIONS.forEach(layer => {
    if (layer.allowedNodeTypes.includes(nodeType as any)) {
      layers.push(layer.level);
    }
  });

  return layers.length > 0 ? layers : [0, 1, 2, 3, 4];
}

export function isNodeTypeAllowedInLayer(nodeType: string, layerLevel: number): boolean {
  const layer = getLayerDefinition(layerLevel);
  return layer.allowedNodeTypes.includes(nodeType as any);
}

export function getRecommendedNodesForLayer(layerLevel: number) {
  const layer = getLayerDefinition(layerLevel);
  return layer.allowedNodeTypes.filter(type => !['note', 'group'].includes(type));
}
