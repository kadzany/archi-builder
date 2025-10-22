import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getLayerDefinition } from '@/lib/constants/layers';
import { Lightbulb, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import * as Icons from 'lucide-react';

interface LayerRecommendationsProps {
  currentLayer: number;
  onClose?: () => void;
}

export function LayerRecommendations({ currentLayer, onClose }: LayerRecommendationsProps) {
  const layerDef = getLayerDefinition(currentLayer);
  const LayerIcon = Icons[layerDef.icon as keyof typeof Icons] as any;

  const allowedTypes = layerDef.allowedNodeTypes.filter(t => !['note', 'group'].includes(t));
  const allTypes = ['capability', 'process', 'app', 'tech', 'data'];
  const avoidTypes = allTypes.filter(t => !layerDef.allowedNodeTypes.includes(t as any));

  const bestPractices = [
    {
      title: 'Node Selection',
      items: allowedTypes,
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      title: 'Avoid These',
      items: avoidTypes,
      icon: AlertCircle,
      color: '#ef4444',
    },
  ];

  return (
    <Card className="w-96">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${layerDef.color}20`, color: layerDef.color }}
          >
            {LayerIcon && <LayerIcon className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{layerDef.label}</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {layerDef.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold">Recommendations</h4>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {layerDef.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500">\u2022</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold">Framework Alignment</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {layerDef.togafAlignment.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">TOGAF:</span>
                {layerDef.togafAlignment.map(phase => (
                  <Badge key={phase} variant="secondary" className="text-[10px] h-5">
                    {phase}
                  </Badge>
                ))}
              </div>
            )}
            {layerDef.etomAlignment.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">eTOM:</span>
                {layerDef.etomAlignment.map(area => (
                  <Badge key={area} variant="secondary" className="text-[10px] h-5">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {bestPractices.map((practice) => {
          const PracticeIcon = practice.icon;
          return practice.items.length > 0 ? (
            <div key={practice.title} className="space-y-2">
              <div className="flex items-center gap-2">
                <PracticeIcon className="h-4 w-4" style={{ color: practice.color }} />
                <h4 className="text-sm font-semibold">{practice.title}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {practice.items.map(item => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="text-[10px]"
                    style={{ borderColor: practice.color, color: practice.color }}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null;
        })}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Use containers to organize related elements. Drill down into child canvases for
            detailed views.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
