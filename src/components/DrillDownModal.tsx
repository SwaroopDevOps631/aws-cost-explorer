
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CostData } from '@/data/sampleData';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: {
    name: string;
    value: number;
    data: CostData[];
  } | null;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, selectedData }) => {
  if (!selectedData) return null;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Group by service for detailed breakdown
  const serviceBreakdown = selectedData.data.reduce((acc, item) => {
    if (!acc[item.service]) {
      acc[item.service] = { cost: 0, count: 0 };
    }
    acc[item.service].cost += item.cost;
    acc[item.service].count += 1;
    return acc;
  }, {} as Record<string, { cost: number; count: number }>);

  // Group by month for trend analysis
  const monthlyBreakdown = selectedData.data.reduce((acc, item) => {
    if (!acc[item.month]) {
      acc[item.month] = 0;
    }
    acc[item.month] += item.cost;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Drill-Down Details: {selectedData.name}
            <Badge variant="outline">{formatCurrency(selectedData.value)}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Service-wise Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(serviceBreakdown)
                .sort(([,a], [,b]) => b.cost - a.cost)
                .map(([service, data]) => (
                  <div key={service} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{service}</div>
                      <div className="text-sm text-gray-500">{data.count} instances</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(data.cost)}</div>
                      <div className="text-sm text-gray-500">
                        {((data.cost / selectedData.value) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Monthly Details</h3>
            <div className="space-y-2">
              {Object.entries(monthlyBreakdown)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, cost]) => (
                  <div key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">{month}</div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(cost)}</div>
                      <div className="text-sm text-gray-500">
                        {((cost / selectedData.value) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Records</div>
              <div className="text-xl font-bold">{selectedData.data.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Unique Services</div>
              <div className="text-xl font-bold">{Object.keys(serviceBreakdown).length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Months Covered</div>
              <div className="text-xl font-bold">{Object.keys(monthlyBreakdown).length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Monthly Cost</div>
              <div className="text-xl font-bold">
                {formatCurrency(selectedData.value / Object.keys(monthlyBreakdown).length)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownModal;
