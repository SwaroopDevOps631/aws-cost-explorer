
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CostData } from '@/data/sampleData';

interface ExportButtonsProps {
  data: CostData[];
  filters: {
    department: string;
    project: string;
    service: string;
    timeRange: string;
  };
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, filters }) => {
  const { toast } = useToast();

  const generateFileName = (extension: string) => {
    const department = filters.department === 'all' ? 'all-departments' : filters.department.toLowerCase().replace(/\s+/g, '-');
    const timeRange = filters.timeRange === 'all' ? 'all-periods' : filters.timeRange;
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `aws-cost-${department}-${timeRange}-${timestamp}.${extension}`;
  };

  const exportToCSV = () => {
    const headers = ['Month', 'Department', 'Project', 'Service', 'Cost (USD)'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.month,
        item.department,
        item.project,
        item.service,
        item.cost.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', generateFileName('csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV exported successfully",
      description: `Downloaded ${data.length} records`,
    });
  };

  const exportToPDF = async () => {
    try {
      // Create HTML content for PDF
      const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
      const departments = [...new Set(data.map(item => item.department))];
      const services = [...new Set(data.map(item => item.service))];
      
      const htmlContent = `
        <html>
          <head>
            <title>AWS Cost Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 20px; }
              .summary { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .summary-item { display: inline-block; margin: 10px 20px 10px 0; }
              .summary-label { font-weight: bold; color: #666; }
              .summary-value { font-size: 18px; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f97316; color: white; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .filters { background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>AWS Cost Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="filters">
              <h3>Applied Filters:</h3>
              <p><strong>Department:</strong> ${filters.department === 'all' ? 'All Departments' : filters.department}</p>
              <p><strong>Project:</strong> ${filters.project === 'all' ? 'All Projects' : filters.project}</p>
              <p><strong>Service:</strong> ${filters.service === 'all' ? 'All Services' : filters.service}</p>
              <p><strong>Time Range:</strong> ${filters.timeRange === 'all' ? 'All Periods' : filters.timeRange}</p>
            </div>
            
            <div class="summary">
              <div class="summary-item">
                <div class="summary-label">Total Cost</div>
                <div class="summary-value">$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Records</div>
                <div class="summary-value">${data.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Departments</div>
                <div class="summary-value">${departments.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Services</div>
                <div class="summary-value">${services.length}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Department</th>
                  <th>Project</th>
                  <th>Service</th>
                  <th>Cost (USD)</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr>
                    <td>${item.month}</td>
                    <td>${item.department}</td>
                    <td>${item.project}</td>
                    <td>${item.service}</td>
                    <td>$${item.cost.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Trigger print dialog
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);

        toast({
          title: "PDF export initiated",
          description: "Print dialog opened - save as PDF",
        });
      }
    } catch (error) {
      toast({
        title: "PDF export failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToCSV}
        className="border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToPDF}
        className="border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <FileText className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
