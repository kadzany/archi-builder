'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TEMPLATES } from '@/lib/templates';
import { ArrowLeft, Download, Eye } from 'lucide-react';

export default function TemplatesPage() {
  const togafTemplates = TEMPLATES.filter((t) => t.category === 'TOGAF');
  const etomTemplates = TEMPLATES.filter((t) => t.category === 'eTOM');
  const sidTemplates = TEMPLATES.filter((t) => t.category === 'SID');

  const TemplateCard = ({ template }: { template: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <Badge variant="secondary">{template.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{template.description}</CardDescription>
        <div className="text-xs text-muted-foreground mb-4">
          <p>
            {template.schema.nodes?.length || 0} nodes · {template.schema.edges?.length || 0} edges
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/editor">
              <Download className="mr-2 h-4 w-4" />
              Use Template
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/editor">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">Template Gallery</h1>
            <p className="text-muted-foreground">
              Professional templates for TOGAF, eTOM, and SID frameworks
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="togaf">TOGAF</TabsTrigger>
            <TabsTrigger value="etom">eTOM</TabsTrigger>
            <TabsTrigger value="sid">SID</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">TOGAF Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {togafTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">eTOM Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {etomTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">SID Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sidTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="togaf">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {togafTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="etom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {etomTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sidTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
