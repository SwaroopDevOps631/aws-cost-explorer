
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { CostData } from '@/data/sampleData';

interface HistoricalComparisonProps {
  data: CostData[];
}

const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({ data }) => {
  const [compareEnabled, setCompareEnabled] = useState(false);

  const comparisonData = useMemo(() => {
    if (!compareEnabled) return null;

    // Get unique months and sort them
    const months = [...new Set(data.map(item => item.month))].sort();
    if (months.length < 2) return null;

    const midPoint = Math.floor(months.length / 2);
    const currentPeriodMonths = months.slice(midPoint);
    const previousPeriodMonths = months.slice(0, midPoint);

    // Group data by periods
    const currentPeriod = data.filter(item => currentPeriodMonths.includes(item.month));
    const previousPeriod = data.filter(item => previousPeriodMonths.includes(item.month));

    // Calculate totals by project
    const currentProjectTotals = currentPeriod.reduce((acc, item) => {
      if (!acc[item.project]) acc[item.project] = 0;
      acc[item.project] += item.cost;
      return acc;
    }, {} as Record<string, number>);

    const previousProjectTotals = previousPeriod.reduce((acc, item) => {
      if (!acc[item.project]) acc[item.project] = 0;
      acc[item.project] += item.cost;
      return acc;
    }, {} as Record<string, number>);

    // Calculate changes
    const allProjects = new Set([...Object.keys(currentProjectTotals), ...Object.keys(previousProjectTotals)]);
    const changes = Array.from(allProjects).map(project => {
      const current = currentProjectTotals[project] || 0;
      const previous = previousProjectTotals[project] || 0;
      const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      return {
        project,
        current,
        previous,
        change,
        absolute: current - previous
      };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    return {
      currentPeriod: currentPeriodMonths,
      previousPeriod: previousPeriodMonths,
      changes,
      currentTotal: currentPeriod.reduce((sum, item) => sum + item.cost, 0),
      previousTotal: previousPeriod.reduce((sum, item) => sum + item.cost, 0)
    };
  }, [data, compareEnabled]);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Historical Trends Comparison
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="compare-toggle"
              checked={compareEnabled}
              onCheckedChange={setCompareEnabled}
            />
            <Label htmlFor="compare-toggle">Compare Periods</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!compareEnabled ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Enable comparison to analyze trends between periods</p>
          </div>
        ) : !comparisonData ? (
          <div className="text-center py-8 text-gray-500">
            <p>Not enough data for period comparison</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Period Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Current Period</h3>
                <p className="text-sm text-blue-700 mb-1">
                  {comparisonData.currentPeriod.join(', ')}
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(comparisonData.currentTotal)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Previous Period</h3>
                <p className="text-sm text-gray-700 mb-1">
                  {comparisonData.previousPeriod.join(', ')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(comparisonData.previousTotal)}
                </p>
              </div>
            </div>

            {/* Overall Change */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Overall Change</h3>
                  <p className="text-sm text-gray-600">Total cost difference between periods</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {comparisonData.currentTotal > comparisonData.previousTotal ? (
                      <TrendingUp className="w-5 h-5 text-red-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    )}
                    <span className="text-xl font-bold">
                      {formatPercentage(
                        ((comparisonData.currentTotal - comparisonData.previousTotal) / comparisonData.previousTotal) * 100
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(comparisonData.currentTotal - comparisonData.previousTotal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Changes */}
            <div>
              <h3 className="font-semibold mb-3">Project-wise Changes</h3>
              <div className="space-y-3">
                {comparisonData.changes.slice(0, 8).map((item) => (
                  <div key={item.project} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.project}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.previous)} → {formatCurrency(item.current)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={item.change > 0 ? "destructive" : item.change < 0 ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {item.change > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : item.change < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        {formatPercentage(item.change)}
                      </Badge>
                      <div className="text-right text-sm">
                        <div className={`font-medium ${item.absolute > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.absolute > 0 ? '+' : ''}{formatCurrency(item.absolute)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalComparison;
