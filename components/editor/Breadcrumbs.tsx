import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLayerDefinition } from '@/lib/constants/layers';
import * as Icons from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  name: string;
  layerLevel: number;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (canvasId: string) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b">
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No canvas loaded</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2.5 bg-muted/30 border-b overflow-x-auto">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => items.length > 0 && onNavigate(items[0].id)}
      >
        <Home className="h-4 w-4" />
      </Button>

      {items.map((item, index) => {
        const layerDef = getLayerDefinition(item.layerLevel);
        const LayerIcon = Icons[layerDef.icon as keyof typeof Icons] as any;
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            <Button
              variant={isLast ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-3 whitespace-nowrap"
              onClick={() => onNavigate(item.id)}
              disabled={isLast}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${layerDef.color}20`, color: layerDef.color }}
                >
                  {LayerIcon && <LayerIcon className="w-3 h-3" />}
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4"
                  style={{ borderColor: layerDef.color, color: layerDef.color }}
                >
                  {layerDef.shortLabel}
                </Badge>
                <span className="text-sm">{item.name}</span>
              </div>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
