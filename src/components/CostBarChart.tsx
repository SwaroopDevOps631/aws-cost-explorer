
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { CostData } from '@/data/sampleData';
import { generateColorPalette } from '@/utils/colorUtils';

interface CostBarChartProps {
  data: CostData[];
  groupBy: string;
}

const CostBarChart: React.FC<CostBarChartProps> = ({ data, groupBy }) => {
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
        cost: Number(value.toFixed(2))
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10); // Show top 10
  };

  const chartData = processData();
  
  // Generate dynamic colors based on the data items
  const colors = generateColorPalette(chartData.map(item => item.name));

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const customTooltipFormatter = (value: any, name: any) => {
    return [formatCurrency(value), 'Cost'];
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
            stroke="#64748b"
          />
          <YAxis tickFormatter={formatCurrency} stroke="#64748b" />
          <Tooltip 
            formatter={customTooltipFormatter}
            labelStyle={{ color: '#1e293b' }}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="cost" 
            name="Cost (USD)"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostBarChart;
