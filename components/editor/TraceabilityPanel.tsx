import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DiagramNode, DiagramEdge } from '@/lib/types/diagram';
import { ArrowDown, ArrowUp, Network } from 'lucide-react';

interface TraceabilityPanelProps {
  selectedNode: DiagramNode | null;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onNavigateToNode?: (nodeId: string) => void;
}

export function TraceabilityPanel({
  selectedNode,
  nodes,
  edges,
  onNavigateToNode,
}: TraceabilityPanelProps) {
  if (!selectedNode) {
    return (
      <Card className="w-80 h-full border-l rounded-none">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Traceability</h2>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          <p className="text-sm">Select a node to view dependencies</p>
        </div>
      </Card>
    );
  }

  const upstreamDeps = edges
    .filter(e => e.target === selectedNode.id)
    .map(e => {
      const node = nodes.find(n => n.id === e.source);
      return { node, edge: e };
    })
    .filter(item => item.node);

  const downstreamDeps = edges
    .filter(e => e.source === selectedNode.id)
    .map(e => {
      const node = nodes.find(n => n.id === e.target);
      return { node, edge: e };
    })
    .filter(item => item.node);

  return (
    <Card className="w-80 h-full border-l rounded-none">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Traceability</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Dependencies for {selectedNode.label}
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-sm">
                Upstream ({upstreamDeps.length})
              </h3>
            </div>

            {upstreamDeps.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-6">
                No upstream dependencies
              </p>
            ) : (
              <div className="space-y-2">
                {upstreamDeps.map(({ node, edge }) => (
                  <div
                    key={edge.id}
                    className="pl-6 p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onNavigateToNode?.(node!.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{node!.label}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {node!.type}
                        </Badge>
                      </div>
                    </div>
                    {edge.props?.relationshipType && (
                      <Badge variant="secondary" className="mt-2 text-[10px]">
                        {edge.props.relationshipType}
                      </Badge>
                    )}
                    {node!.props?.owner && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Owner: {node!.props.owner}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-green-600" />
              <h3 className="font-semibold text-sm">
                Downstream ({downstreamDeps.length})
              </h3>
            </div>

            {downstreamDeps.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-6">
                No downstream dependencies
              </p>
            ) : (
              <div className="space-y-2">
                {downstreamDeps.map(({ node, edge }) => (
                  <div
                    key={edge.id}
                    className="pl-6 p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => onNavigateToNode?.(node!.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{node!.label}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {node!.type}
                        </Badge>
                      </div>
                    </div>
                    {edge.props?.relationshipType && (
                      <Badge variant="secondary" className="mt-2 text-[10px]">
                        {edge.props.relationshipType}
                      </Badge>
                    )}
                    {node!.props?.owner && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Owner: {node!.props.owner}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-sm">Summary</h3>
            </div>

            <div className="pl-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Dependencies:</span>
                <span className="font-medium">
                  {upstreamDeps.length + downstreamDeps.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upstream:</span>
                <span className="font-medium text-blue-600">
                  {upstreamDeps.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Downstream:</span>
                <span className="font-medium text-green-600">
                  {downstreamDeps.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
