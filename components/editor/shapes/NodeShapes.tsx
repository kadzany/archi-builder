import React from 'react';
import * as Icons from 'lucide-react';
import { DiagramNode } from '@/lib/types/diagram';

interface NodeShapeProps {
  node: DiagramNode;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export function RectangleNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  const IconComponent = node.style?.icon
    ? (Icons[node.style.icon as keyof typeof Icons] as any)
    : null;

  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none overflow-hidden"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        backgroundColor: node.style?.backgroundColor || 'white',
        borderColor: node.style?.color || '#3b82f6',
        borderWidth: node.style?.borderWidth || 2,
        borderStyle: node.style?.borderStyle || 'solid',
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {IconComponent && (
        <div
          className="absolute top-2 left-2 p-1 rounded"
          style={{
            backgroundColor: `${node.style?.color || '#3b82f6'}15`,
          }}
        >
          <IconComponent
            className="w-4 h-4"
            style={{ color: node.style?.color || '#3b82f6' }}
          />
        </div>
      )}
      <div className="flex items-center justify-center h-full p-3 text-center pointer-events-none">
        <span
          className="font-medium text-sm break-words"
          style={{
            color: node.style?.color || '#3b82f6',
            fontSize: node.style?.fontSize || 14,
          }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}

export function RoundedNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  const IconComponent = node.style?.icon
    ? (Icons[node.style.icon as keyof typeof Icons] as any)
    : null;

  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none overflow-hidden rounded-lg"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        backgroundColor: node.style?.backgroundColor || 'white',
        borderColor: node.style?.color || '#3b82f6',
        borderWidth: node.style?.borderWidth || 2,
        borderStyle: node.style?.borderStyle || 'solid',
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {IconComponent && (
        <div
          className="absolute top-2 left-2 p-1 rounded"
          style={{
            backgroundColor: `${node.style?.color || '#3b82f6'}15`,
          }}
        >
          <IconComponent
            className="w-4 h-4"
            style={{ color: node.style?.color || '#3b82f6' }}
          />
        </div>
      )}
      <div className="flex items-center justify-center h-full p-3 text-center pointer-events-none">
        <span
          className="font-medium text-sm break-words"
          style={{
            color: node.style?.color || '#3b82f6',
            fontSize: node.style?.fontSize || 14,
          }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}

export function NoteNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none overflow-hidden"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        backgroundColor: node.style?.backgroundColor || '#fef3c7',
        borderColor: node.style?.color || '#f59e0b',
        borderWidth: node.style?.borderWidth || 1,
        borderStyle: node.style?.borderStyle || 'solid',
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 1,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)',
        position: 'relative',
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        className="absolute"
        style={{
          bottom: 0,
          right: 0,
          width: '15%',
          height: '15%',
          borderLeft: `1px solid ${node.style?.color || '#f59e0b'}`,
          borderTop: `1px solid ${node.style?.color || '#f59e0b'}`,
          backgroundColor: node.style?.backgroundColor ?
            `${node.style.backgroundColor}cc` : '#fde68acc',
        }}
      />
      <div className="flex flex-col items-start justify-start h-full p-3 pointer-events-none overflow-hidden">
        <span
          className="text-sm break-words text-left font-semibold mb-1"
          style={{
            color: node.style?.color || '#92400e',
            fontSize: node.style?.fontSize || 12,
          }}
        >
          {node.label}
        </span>
        {node.props?.notes && (
          <span
            className="text-xs break-words text-left whitespace-pre-wrap"
            style={{
              color: node.style?.color || '#92400e',
              fontSize: (node.style?.fontSize || 12) - 2,
            }}
          >
            {node.props.notes}
          </span>
        )}
      </div>
    </div>
  );
}

export function SwimlaneNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none overflow-visible"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        backgroundColor: node.style?.backgroundColor || '#f0f9ff',
        borderColor: node.style?.color || '#0284c7',
        borderWidth: node.style?.borderWidth || 2,
        borderStyle: node.style?.borderStyle || 'solid',
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 0,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        className="absolute top-0 left-0 h-full flex items-center justify-center pointer-events-none"
        style={{
          width: 40,
          backgroundColor: node.style?.color || '#0284c7',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        <span className="font-semibold text-sm text-white">
          {node.label}
        </span>
      </div>
    </div>
  );
}

export function PhaseNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none overflow-visible"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        backgroundColor: node.style?.backgroundColor || '#faf5ff',
        borderColor: node.style?.color || '#9333ea',
        borderWidth: node.style?.borderWidth || 2,
        borderStyle: node.style?.borderStyle || 'dashed',
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 0,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        className="absolute top-0 left-0 w-full flex items-center justify-center pointer-events-none"
        style={{
          height: 40,
          backgroundColor: node.style?.color || '#9333ea',
        }}
      >
        <span className="font-semibold text-sm text-white">
          {node.label}
        </span>
      </div>
    </div>
  );
}

export function ProcessAreaNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none overflow-visible rounded-lg"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        backgroundColor: node.style?.backgroundColor || '#f0fdf4',
        borderColor: node.style?.color || '#16a34a',
        borderWidth: node.style?.borderWidth || 2,
        borderStyle: node.style?.borderStyle || 'solid',
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 0,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        className="absolute top-2 left-2 right-2 flex items-center justify-center pointer-events-none px-3 py-1 rounded"
        style={{
          backgroundColor: node.style?.color || '#16a34a',
        }}
      >
        <span className="font-semibold text-sm text-white">
          {node.label}
        </span>
      </div>
    </div>
  );
}

export function DiamondNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  const IconComponent = node.style?.icon
    ? (Icons[node.style.icon as keyof typeof Icons] as any)
    : null;

  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <svg width={node.size.w} height={node.size.h} style={{ overflow: 'visible' }}>
        <polygon
          points={`${node.size.w / 2},0 ${node.size.w},${node.size.h / 2} ${node.size.w / 2},${node.size.h} 0,${node.size.h / 2}`}
          fill={node.style?.backgroundColor || 'white'}
          stroke={node.style?.color || '#3b82f6'}
          strokeWidth={node.style?.borderWidth || 2}
          strokeDasharray={node.style?.borderStyle === 'dashed' ? '5,5' : undefined}
        />
      </svg>
      {IconComponent && (
        <div
          className="absolute p-1 rounded"
          style={{
            top: 8,
            left: node.size.w / 2 - 12,
            backgroundColor: `${node.style?.color || '#3b82f6'}15`,
          }}
        >
          <IconComponent
            className="w-4 h-4"
            style={{ color: node.style?.color || '#3b82f6' }}
          />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="font-medium text-sm break-words text-center px-4"
          style={{
            color: node.style?.color || '#3b82f6',
            fontSize: node.style?.fontSize || 14,
          }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}

export function EllipseNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  const IconComponent = node.style?.icon
    ? (Icons[node.style.icon as keyof typeof Icons] as any)
    : null;

  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none overflow-hidden rounded-full"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        backgroundColor: node.style?.backgroundColor || 'white',
        borderColor: node.style?.color || '#3b82f6',
        borderWidth: node.style?.borderWidth || 2,
        borderStyle: node.style?.borderStyle || 'solid',
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {IconComponent && (
        <div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 p-1 rounded"
          style={{
            backgroundColor: `${node.style?.color || '#3b82f6'}15`,
          }}
        >
          <IconComponent
            className="w-4 h-4"
            style={{ color: node.style?.color || '#3b82f6' }}
          />
        </div>
      )}
      <div className="flex items-center justify-center h-full p-3 text-center pointer-events-none">
        <span
          className="font-medium text-sm break-words"
          style={{
            color: node.style?.color || '#3b82f6',
            fontSize: node.style?.fontSize || 14,
          }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}

export function HexagonNode({ node, isDragging, onMouseDown, onClick }: NodeShapeProps) {
  const IconComponent = node.style?.icon
    ? (Icons[node.style.icon as keyof typeof Icons] as any)
    : null;

  const points = `
    ${node.size.w * 0.25},0
    ${node.size.w * 0.75},0
    ${node.size.w},${node.size.h / 2}
    ${node.size.w * 0.75},${node.size.h}
    ${node.size.w * 0.25},${node.size.h}
    0,${node.size.h / 2}
  `;

  return (
    <div
      className="absolute cursor-move hover:shadow-lg transition-shadow select-none"
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.w,
        height: node.size.h,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 1000 : node.zIndex || 1,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <svg width={node.size.w} height={node.size.h} style={{ overflow: 'visible' }}>
        <polygon
          points={points}
          fill={node.style?.backgroundColor || 'white'}
          stroke={node.style?.color || '#3b82f6'}
          strokeWidth={node.style?.borderWidth || 2}
          strokeDasharray={node.style?.borderStyle === 'dashed' ? '5,5' : undefined}
        />
      </svg>
      {IconComponent && (
        <div
          className="absolute p-1 rounded"
          style={{
            top: 8,
            left: node.size.w / 2 - 12,
            backgroundColor: `${node.style?.color || '#3b82f6'}15`,
          }}
        >
          <IconComponent
            className="w-4 h-4"
            style={{ color: node.style?.color || '#3b82f6' }}
          />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="font-medium text-sm break-words text-center px-4"
          style={{
            color: node.style?.color || '#3b82f6',
            fontSize: node.style?.fontSize || 14,
          }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}
