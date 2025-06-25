
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CostData } from '@/data/sampleData';

interface CsvUploaderProps {
  onDataUpload: (data: CostData[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onDataUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): CostData[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate headers
    const requiredHeaders = ['month', 'department', 'project', 'service', 'cost'];
    const hasAllHeaders = requiredHeaders.every(header => 
      headers.some(h => h.includes(header.toLowerCase()))
    );
    
    if (!hasAllHeaders) {
      throw new Error(`CSV must contain these columns: ${requiredHeaders.join(', ')}`);
    }
    
    const data: CostData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;
      
      const monthIndex = headers.findIndex(h => h.includes('month'));
      const deptIndex = headers.findIndex(h => h.includes('department'));
      const projectIndex = headers.findIndex(h => h.includes('project'));
      const serviceIndex = headers.findIndex(h => h.includes('service'));
      const costIndex = headers.findIndex(h => h.includes('cost'));
      
      const cost = parseFloat(values[costIndex].replace(/[^\d.-]/g, ''));
      
      if (!isNaN(cost)) {
        data.push({
          month: values[monthIndex],
          department: values[deptIndex],
          project: values[projectIndex],
          service: values[serviceIndex],
          cost: cost
        });
      }
    }
    
    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);
        
        if (parsedData.length === 0) {
          throw new Error('No valid data found in CSV');
        }
        
        onDataUpload(parsedData);
        
        toast({
          title: "CSV uploaded successfully",
          description: `Loaded ${parsedData.length} cost records`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "Failed to read the file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
      <Button 
        onClick={triggerFileUpload}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload CSV
      </Button>
    </>
  );
};

export default CsvUploader;
