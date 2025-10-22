import { DiagramNode, DiagramEdge } from '@/lib/types/diagram';

export async function exportToPNG(canvasElement: HTMLElement, filename: string = 'diagram.png'): Promise<void> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const rect = canvasElement.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgElements = canvasElement.querySelectorAll('svg');
    for (const svg of Array.from(svgElements)) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        img.onload = () => {
          const svgRect = svg.getBoundingClientRect();
          const x = svgRect.left - rect.left;
          const y = svgRect.top - rect.top;
          ctx.drawImage(img, x, y, svgRect.width, svgRect.height);
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Failed to create blob');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
}

export async function exportToPDF(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  filename: string = 'diagram.pdf'
): Promise<void> {
  const message = 'PDF export requires additional library. For now, use PNG export or JSON export.';
  console.warn(message);
  alert(message);
}

export function exportToSVG(canvasElement: HTMLElement, filename: string = 'diagram.svg'): void {
  try {
    const svgElements = canvasElement.querySelectorAll('svg');
    if (svgElements.length === 0) {
      throw new Error('No SVG elements found');
    }

    const mainSvg = svgElements[0];
    const svgData = new XMLSerializer().serializeToString(mainSvg);

    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to SVG:', error);
    throw error;
  }
}

export function exportToArchiMate(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  const archimate = {
    model: {
      name: 'ArchiBuilder Export',
      version: '1.0',
      elements: nodes.map(node => ({
        id: node.id,
        name: node.label,
        type: mapNodeTypeToArchiMate(node.type),
        documentation: node.props?.description || '',
        properties: {
          togafPhase: node.framework?.togafPhase,
          etomArea: node.framework?.etom,
          owner: node.props?.owner,
          status: node.props?.status,
        },
      })),
      relationships: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.props?.relationshipType || 'association',
        name: edge.label,
      })),
    },
  };

  return JSON.stringify(archimate, null, 2);
}

function mapNodeTypeToArchiMate(type: string): string {
  const mapping: Record<string, string> = {
    capability: 'capability',
    process: 'business-process',
    app: 'application-component',
    tech: 'node',
    data: 'data-object',
    group: 'grouping',
  };

  return mapping[type] || 'element';
}

export async function importFromJSON(jsonString: string): Promise<{ nodes: DiagramNode[]; edges: DiagramEdge[] }> {
  try {
    const data = JSON.parse(jsonString);

    if (data.nodes && data.edges) {
      return {
        nodes: data.nodes,
        edges: data.edges,
      };
    }

    if (data.$schema && data.version && data.meta) {
      return {
        nodes: data.nodes || [],
        edges: data.edges || [],
      };
    }

    throw new Error('Invalid JSON format');
  } catch (error) {
    console.error('Error importing from JSON:', error);
    throw error;
  }
}
