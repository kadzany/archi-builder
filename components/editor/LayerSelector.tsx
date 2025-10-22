import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LAYER_DEFINITIONS } from '@/lib/constants/layers';
import * as Icons from 'lucide-react';
import { ChevronDown } from 'lucide-react';

interface LayerSelectorProps {
  currentLayer: number;
  onLayerChange: (layer: number) => void;
  disabled?: boolean;
}

export function LayerSelector({ currentLayer, onLayerChange, disabled = false }: LayerSelectorProps) {
  const currentDef =
    LAYER_DEFINITIONS.find((l) => l.level === currentLayer) || LAYER_DEFINITIONS[0];
  const IconComponent =
    Icons[currentDef.icon as keyof typeof Icons] as React.ComponentType<any>;

  return (
    <div className="flex items-start gap-3">
      <Select
        value={String(currentLayer)}
        onValueChange={(value) => onLayerChange(parseInt(value))}
        disabled={disabled}
      >
        {/* Trigger: render tampilan sendiri supaya tidak pakai SelectValue */}
        <SelectTrigger
          className="relative w-[360px] h-11 bg-background pr-9"
          aria-label="Select architecture layer"
        >
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${currentDef.color}20`, color: currentDef.color }}
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
            </div>

            <div className="min-w-0 flex-1 leading-tight">
              <div className="font-medium text-sm truncate">
                {`${currentDef.label}`}
              </div>
              {currentDef.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {currentDef.description}
                </div>
              )}
            </div>
          </div>

          {/* chevron manual biar tidak ketumpuk konten */}
          {/* <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
        </SelectTrigger>

        {/* Dropdown: lebar konsisten & rapi */}
        <SelectContent className="w-[480px]" position="popper" sideOffset={6} align="start">
          {LAYER_DEFINITIONS.map((layer) => {
            const LayerIcon = Icons[layer.icon as keyof typeof Icons] as any;
            return (
              <SelectItem key={layer.level} value={String(layer.level)} className="py-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${layer.color}20`, color: layer.color }}
                  >
                    {LayerIcon && <LayerIcon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {`${layer.label}`}
                    </div>
                    {layer.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {layer.description}
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Badges: wrap & kecil supaya tidak memecah layout */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {currentDef.togafAlignment?.length > 0 && (
          <Badge variant="outline" className="text-[10px] h-5 px-1.5">
            TOGAF: {currentDef.togafAlignment.join(', ')}
          </Badge>
        )}
        {currentDef.etomAlignment?.length > 0 && (
          <Badge variant="outline" className="text-[10px] h-5 px-1.5">
            eTOM: {currentDef.etomAlignment.join(', ')}
          </Badge>
        )}
      </div>
    </div>
  );
}
