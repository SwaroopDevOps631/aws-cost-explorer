
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostData } from '@/data/sampleData';

interface CostPieChartProps {
  data: CostData[];
  groupBy: string;
}

// Excelra-inspired color palette
const COLORS = [
  '#1e40af', '#3b82f6', '#1e3a8a', '#2563eb', '#1d4ed8', 
  '#1e3a8a', '#3730a3', '#4338ca', '#4f46e5', '#6366f1'
];

const CostPieChart: React.FC<CostPieChartProps> = ({ data, groupBy }) => {
  const processData = () => {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy as keyof CostData] as string;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item.cost;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([key, value]) => ({
        name: key,
        value: Number(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value);
  };

  const chartData = processData();

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const customTooltipFormatter = (value: any, name: any) => {
    return [formatCurrency(value), 'Cost'];
  };

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={customTooltipFormatter}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostPieChart;
