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
    
    // Validate headers - only require the original required headers
    const requiredHeaders = ['month', 'department', 'project', 'service', 'cost'];
    const hasAllHeaders = requiredHeaders.every(header => 
      headers.some(h => h.includes(header.toLowerCase()))
    );
    
    if (!hasAllHeaders) {
      throw new Error(`CSV must contain these columns: ${requiredHeaders.join(', ')}`);
    }
    
    const data: CostData[] = [];
    
    // Find column indices for all possible fields
    const monthIndex = headers.findIndex(h => h.includes('month'));
    const deptIndex = headers.findIndex(h => h.includes('department'));
    const projectIndex = headers.findIndex(h => h.includes('project') && !h.includes('name'));
    const serviceIndex = headers.findIndex(h => h.includes('service') || h.includes('category'));
    const costIndex = headers.findIndex(h => h.includes('cost') || h.includes('total'));
    
    // New field indices
    const nameIndex = headers.findIndex(h => h.includes('name') && h.includes('tag'));
    const categoryIndex = headers.findIndex(h => h.includes('category') && !h.includes('service'));
    const projectNameIndex = headers.findIndex(h => h.includes('project') && h.includes('name'));
    const ownerIndex = headers.findIndex(h => h.includes('owner'));
    const awsAccountIndex = headers.findIndex(h => h.includes('aws') && h.includes('account'));
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;
      
      const cost = parseFloat(values[costIndex].replace(/[^\d.-]/g, ''));
      
      if (!isNaN(cost)) {
        const item: CostData = {
          month: values[monthIndex],
          department: values[deptIndex],
          project: values[projectIndex],
          service: values[serviceIndex],
          cost: cost
        };
        
        // Add new fields if they exist
        if (nameIndex !== -1 && values[nameIndex]) item.name = values[nameIndex];
        if (categoryIndex !== -1 && values[categoryIndex]) item.category = values[categoryIndex];
        if (projectNameIndex !== -1 && values[projectNameIndex]) item.projectName = values[projectNameIndex];
        if (ownerIndex !== -1 && values[ownerIndex]) item.owner = values[ownerIndex];
        if (awsAccountIndex !== -1 && values[awsAccountIndex]) item.awsAccount = values[awsAccountIndex];
        
        data.push(item);
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
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-2"
        size="sm"
      >
        <Upload className="w-4 h-4" />
        Upload CSV
      </Button>
    </>
  );
};

export default CsvUploader;
