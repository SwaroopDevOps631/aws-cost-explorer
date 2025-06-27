
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CostData } from '@/data/sampleData';
import { generateGradientColor } from '@/utils/colorUtils';

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
  
  // Generate dynamic color for the line based on data
  const lineColor = generateGradientColor('total-cost-line');

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const customTooltipFormatter = (value: any, name: any) => {
    return [formatCurrency(value), 'Cost'];
  };

  const customLabelFormatter = (month: any) => {
    return `Month: ${formatMonth(month as string)}`;
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
            stroke="#64748b"
          />
          <YAxis tickFormatter={formatCurrency} stroke="#64748b" />
          <Tooltip 
            formatter={customTooltipFormatter}
            labelFormatter={customLabelFormatter}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="cost" 
            stroke={lineColor} 
            strokeWidth={3}
            dot={{ fill: lineColor, strokeWidth: 2, r: 6 }}
            name="Total Cost (USD)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostLineChart;
