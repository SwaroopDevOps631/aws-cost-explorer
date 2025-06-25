
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface ChartExportButtonsProps {
  chartRef: React.RefObject<HTMLDivElement>;
  chartTitle: string;
  chartType: 'bar' | 'pie' | 'line';
}

const ChartExportButtons: React.FC<ChartExportButtonsProps> = ({ 
  chartRef, 
  chartTitle, 
  chartType 
}) => {
  const { toast } = useToast();

  const exportToPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}-${chartType}-chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: "PNG exported successfully",
        description: `Chart saved as ${link.download}`,
      });
    } catch (error) {
      toast({
        title: "PNG export failed",
        description: "Failed to export chart as PNG",
        variant: "destructive",
      });
    }
  };

  const exportChartToPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const timestamp = new Date().toISOString().split('T')[0];
      
      const htmlContent = `
        <html>
          <head>
            <title>${chartTitle} - Cost Analysis Report</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                margin: 0; 
                padding: 20px;
                background: #f8fafc;
              }
              .header { 
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white; 
                padding: 30px; 
                border-radius: 12px;
                margin-bottom: 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              .logo { 
                height: 50px; 
                width: auto;
              }
              .title-section h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700;
                color: #ffffff;
              }
              .title-section p { 
                margin: 5px 0 0 0; 
                font-size: 16px; 
                opacity: 0.9;
              }
              .chart-container { 
                background: white; 
                padding: 30px; 
                border-radius: 12px; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                text-align: center;
              }
              .chart-title { 
                font-size: 24px; 
                font-weight: 600; 
                margin-bottom: 20px;
                color: #1e40af;
              }
              .chart-image { 
                max-width: 100%; 
                height: auto; 
                border-radius: 8px;
              }
              .footer { 
                text-align: center; 
                margin-top: 30px; 
                color: #64748b; 
                font-size: 14px;
              }
              .excelra-branding {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title-section">
                <h1>AWS Cost Analysis Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()} | ${chartTitle}</p>
              </div>
              <img src="/excelra-logo.png" alt="Excelra" class="logo" onerror="this.style.display='none'" />
            </div>
            
            <div class="chart-container">
              <div class="chart-title">${chartTitle}</div>
              <img src="${imgData}" alt="${chartTitle}" class="chart-image" />
            </div>
            
            <div class="footer">
              <p>Powered by <span class="excelra-branding">Excelra</span> Cost Analytics Platform</p>
              <p>Report generated automatically from AWS cost data</p>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
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
      <Button variant="outline" size="sm" onClick={exportToPNG}>
        <FileImage className="w-4 h-4 mr-2" />
        PNG
      </Button>
      <Button variant="outline" size="sm" onClick={exportChartToPDF}>
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </Button>
    </div>
  );
};

export default ChartExportButtons;
