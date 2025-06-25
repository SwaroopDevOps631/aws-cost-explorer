
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CostData } from '@/data/sampleData';

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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip 
            formatter={customTooltipFormatter}
            labelStyle={{ color: '#333' }}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
          />
          <Legend />
          <Bar dataKey="cost" fill="#f97316" name="Cost (USD)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostBarChart;
