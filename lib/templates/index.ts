import { Template } from '@/lib/types/diagram';
import togafAdm from './togaf-adm.json';
import etomFulfillment from './etom-fulfillment.json';
import sidEntityMap from './sid-entity-map.json';

export const TEMPLATES: Template[] = [
  {
    id: 'togaf-adm',
    name: 'TOGAF ADM Phases',
    description: 'Complete Architecture Development Method swimlane template with all phases (Preliminary through H)',
    category: 'TOGAF',
    thumbnail: '/templates/togaf-adm.png',
    schema: togafAdm as any,
  },
  {
    id: 'etom-fulfillment',
    name: 'eTOM Fulfillment Flow',
    description: 'End-to-end service fulfillment process from Lead to Activation',
    category: 'eTOM',
    thumbnail: '/templates/etom-fulfillment.png',
    schema: etomFulfillment as any,
  },
  {
    id: 'sid-entity-map',
    name: 'SID Entity Relationship',
    description: 'Core TM Forum SID entities including Customer, Product, Service, and Resource',
    category: 'SID',
    thumbnail: '/templates/sid-entity-map.png',
    schema: sidEntityMap as any,
  },
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return TEMPLATES.filter(t => t.category === category);
}
