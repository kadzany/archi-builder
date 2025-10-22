import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getLayerDefinition } from '@/lib/constants/layers';
import { ArrowRight, Info } from 'lucide-react';
import * as Icons from 'lucide-react';

interface LayerTransitionDialogProps {
  open: boolean;
  onClose: () => void;
  fromLayer: number;
  toLayer: number;
  onConfirm: () => void;
}

export function LayerTransitionDialog({
  open,
  onClose,
  fromLayer,
  toLayer,
  onConfirm,
}: LayerTransitionDialogProps) {
  const fromDef = getLayerDefinition(fromLayer);
  const toDef = getLayerDefinition(toLayer);

  const FromIcon = Icons[fromDef.icon as keyof typeof Icons] as any;
  const ToIcon = Icons[toDef.icon as keyof typeof Icons] as any;

  const isMovingDown = toLayer > fromLayer;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Architecture Layer</DialogTitle>
          <DialogDescription>
            You&apos;re moving {isMovingDown ? 'down' : 'up'} in the architecture stack
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${fromDef.color}20`, color: fromDef.color }}
            >
              {FromIcon && <FromIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{fromDef.label}</div>
              <div className="text-xs text-muted-foreground">{fromDef.description}</div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${toDef.color}20`, color: toDef.color }}
            >
              {ToIcon && <ToIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{toDef.label}</div>
              <div className="text-xs text-muted-foreground">{toDef.description}</div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <div className="space-y-2">
                <p className="font-medium">What changes:</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Palette will show {toDef.allowedNodeTypes.length} node types</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Validation rules adjusted for {toDef.label}</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Framework alignment: TOGAF {toDef.togafAlignment.join(', ') || 'N/A'}</span>
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-xs font-medium">Recommended node types:</p>
            <div className="flex flex-wrap gap-1.5">
              {toDef.allowedNodeTypes
                .filter(t => !['note', 'group'].includes(t))
                .map(type => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="text-[10px]"
                    style={{ backgroundColor: `${toDef.color}15`, color: toDef.color }}
                  >
                    {type}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Switch to {toDef.shortLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}