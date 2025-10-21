'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const recentDiagrams = [
    {
      id: '1',
      title: '5G Network Architecture',
      updatedAt: '2 hours ago',
      framework: 'TOGAF',
      nodes: 45,
      edges: 67,
    },
    {
      id: '2',
      title: 'Service Fulfillment Flow',
      updatedAt: '1 day ago',
      framework: 'eTOM',
      nodes: 12,
      edges: 18,
    },
    {
      id: '3',
      title: 'Data Model - Customer Domain',
      updatedAt: '3 days ago',
      framework: 'SID',
      nodes: 28,
      edges: 42,
    },
  ];

  const stats = [
    { label: 'Total Diagrams', value: '12', icon: FileText },
    { label: 'Completed This Week', value: '3', icon: TrendingUp },
    { label: 'Avg. Validation Score', value: '92%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">ArchiBuilder</h1>
            <p className="text-muted-foreground mt-2">
              Professional Enterprise Architecture Diagramming for Telco
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/templates">Browse Templates</Link>
            </Button>
            <Button asChild>
              <Link href="/editor">
                <Plus className="mr-2 h-4 w-4" />
                New Diagram
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Diagrams</CardTitle>
            <CardDescription>Continue working on your latest projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDiagrams.map((diagram) => (
                <Link key={diagram.id} href="/editor">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{diagram.title}</h3>
                            <Badge variant="secondary">{diagram.framework}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {diagram.updatedAt}
                            </span>
                            <span>{diagram.nodes} nodes</span>
                            <span>{diagram.edges} edges</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Open
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with popular templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link href="/editor">
                  <span className="font-semibold">TOGAF ADM</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Architecture Development Method
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link href="/editor">
                  <span className="font-semibold">eTOM Fulfillment</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Service Order Flow
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link href="/editor">
                  <span className="font-semibold">SID Entity Map</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Data Model Relationships
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
