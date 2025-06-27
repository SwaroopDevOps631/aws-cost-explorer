
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp } from 'lucide-react';
import { CostData } from '@/data/sampleData';

interface TopNReportsProps {
  data: CostData[];
}

const TopNReports: React.FC<TopNReportsProps> = ({ data }) => {
  const [selectedReport, setSelectedReport] = useState<string>('top-5-projects');

  const generateReport = useMemo(() => {
    switch (selectedReport) {
      case 'top-5-projects':
        return data.reduce((acc, item) => {
          const key = item.project;
          if (!acc[key]) acc[key] = 0;
          acc[key] += item.cost;
          return acc;
        }, {} as Record<string, number>);
      
      case 'top-10-services':
        return data.reduce((acc, item) => {
          const key = item.service;
          if (!acc[key]) acc[key] = 0;
          acc[key] += item.cost;
          return acc;
        }, {} as Record<string, number>);
      
      case 'top-departments':
        return data.reduce((acc, item) => {
          const key = item.department;
          if (!acc[key]) acc[key] = 0;
          acc[key] += item.cost;
          return acc;
        }, {} as Record<string, number>);
      
      default:
        return {};
    }
  }, [data, selectedReport]);

  const sortedData = Object.entries(generateReport)
    .map(([key, value]) => ({ name: key, cost: value }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, selectedReport === 'top-10-services' ? 10 : 5);

  const exportReport = () => {
    const csvContent = [
      ['Rank', 'Name', 'Cost'],
      ...sortedData.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.cost.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Top N Reports
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-5-projects">Top 5 Costliest Projects</SelectItem>
                <SelectItem value="top-10-services">Top 10 Services Used</SelectItem>
                <SelectItem value="top-departments">Top Departments by Cost</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </Badge>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{formatCurrency(item.cost)}</div>
                <div className="text-sm text-gray-500">
                  {((item.cost / sortedData.reduce((sum, d) => sum + d.cost, 0)) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopNReports;
