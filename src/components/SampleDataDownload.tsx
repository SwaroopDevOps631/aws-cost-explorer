
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SampleDataDownload: React.FC = () => {
  const { toast } = useToast();

  const downloadSampleData = () => {
    const link = document.createElement('a');
    link.href = '/sample-aws-cost-data.csv';
    link.download = 'sample-aws-cost-data.csv';
    link.click();
    
    toast({
      title: "Sample data downloaded",
      description: "Use this template to upload your own cost data",
    });
  };

  return (
    <Button 
      onClick={downloadSampleData}
      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
      size="sm"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Sample Data
    </Button>
  );
};

export default SampleDataDownload;
