export type NodeType = 'capability' | 'process' | 'app' | 'tech' | 'data' | 'group' | 'swimlane' | 'note' | 'phase' | 'processArea';

export type NodeShape = 'rectangle' | 'rounded' | 'note' | 'swimlane' | 'phase' | 'processArea' | 'diamond' | 'ellipse' | 'hexagon';

export type EdgeType = 'orthogonal' | 'smoothstep' | 'bezier' | 'straight' | 'arrow' | 'line';

export type AnnotationTool = 'pen' | 'rect' | 'arrow' | 'text' | 'ellipse' | 'highlight';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface Framework {
  togafPhase?: 'Preliminary' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  etom?: 'Strategy' | 'Operations' | 'Fulfillment' | 'Assurance' | 'Billing';
  sid?: string[];
}

export interface NodeStyle {
  color?: string;
  icon?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  backgroundColor?: string;
  fontSize?: number;
  shape?: NodeShape;
}

export interface DiagramNode {
  id: string;
  type: NodeType;
  framework?: Framework;
  position: Position;
  size: Size;
  label: string;
  style?: NodeStyle;
  props?: Record<string, any>;
  parentId?: string;
  childrenIds?: string[];
  zIndex?: number;
  locked?: boolean;
  isContainer?: boolean;
}

export interface EdgeProps {
  latencyMs?: number;
  bandwidth?: string;
  protocol?: string;
  sla?: string;
  cardinality?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: EdgeType;
  label?: string;
  style?: {
    strokeWidth?: number;
    strokeColor?: string;
    strokeDasharray?: string;
  };
  props?: EdgeProps;
  animated?: boolean;
}

export interface AnnotationStyle {
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  opacity?: number;
  fontSize?: number;
}

export interface Annotation {
  id: string;
  tool: AnnotationTool;
  points?: number[][];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  style?: AnnotationStyle;
}

export interface Layer {
  id: string;
  type: 'reactflow' | 'konva';
  visible?: boolean;
  locked?: boolean;
}

export interface DiagramMeta {
  title: string;
  description?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  version?: string;
}

export interface DiagramSchema {
  $schema: string;
  version: string;
  meta: DiagramMeta;
  layers: Layer[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  annotations: Annotation[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'TOGAF' | 'eTOM' | 'SID' | 'Custom';
  thumbnail?: string;
  schema: Partial<DiagramSchema>;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  edgeId?: string;
  category: 'orphan' | 'unlabeled' | 'phase-mismatch' | 'missing-property' | 'coverage';
}

export interface GovernanceReport {
  issues: ValidationIssue[];
  coverage: {
    togafPhases: string[];
    etomAreas: string[];
    sidEntities: string[];
  };
  completeness: number;
}
