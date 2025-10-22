export const TOGAF_PHASES = [
  { id: 'Preliminary', label: 'Preliminary', color: '#64748b' },
  { id: 'A', label: 'Architecture Vision', color: '#8b5cf6' },
  { id: 'B', label: 'Business Architecture', color: '#3b82f6' },
  { id: 'C', label: 'Information Systems Architecture', color: '#06b6d4' },
  { id: 'D', label: 'Technology Architecture', color: '#10b981' },
  { id: 'E', label: 'Opportunities & Solutions', color: '#f59e0b' },
  { id: 'F', label: 'Migration Planning', color: '#ef4444' },
  { id: 'G', label: 'Implementation Governance', color: '#ec4899' },
  { id: 'H', label: 'Architecture Change Management', color: '#6366f1' },
] as const;

export const ETOM_AREAS = [
  { id: 'Strategy', label: 'Strategy, Infrastructure & Product', color: '#8b5cf6' },
  { id: 'Operations', label: 'Operations', color: '#3b82f6' },
  { id: 'Fulfillment', label: 'Fulfillment', color: '#06b6d4' },
  { id: 'Assurance', label: 'Assurance', color: '#10b981' },
  { id: 'Billing', label: 'Billing & Revenue Management', color: '#f59e0b' },
] as const;

export const SID_ENTITIES = [
  { id: 'Customer', label: 'Customer', icon: 'Users', color: '#3b82f6' },
  { id: 'Product', label: 'Product', icon: 'Package', color: '#06b6d4' },
  { id: 'Service', label: 'Service', icon: 'Network', color: '#10b981' },
  { id: 'Resource', label: 'Resource', icon: 'Server', color: '#f59e0b' },
  { id: 'Party', label: 'Party', icon: 'User', color: '#ec4899' },
  { id: 'Location', label: 'Location', icon: 'MapPin', color: '#8b5cf6' },
  { id: 'Agreement', label: 'Agreement', icon: 'FileText', color: '#ef4444' },
  { id: 'Order', label: 'Order', icon: 'ShoppingCart', color: '#14b8a6' },
] as const;

export const NODE_TYPES = [
  { id: 'capability', label: 'Capability', icon: 'Layers', color: '#3b82f6', shape: 'rounded' },
  { id: 'process', label: 'Process', icon: 'GitBranch', color: '#06b6d4', shape: 'rounded' },
  { id: 'app', label: 'Application', icon: 'Box', color: '#10b981', shape: 'rectangle' },
  { id: 'tech', label: 'Technology', icon: 'Server', color: '#f59e0b', shape: 'hexagon' },
  { id: 'data', label: 'Data', icon: 'Database', color: '#8b5cf6', shape: 'ellipse' },
  { id: 'group', label: 'Group', icon: 'FolderOpen', color: '#64748b', shape: 'rounded' },
  { id: 'note', label: 'Note', icon: 'StickyNote', color: '#f59e0b', shape: 'note' },
] as const;

export const CONTAINER_TYPES = [
  { id: 'swimlane', label: 'Swimlane', icon: 'Rows', color: '#0284c7', shape: 'swimlane', isContainer: true },
  { id: 'phase', label: 'Phase', icon: 'Calendar', color: '#9333ea', shape: 'phase', isContainer: true },
  { id: 'processArea', label: 'Process Area', icon: 'Layout', color: '#16a34a', shape: 'processArea', isContainer: true },
] as const;

export const SHAPE_TYPES = [
  { id: 'rectangle', label: 'Rectangle', icon: 'Square', color: '#64748b', shape: 'rectangle' },
  { id: 'rounded', label: 'Rounded Box', icon: 'RectangleHorizontal', color: '#64748b', shape: 'rounded' },
  { id: 'diamond', label: 'Diamond', icon: 'Diamond', color: '#64748b', shape: 'diamond' },
  { id: 'ellipse', label: 'Ellipse', icon: 'Circle', color: '#64748b', shape: 'ellipse' },
  { id: 'hexagon', label: 'Hexagon', icon: 'Hexagon', color: '#64748b', shape: 'hexagon' },
] as const;

export const CONNECTOR_TYPES = [
  { id: 'arrow', label: 'Arrow', icon: 'ArrowRight', type: 'arrow' },
  { id: 'line', label: 'Line', icon: 'Minus', type: 'line' },
  { id: 'orthogonal', label: 'Orthogonal', icon: 'MoveRight', type: 'orthogonal' },
  { id: 'bezier', label: 'Curved', icon: 'Spline', type: 'bezier' },
] as const;

export const EDGE_TYPES = [
  { id: 'orthogonal', label: 'Orthogonal' },
  { id: 'smoothstep', label: 'Smooth Step' },
  { id: 'bezier', label: 'Bezier' },
  { id: 'straight', label: 'Straight' },
] as const;

export const ANNOTATION_TOOLS = [
  { id: 'pen', label: 'Pen', icon: 'Pen' },
  { id: 'rect', label: 'Rectangle', icon: 'Square' },
  { id: 'ellipse', label: 'Ellipse', icon: 'Circle' },
  { id: 'arrow', label: 'Arrow', icon: 'ArrowRight' },
  { id: 'text', label: 'Text', icon: 'Type' },
  { id: 'highlight', label: 'Highlight', icon: 'Highlighter' },
] as const;

export const RELATIONSHIP_TYPES = [
  { id: 'realizes', label: 'Realizes', description: 'Logical realization of capabilities' },
  { id: 'serves', label: 'Serves', description: 'Service provision relationship' },
  { id: 'uses', label: 'Uses', description: 'Usage dependency' },
  { id: 'hosts', label: 'Hosts', description: 'Hosting/deployment relationship' },
  { id: 'reads', label: 'Reads', description: 'Data read access' },
  { id: 'writes', label: 'Writes', description: 'Data write access' },
  { id: 'depends-on', label: 'Depends On', description: 'Generic dependency' },
  { id: 'composes', label: 'Composes', description: 'Composition relationship' },
  { id: 'aggregates', label: 'Aggregates', description: 'Aggregation relationship' },
  { id: 'flows-to', label: 'Flows To', description: 'Process or data flow' },
] as const;

export const NODE_STATUS = [
  { id: 'proposed', label: 'Proposed', color: '#94a3b8' },
  { id: 'approved', label: 'Approved', color: '#3b82f6' },
  { id: 'in-progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'implemented', label: 'Implemented', color: '#10b981' },
  { id: 'deprecated', label: 'Deprecated', color: '#ef4444' },
] as const;

export const LAYER_TYPES = [
  { level: 0, type: 'enterprise', label: 'L0: Enterprise Overview', description: 'TOGAF Phases & Domains' },
  { level: 1, type: 'capability', label: 'L1: Capability & Process', description: 'Capability & eTOM Landscape' },
  { level: 2, type: 'application', label: 'L2: Application & Data', description: 'Application & Data Architecture' },
  { level: 3, type: 'technology', label: 'L3: Technology', description: 'Technology Implementation' },
  { level: 4, type: 'runtime', label: 'L4: Runtime', description: 'CI/CD & Operations' },
] as const;
