
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CostData } from '@/data/sampleData';

interface CostLineChartProps {
  data: CostData[];
}

const CostLineChart: React.FC<CostLineChartProps> = ({ data }) => {
  const processData = () => {
    const monthlyTotals = data.reduce((acc, item) => {
      if (!acc[item.month]) {
        acc[item.month] = 0;
      }
      acc[item.month] += item.cost;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month,
        cost: Number(total.toFixed(2))
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const chartData = processData();

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
          />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip 
            formatter={[formatCurrency, 'Cost']}
            labelFormatter={(month) => `Month: ${formatMonth(month as string)}`}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="cost" 
            stroke="#f97316" 
            strokeWidth={3}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
            name="Total Cost (USD)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostLineChart;
