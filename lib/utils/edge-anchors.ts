import { DiagramNode } from '@/lib/types/diagram';

export interface Point {
  x: number;
  y: number;
}

function getNodeCenter(node: DiagramNode): Point {
  return {
    x: node.position.x + node.size.w / 2,
    y: node.position.y + node.size.h / 2,
  };
}

function getRectangleIntersection(
  node: DiagramNode,
  externalPoint: Point
): Point {
  const center = getNodeCenter(node);
  const dx = externalPoint.x - center.x;
  const dy = externalPoint.y - center.y;

  const halfWidth = node.size.w / 2;
  const halfHeight = node.size.h / 2;

  if (dx === 0 && dy === 0) {
    return { x: center.x + halfWidth, y: center.y };
  }

  const angle = Math.atan2(dy, dx);
  const absAngle = Math.abs(angle);
  const cornerAngle = Math.atan2(halfHeight, halfWidth);

  if (absAngle <= cornerAngle) {
    return {
      x: node.position.x + node.size.w,
      y: center.y + (halfWidth * Math.tan(angle)),
    };
  } else if (absAngle <= Math.PI - cornerAngle) {
    const sign = angle > 0 ? 1 : -1;
    return {
      x: center.x + (halfHeight / Math.tan(absAngle) * sign),
      y: node.position.y + (sign > 0 ? node.size.h : 0),
    };
  } else {
    return {
      x: node.position.x,
      y: center.y - (halfWidth * Math.tan(angle)),
    };
  }
}

function getEllipseIntersection(
  node: DiagramNode,
  externalPoint: Point
): Point {
  const center = getNodeCenter(node);
  const dx = externalPoint.x - center.x;
  const dy = externalPoint.y - center.y;

  if (dx === 0 && dy === 0) {
    return { x: center.x + node.size.w / 2, y: center.y };
  }

  const angle = Math.atan2(dy, dx);
  const rx = node.size.w / 2;
  const ry = node.size.h / 2;

  const x = center.x + rx * Math.cos(angle);
  const y = center.y + ry * Math.sin(angle);

  return { x, y };
}

function getDiamondIntersection(
  node: DiagramNode,
  externalPoint: Point
): Point {
  const center = getNodeCenter(node);
  const dx = externalPoint.x - center.x;
  const dy = externalPoint.y - center.y;

  if (dx === 0 && dy === 0) {
    return { x: center.x + node.size.w / 2, y: center.y };
  }

  const halfWidth = node.size.w / 2;
  const halfHeight = node.size.h / 2;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  const scale = halfWidth * halfHeight / (halfHeight * absDx + halfWidth * absDy);

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

function getHexagonIntersection(
  node: DiagramNode,
  externalPoint: Point
): Point {
  const center = getNodeCenter(node);
  const dx = externalPoint.x - center.x;
  const dy = externalPoint.y - center.y;

  if (dx === 0 && dy === 0) {
    return { x: center.x + node.size.w / 2, y: center.y };
  }

  const angle = Math.atan2(dy, dx);
  const absAngle = Math.abs(angle);

  const w = node.size.w;
  const h = node.size.h;
  const sideAngle = Math.atan2(h / 2, w / 4);

  if (absAngle < sideAngle) {
    const t = (w / 2) / Math.cos(angle);
    return {
      x: center.x + t * Math.cos(angle),
      y: center.y + t * Math.sin(angle),
    };
  } else if (absAngle < Math.PI - sideAngle) {
    const sign = angle > 0 ? 1 : -1;
    const edgeY = center.y + sign * h / 2;
    const edgeX = center.x + sign * (h / 2) / Math.tan(absAngle);
    return { x: edgeX, y: edgeY };
  } else {
    const t = (-w / 2) / Math.cos(angle);
    return {
      x: center.x + t * Math.cos(angle),
      y: center.y + t * Math.sin(angle),
    };
  }
}

export function getEdgeAnchorPoint(
  node: DiagramNode,
  externalPoint: Point
): Point {
  const shape = node.style?.shape || 'rectangle';

  switch (shape) {
    case 'ellipse':
      return getEllipseIntersection(node, externalPoint);
    case 'diamond':
      return getDiamondIntersection(node, externalPoint);
    case 'hexagon':
      return getHexagonIntersection(node, externalPoint);
    case 'rectangle':
    case 'rounded':
    case 'note':
    case 'swimlane':
    case 'phase':
    case 'processArea':
    default:
      return getRectangleIntersection(node, externalPoint);
  }
}
