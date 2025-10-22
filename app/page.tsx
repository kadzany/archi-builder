import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Layers, Network, Database, CheckCircle } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Layers,
      title: 'TOGAF ADM',
      description: 'Complete Architecture Development Method phases with swimlane layouts',
    },
    {
      icon: Network,
      title: 'eTOM Processes',
      description: 'End-to-end fulfillment, assurance, and billing process flows',
    },
    {
      icon: Database,
      title: 'SID Entities',
      description: 'TM Forum data models with Customer, Product, Service, and Resource',
    },
    {
      icon: CheckCircle,
      title: 'Governance & Validation',
      description: 'Built-in compliance checking and architecture maturity scoring',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Layers className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">ArchiBuilder</span>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/templates">Templates</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/editor">
                Launch Editor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>

        <div className="mt-20 mb-16 text-center space-y-6">
          <h1 className="text-6xl font-bold tracking-tight">
            Professional Architecture
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Diagramming for Telco
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build enterprise architecture diagrams with TOGAF, eTOM, and SID frameworks.
            Designed for Solution Architects in telecommunications.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/editor">
                Start Building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2 hover:border-blue-200 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-20 border-2">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Build?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a template or create from scratch. Export to JSON, PNG, SVG, or PDF.
              Validate against TOGAF and eTOM best practices.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/editor">
                Open Editor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <footer className="py-8 border-t text-center text-sm text-muted-foreground">
          <p>ArchiBuilder v2.1 - Enterprise Architecture Diagramming Tool</p>
          <p className="mt-2">Built with Next.js, TypeScript, Tailwind CSS & Supabase</p>
          <p className="mt-1 text-xs">Layer-aware modeling • TOGAF + eTOM + SID aligned</p>
        </footer>
      </div>
    </div>
  );
}
