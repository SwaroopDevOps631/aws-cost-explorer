
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Brain } from 'lucide-react';
import { CostData } from '@/data/sampleData';

interface SmartInsightsProps {
  data: CostData[];
}

interface Insight {
  type: 'spike' | 'drop' | 'anomaly' | 'trend';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  value?: string;
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ data }) => {
  const insights = useMemo(() => {
    const insights: Insight[] = [];
    
    // Group data by month and project for trend analysis
    const monthlyData = data.reduce((acc, item) => {
      const key = `${item.month}-${item.project}`;
      if (!acc[key]) {
        acc[key] = { month: item.month, project: item.project, cost: 0 };
      }
      acc[key].cost += item.cost;
      return acc;
    }, {} as Record<string, { month: string; project: string; cost: number }>);

    const monthlyArray = Object.values(monthlyData);
    
    // Find cost spikes (projects with >40% increase)
    const projectMonthly = monthlyArray.reduce((acc, item) => {
      if (!acc[item.project]) acc[item.project] = [];
      acc[item.project].push({ month: item.month, cost: item.cost });
      return acc;
    }, {} as Record<string, Array<{ month: string; cost: number }>>);

    Object.entries(projectMonthly).forEach(([project, months]) => {
      if (months.length >= 2) {
        const sorted = months.sort((a, b) => a.month.localeCompare(b.month));
        for (let i = 1; i < sorted.length; i++) {
          const current = sorted[i].cost;
          const previous = sorted[i - 1].cost;
          const change = ((current - previous) / previous) * 100;
          
          if (change > 40) {
            insights.push({
              type: 'spike',
              title: 'Unusual Cost Spike Detected',
              description: `Project ${project} cost increased by ${change.toFixed(1)}% compared to previous month`,
              severity: 'high',
              value: `+${change.toFixed(1)}%`
            });
          } else if (change < -30) {
            insights.push({
              type: 'drop',
              title: 'Significant Cost Reduction',
              description: `Project ${project} cost decreased by ${Math.abs(change).toFixed(1)}% compared to previous month`,
              severity: 'medium',
              value: `${change.toFixed(1)}%`
            });
          }
        }
      }
    });

    // Find top cost contributors
    const departmentCosts = data.reduce((acc, item) => {
      if (!acc[item.department]) acc[item.department] = 0;
      acc[item.department] += item.cost;
      return acc;
    }, {} as Record<string, number>);

    const totalCost = Object.values(departmentCosts).reduce((sum, cost) => sum + cost, 0);
    const topDepartment = Object.entries(departmentCosts)
      .sort(([,a], [,b]) => b - a)[0];

    if (topDepartment && (topDepartment[1] / totalCost) > 0.4) {
      insights.push({
        type: 'anomaly',
        title: 'Department Cost Concentration',
        description: `${topDepartment[0]} accounts for ${((topDepartment[1] / totalCost) * 100).toFixed(1)}% of total costs`,
        severity: 'medium',
        value: `${((topDepartment[1] / totalCost) * 100).toFixed(1)}%`
      });
    }

    // Service usage patterns
    const serviceCounts = data.reduce((acc, item) => {
      if (!acc[item.service]) acc[item.service] = 0;
      acc[item.service] += 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedService = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostUsedService) {
      insights.push({
        type: 'trend',
        title: 'Most Utilized Service',
        description: `${mostUsedService[0]} is the most frequently used service with ${mostUsedService[1]} instances`,
        severity: 'low',
        value: `${mostUsedService[1]} uses`
      });
    }

    return insights.slice(0, 5); // Show top 5 insights
  }, [data]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendingUp className="w-4 h-4" />;
      case 'drop': return <TrendingDown className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Smart Insights & Anomalies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <Alert key={index} className="border-l-4 border-l-purple-500">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge variant={getSeverityColor(insight.severity)} className="text-xs">
                        {insight.severity}
                      </Badge>
                      {insight.value && (
                        <Badge variant="outline" className="text-xs">
                          {insight.value}
                        </Badge>
                      )}
                    </div>
                    <AlertDescription className="text-sm">
                      {insight.description}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No unusual patterns detected in current data</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartInsights;
