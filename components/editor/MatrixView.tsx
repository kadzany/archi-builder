import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DiagramNode, DiagramEdge } from '@/lib/types/diagram';
import { Check, Minus } from 'lucide-react';

interface MatrixViewProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  matrixType: 'capability-app' | 'etom-service' | 'app-data';
}

export function MatrixView({ nodes, edges, matrixType }: MatrixViewProps) {
  const getRowNodes = () => {
    switch (matrixType) {
      case 'capability-app':
        return nodes.filter(n => n.type === 'capability');
      case 'etom-service':
        return nodes.filter(n => n.type === 'process');
      case 'app-data':
        return nodes.filter(n => n.type === 'app');
      default:
        return [];
    }
  };

  const getColNodes = () => {
    switch (matrixType) {
      case 'capability-app':
        return nodes.filter(n => n.type === 'app');
      case 'etom-service':
        return nodes.filter(n => n.framework?.sid?.includes('Service'));
      case 'app-data':
        return nodes.filter(n => n.type === 'data');
      default:
        return [];
    }
  };

  const hasRelationship = (rowNodeId: string, colNodeId: string): boolean => {
    return edges.some(
      edge =>
        (edge.source === rowNodeId && edge.target === colNodeId) ||
        (edge.source === colNodeId && edge.target === rowNodeId)
    );
  };

  const getRelationshipType = (rowNodeId: string, colNodeId: string): string | null => {
    const edge = edges.find(
      e =>
        (e.source === rowNodeId && e.target === colNodeId) ||
        (e.source === colNodeId && e.target === rowNodeId)
    );
    return edge?.props?.relationshipType || null;
  };

  const rowNodes = getRowNodes();
  const colNodes = getColNodes();

  const matrixTitles = {
    'capability-app': 'Capability ↔ Application Matrix',
    'etom-service': 'eTOM Process ↔ Service/API Matrix',
    'app-data': 'Application ↔ Data Matrix',
  };

  return (
    <Card className="w-full h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">{matrixTitles[matrixType]}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Traceability matrix showing relationships
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted/50 sticky left-0 z-10 min-w-[200px]"></th>
                  {colNodes.map(col => (
                    <th key={col.id} className="border p-2 bg-muted/50 min-w-[120px] text-xs font-medium">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{col.label}</span>
                        {col.props?.owner && (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {col.props.owner}
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowNodes.map(row => (
                  <tr key={row.id}>
                    <td className="border p-2 bg-muted/30 sticky left-0 z-10 font-medium text-sm">
                      <div className="flex flex-col">
                        <span>{row.label}</span>
                        {row.framework?.togafPhase && (
                          <Badge variant="secondary" className="mt-1 text-[10px] w-fit">
                            {row.framework.togafPhase}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {colNodes.map(col => {
                      const hasRel = hasRelationship(row.id, col.id);
                      const relType = getRelationshipType(row.id, col.id);
                      return (
                        <td
                          key={col.id}
                          className={`border p-2 text-center ${
                            hasRel ? 'bg-green-50' : 'bg-white'
                          }`}
                        >
                          {hasRel ? (
                            <div className="flex flex-col items-center gap-1">
                              <Check className="h-4 w-4 text-green-600" />
                              {relType && (
                                <span className="text-[10px] text-muted-foreground">
                                  {relType}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Minus className="h-4 w-4 text-gray-300 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rowNodes.length === 0 || colNodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No data available for this matrix type</p>
              <p className="text-xs mt-1">Add relevant nodes to the canvas to populate the matrix</p>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </Card>
  );
}
