import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Palette, Filter, Eye } from 'lucide-react';
import { TOGAF_PHASES, ETOM_AREAS, NODE_STATUS } from '@/lib/constants/frameworks';

export type HeatmapMode = 'none' | 'togaf' | 'etom' | 'owner' | 'status';

interface VisualizationControlsProps {
  heatmapMode: HeatmapMode;
  onHeatmapChange: (mode: HeatmapMode) => void;
  filterOwner?: string;
  filterStatus?: string;
  onFilterOwnerChange?: (owner: string | undefined) => void;
  onFilterStatusChange?: (status: string | undefined) => void;
}

export function VisualizationControls({
  heatmapMode,
  onHeatmapChange,
  filterOwner,
  filterStatus,
  onFilterOwnerChange,
  onFilterStatusChange,
}: VisualizationControlsProps) {
  return (
    <Card className="absolute top-4 right-4 z-10 p-4 shadow-lg bg-background/95 backdrop-blur">
      <div className="space-y-4 min-w-[250px]">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Visualization</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="heatmap" className="text-xs">Heatmap Mode</Label>
          <Select value={heatmapMode} onValueChange={(value) => onHeatmapChange(value as HeatmapMode)}>
            <SelectTrigger id="heatmap" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="togaf">TOGAF Phase</SelectItem>
              <SelectItem value="etom">eTOM Area</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {heatmapMode !== 'none' && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Color Legend</span>
            </div>
            {heatmapMode === 'togaf' && (
              <div className="space-y-1">
                {TOGAF_PHASES.slice(0, 5).map((phase) => (
                  <div key={phase.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="text-xs">{phase.id}</span>
                  </div>
                ))}
              </div>
            )}
            {heatmapMode === 'etom' && (
              <div className="space-y-1">
                {ETOM_AREAS.map((area) => (
                  <div key={area.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="text-xs">{area.label}</span>
                  </div>
                ))}
              </div>
            )}
            {heatmapMode === 'status' && (
              <div className="space-y-1">
                {NODE_STATUS.map((status) => (
                  <div key={status.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-xs">{status.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-xs">Filters</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-status" className="text-xs">Status</Label>
            <Select value={filterStatus || 'all'} onValueChange={(value) => onFilterStatusChange?.(value === 'all' ? undefined : value)}>
              <SelectTrigger id="filter-status" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {NODE_STATUS.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
