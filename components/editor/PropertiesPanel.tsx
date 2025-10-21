'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DiagramNode, DiagramEdge } from '@/lib/types/diagram';
import { TOGAF_PHASES, ETOM_AREAS, SID_ENTITIES } from '@/lib/constants/frameworks';

interface PropertiesPanelProps {
  selectedNode?: DiagramNode | null;
  selectedEdge?: DiagramEdge | null;
  onUpdateNode?: (id: string, updates: Partial<DiagramNode>) => void;
  onUpdateEdge?: (id: string, updates: Partial<DiagramEdge>) => void;
}

export function PropertiesPanel({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
}: PropertiesPanelProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <Card className="w-80 h-full border-l rounded-none">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Properties</h2>
        </div>
        <div className="p-6 text-center text-muted-foreground">
          <p className="text-sm">Select a node or edge to view properties</p>
        </div>
      </Card>
    );
  }

  if (selectedNode) {
    return (
      <Card className="w-80 h-full border-l rounded-none">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Node Properties</h2>
          <Badge variant="secondary" className="mt-2">{selectedNode.type}</Badge>
        </div>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={selectedNode.label}
                onChange={(e) => onUpdateNode?.(selectedNode.id, { label: e.target.value })}
                placeholder="Node label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={selectedNode.type}
                disabled
                className="bg-muted"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="togaf">TOGAF Phase</Label>
              <Select
                value={selectedNode.framework?.togafPhase || ''}
                onValueChange={(value) =>
                  onUpdateNode?.(selectedNode.id, {
                    framework: { ...selectedNode.framework, togafPhase: value as any },
                  })
                }
              >
                <SelectTrigger id="togaf">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {TOGAF_PHASES.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.id}: {phase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="etom">eTOM Area</Label>
              <Select
                value={selectedNode.framework?.etom || ''}
                onValueChange={(value) =>
                  onUpdateNode?.(selectedNode.id, {
                    framework: { ...selectedNode.framework, etom: value as any },
                  })
                }
              >
                <SelectTrigger id="etom">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {ETOM_AREAS.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>SID Entities</Label>
              <div className="flex flex-wrap gap-2">
                {SID_ENTITIES.map((entity) => {
                  const isSelected = selectedNode.framework?.sid?.includes(entity.id);
                  return (
                    <Badge
                      key={entity.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={
                        isSelected
                          ? { backgroundColor: entity.color, borderColor: entity.color }
                          : undefined
                      }
                      onClick={() => {
                        const currentSid = selectedNode.framework?.sid || [];
                        const newSid = isSelected
                          ? currentSid.filter((id) => id !== entity.id)
                          : [...currentSid, entity.id];
                        onUpdateNode?.(selectedNode.id, {
                          framework: { ...selectedNode.framework, sid: newSid },
                        });
                      }}
                    >
                      {entity.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={selectedNode.style?.color || '#3b82f6'}
                  onChange={(e) =>
                    onUpdateNode?.(selectedNode.id, {
                      style: { ...selectedNode.style, color: e.target.value },
                    })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={selectedNode.style?.color || '#3b82f6'}
                  onChange={(e) =>
                    onUpdateNode?.(selectedNode.id, {
                      style: { ...selectedNode.style, color: e.target.value },
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={selectedNode.size.w}
                  onChange={(e) =>
                    onUpdateNode?.(selectedNode.id, {
                      size: { ...selectedNode.size, w: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={selectedNode.size.h}
                  onChange={(e) =>
                    onUpdateNode?.(selectedNode.id, {
                      size: { ...selectedNode.size, h: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={selectedNode.props?.owner || ''}
                onChange={(e) =>
                  onUpdateNode?.(selectedNode.id, {
                    props: { ...selectedNode.props, owner: e.target.value },
                  })
                }
                placeholder="Team or person"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sla">SLA</Label>
              <Input
                id="sla"
                value={selectedNode.props?.sla || ''}
                onChange={(e) =>
                  onUpdateNode?.(selectedNode.id, {
                    props: { ...selectedNode.props, sla: e.target.value },
                  })
                }
                placeholder="e.g., 99.9%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={selectedNode.props?.notes || ''}
                onChange={(e) =>
                  onUpdateNode?.(selectedNode.id, {
                    props: { ...selectedNode.props, notes: e.target.value },
                  })
                }
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>
      </Card>
    );
  }

  if (selectedEdge) {
    return (
      <Card className="w-80 h-full border-l rounded-none">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Edge Properties</h2>
          <Badge variant="secondary" className="mt-2">{selectedEdge.type}</Badge>
        </div>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edge-label">Label</Label>
              <Input
                id="edge-label"
                value={selectedEdge.label || ''}
                onChange={(e) => onUpdateEdge?.(selectedEdge.id, { label: e.target.value })}
                placeholder="Edge label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edge-type">Type</Label>
              <Select
                value={selectedEdge.type}
                onValueChange={(value) => onUpdateEdge?.(selectedEdge.id, { type: value as any })}
              >
                <SelectTrigger id="edge-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orthogonal">Orthogonal</SelectItem>
                  <SelectItem value="smoothstep">Smooth Step</SelectItem>
                  <SelectItem value="bezier">Bezier</SelectItem>
                  <SelectItem value="straight">Straight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="latency">Latency (ms)</Label>
              <Input
                id="latency"
                type="number"
                value={selectedEdge.props?.latencyMs || ''}
                onChange={(e) =>
                  onUpdateEdge?.(selectedEdge.id, {
                    props: { ...selectedEdge.props, latencyMs: Number(e.target.value) },
                  })
                }
                placeholder="e.g., 50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bandwidth">Bandwidth</Label>
              <Input
                id="bandwidth"
                value={selectedEdge.props?.bandwidth || ''}
                onChange={(e) =>
                  onUpdateEdge?.(selectedEdge.id, {
                    props: { ...selectedEdge.props, bandwidth: e.target.value },
                  })
                }
                placeholder="e.g., 10Gbps"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Input
                id="protocol"
                value={selectedEdge.props?.protocol || ''}
                onChange={(e) =>
                  onUpdateEdge?.(selectedEdge.id, {
                    props: { ...selectedEdge.props, protocol: e.target.value },
                  })
                }
                placeholder="e.g., REST, gRPC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardinality">Cardinality</Label>
              <Input
                id="cardinality"
                value={selectedEdge.props?.cardinality || ''}
                onChange={(e) =>
                  onUpdateEdge?.(selectedEdge.id, {
                    props: { ...selectedEdge.props, cardinality: e.target.value },
                  })
                }
                placeholder="e.g., 1:N, N:M"
              />
            </div>
          </div>
        </ScrollArea>
      </Card>
    );
  }

  return null;
}
