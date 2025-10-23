'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TOGAF_PHASES, ETOM_AREAS, SID_GROUPS, SID_ENTITIES, NODE_TYPES, CONTAINER_TYPES, SHAPE_TYPES, CONNECTOR_TYPES } from '@/lib/constants/frameworks';
import { CAPABILITY_CATALOG, APPLICATION_CATALOG } from '@/lib/constants/catalogs';
import { getLayerDefinition } from '@/lib/constants/layers';
import * as Icons from 'lucide-react';
import { Info } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useRef, useState, useEffect, useCallback } from 'react';


interface PaletteProps {
  currentLayer?: number;
  onDragStart?: (type: string, data: any) => void;
}

export function Palette({ currentLayer = 0, onDragStart }: PaletteProps) {
  const layerDef = getLayerDefinition(currentLayer);

  const filterByLayer = (items: readonly any[]) => {
    return items.filter(item => {
      const nodeType = item.id;
      return layerDef.allowedNodeTypes.includes(nodeType as any) ||
        layerDef.allowedContainers.includes(nodeType as any);
    });
  };

  const filteredNodeTypes = filterByLayer(NODE_TYPES);
  const filteredContainers = filterByLayer(CONTAINER_TYPES);
  const filteredShapes = filterByLayer(SHAPE_TYPES);
  const handleDragStart = (e: React.DragEvent, type: string, data: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, ...data }));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(type, data);
  };

  return (
    <Card className="w-64 h-full border-r rounded-none">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Palette</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag items to canvas</p>
        <Badge
          variant="secondary"
          className="mt-2 text-[10px]"
          style={{ backgroundColor: `${layerDef.color}20`, color: layerDef.color }}
        >
          {layerDef.shortLabel}: {layerDef.type}
        </Badge>
      </div>

      <Tabs defaultValue="shapes" className="w-full">
        {/* Scrollable TabsList with arrows */}
        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button
            type="button"
            className="absolute left-0 z-10 p-1 bg-background/80 hover:bg-accent rounded-r shadow-sm"
            onClick={() => {
              const el = document.getElementById('palette-tabs-scroll');
              if (el) el.scrollBy({ left: -80, behavior: 'smooth' });
            }}
          >
            <Icons.ChevronLeft className="h-4 w-4" />
          </button>

          <TabsList
            className="w-full rounded-none flex overflow-x-auto no-scrollbar scroll-smooth gap-1 px-3 whitespace-nowrap pl-[7.5rem] pr-[1.75rem]"
          >
            <TabsTrigger value="shapes" className="h-7 px-2 text-[11px] shrink-0">Nodes</TabsTrigger>
            <TabsTrigger value="capabilities" className="h-7 px-2 text-[11px] shrink-0">Capabilities</TabsTrigger>
            <TabsTrigger value="apps" className="h-7 px-2 text-[11px] shrink-0">Apps</TabsTrigger>
            <TabsTrigger value="togaf" className="h-7 px-2 text-[11px] shrink-0">TOGAF</TabsTrigger>
            <TabsTrigger value="etom" className="h-7 px-2 text-[11px] shrink-0">eTOM</TabsTrigger>
          </TabsList>

          {/* Right Arrow */}
          <button
            type="button"
            className="absolute right-0 z-10 p-1 bg-background/80 hover:bg-accent rounded-l shadow-sm"
            onClick={() => {
              const el = document.getElementById('palette-tabs-scroll');
              if (el) el.scrollBy({ left: 80, behavior: 'smooth' });
            }}
          >
            <Icons.ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <TabsContent value="shapes" className="p-3 space-y-2 mt-0">
            {layerDef.recommendations.length > 0 && (
              <Alert className="mb-3">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>{layerDef.label}</strong>
                  <ul className="mt-1 space-y-0.5 ml-2">
                    {layerDef.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">
                Node Types ({filteredNodeTypes.length})
              </h3>
              {filteredNodeTypes.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No node types available for this layer
                </p>
              ) : null}
              {filteredNodeTypes.map((nodeType) => {
                const IconComponent = Icons[nodeType.icon as keyof typeof Icons] as any;
                return (
                  <div
                    key={nodeType.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'node', nodeType)}
                    className="flex items-center gap-2 p-2 rounded border bg-card hover:bg-accent cursor-move transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${nodeType.color}15`, color: nodeType.color }}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium flex-1">{nodeType.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">
                Containers ({filteredContainers.length})
              </h3>
              {filteredContainers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No containers available for this layer
                </p>
              ) : null}
              {filteredContainers.map((container) => {
                const IconComponent = Icons[container.icon as keyof typeof Icons] as any;
                return (
                  <div
                    key={container.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'container', container)}
                    className="flex items-center gap-2 p-2 rounded border bg-card hover:bg-accent cursor-move transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${container.color}15`, color: container.color }}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium flex-1">{container.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">
                Basic Shapes ({filteredShapes.length})
              </h3>
              {filteredShapes.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No shapes available for this layer
                </p>
              ) : null}
              {filteredShapes.map((shape) => {
                const IconComponent = Icons[shape.icon as keyof typeof Icons] as any;
                return (
                  <div
                    key={shape.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'shape', shape)}
                    className="flex items-center gap-2 p-2 rounded border bg-card hover:bg-accent cursor-move transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${shape.color}15`, color: shape.color }}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium flex-1">{shape.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 mt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">SID Entities</h3>
              <Accordion
                type="multiple"
                // buka default beberapa domain yang paling sering dipakai
                defaultValue={['customer', 'product', 'service']}
                className="w-full"
              >
                {SID_GROUPS.map((group) => {
                  const items = SID_ENTITIES.filter((e) => e.groupId === group.id);
                  if (items.length === 0) return null;

                  return (
                    <AccordionItem key={group.id} value={group.id} className="border rounded">
                      <AccordionTrigger className="px-3 py-2 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                          <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                            {group.label} ({items.length})
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-3 pb-3">
                        <div className="space-y-1.5">
                          {items.map((entity) => {
                            const IconComponent = Icons[entity.icon as keyof typeof Icons] as any;
                            return (
                              <div
                                key={entity.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, 'sid', entity)}
                                className="flex items-center gap-2 p-2 rounded border bg-card hover:bg-accent cursor-move transition-colors"
                              >
                                <div
                                  className="w-8 h-8 rounded flex items-center justify-center"
                                  style={{ backgroundColor: `${entity.color}15`, color: entity.color }}
                                >
                                  {IconComponent && <IconComponent className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                  <span className="text-sm">{entity.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="p-3 space-y-2 mt-0">
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Business Capabilities</h3>
            {CAPABILITY_CATALOG.map((cap) => {
              const IconComponent = Icons[cap.icon as keyof typeof Icons] as any;
              const color = cap.color || '#3b82f6';
              return (
                <div
                  key={cap.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'node', { id: 'capability', label: cap.label })}
                  className="p-3 rounded border bg-card hover:bg-accent cursor-move transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">{cap.label}</span>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="apps" className="p-3 space-y-2 mt-0">
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Applications</h3>
            {APPLICATION_CATALOG.map((app) => {
              const IconComponent = Icons[app.icon as keyof typeof Icons] as any;
              const color = app.color || '#10b981';
              return (
                <div
                  key={app.label}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'node', { id: 'app', label: app.label, capabilityRef: app.capabilityRef })}
                  className="p-3 rounded border bg-card hover:bg-accent cursor-move transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">{app.label}</span>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="togaf" className="p-3 space-y-2 mt-0">
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">ADM Phases</h3>
            {TOGAF_PHASES.map((phase) => (
              <div
                key={phase.id}
                draggable
                onDragStart={(e) => handleDragStart(e, 'togaf', phase)}
                className="p-3 rounded border bg-card hover:bg-accent cursor-move transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: `${phase.color}15`, color: phase.color }}
                    className="font-mono"
                  >
                    {phase.id}
                  </Badge>
                  <span className="text-sm font-medium">{phase.label}</span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="etom" className="p-3 space-y-2 mt-0">
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Process Areas</h3>
            {ETOM_AREAS.map((area) => (
              <div
                key={area.id}
                draggable
                onDragStart={(e) => handleDragStart(e, 'etom', area)}
                className="p-3 rounded border bg-card hover:bg-accent cursor-move transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <span className="text-sm font-medium">{area.label}</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
}
