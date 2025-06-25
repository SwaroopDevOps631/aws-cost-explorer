import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { BarChart, PieChart, LineChart, Download, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { useFilteredData, useUniqueValues } from '@/hooks/useFilteredData';
import CostBarChart from '@/components/CostBarChart';
import CostPieChart from '@/components/CostPieChart';
import CostLineChart from '@/components/CostLineChart';
import CsvUploader from '@/components/CsvUploader';
import ExportButtons from '@/components/ExportButtons';
import ChartExportButtons from '@/components/ChartExportButtons';
import SampleDataDownload from '@/components/SampleDataDownload';
import { sampleData, CostData } from '@/data/sampleData';

const Index = () => {
  const { toast } = useToast();
  const [data, setData] = useState<CostData[]>(sampleData);
  const [groupBy, setGroupBy] = useState<string>('department');
  
  // Chart refs for export
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  
  // Multi-select filter states
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<string[]>([]);

  // Get unique values using optimized hook
  const { departments, projects, services, months } = useUniqueValues(data);

  // Filter data using optimized hook
  const filteredData = useFilteredData(data, {
    departments: selectedDepartments,
    projects: selectedProjects,
    services: selectedServices,
    timeRanges: selectedTimeRanges
  });

  // Convert arrays to options for MultiSelect
  const departmentOptions: Option[] = departments.map(dept => ({ label: dept, value: dept }));
  const projectOptions: Option[] = projects.map(project => ({ label: project, value: project }));
  const serviceOptions: Option[] = services.map(service => ({ label: service, value: service }));
  const timeRangeOptions: Option[] = months.map(month => ({ label: month, value: month }));

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalCost = filteredData.reduce((sum, item) => sum + item.cost, 0);
    const uniqueDepartments = new Set(filteredData.map(item => item.department)).size;
    const uniqueProjects = new Set(filteredData.map(item => item.project)).size;
    const uniqueServices = new Set(filteredData.map(item => item.service)).size;
    
    return { totalCost, uniqueDepartments, uniqueProjects, uniqueServices };
  }, [filteredData]);

  const handleDataUpload = (newData: CostData[]) => {
    setData(newData);
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${newData.length} cost records`,
    });
  };

  const resetFilters = () => {
    setSelectedDepartments([]);
    setSelectedProjects([]);
    setSelectedServices([]);
    setSelectedTimeRanges([]);
  };

  const hasActiveFilters = selectedDepartments.length > 0 || 
                          selectedProjects.length > 0 || 
                          selectedServices.length > 0 || 
                          selectedTimeRanges.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Excelra branding */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/excelra-logo.png" 
                alt="Excelra" 
                className="h-12 w-auto"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-3xl font-bold text-white">AWS Cost Explorer</h1>
                <p className="text-blue-200 mt-1">Powered by Excelra Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-600 text-white border-blue-500">
                {filteredData.length} records
              </Badge>
              {hasActiveFilters && (
                <Badge variant="outline" className="border-blue-300 text-blue-200">
                  Filtered
                </Badge>
              )}
              <div className="flex gap-2">
                <SampleDataDownload />
                <CsvUploader onDataUpload={handleDataUpload} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Summary Cards with Excelra theme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                ${summaryMetrics.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-indigo-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700">{summaryMetrics.uniqueDepartments}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-cyan-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-700">{summaryMetrics.uniqueProjects}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-slate-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-700">{summaryMetrics.uniqueServices}</div>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Select Filters */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Multi-Select Filters & Grouping
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters} disabled={!hasActiveFilters}>
                  Reset Filters
                </Button>
                <ExportButtons 
                  data={filteredData} 
                  filters={{
                    department: selectedDepartments.join(', '),
                    project: selectedProjects.join(', '),
                    service: selectedServices.join(', '),
                    timeRange: selectedTimeRanges.join(', ')
                  }} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Departments ({selectedDepartments.length})</Label>
                <MultiSelect
                  options={departmentOptions}
                  selected={selectedDepartments}
                  onChange={setSelectedDepartments}
                  placeholder="Select departments..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Projects ({selectedProjects.length})</Label>
                <MultiSelect
                  options={projectOptions}
                  selected={selectedProjects}
                  onChange={setSelectedProjects}
                  placeholder="Select projects..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Services ({selectedServices.length})</Label>
                <MultiSelect
                  options={serviceOptions}
                  selected={selectedServices}
                  onChange={setSelectedServices}
                  placeholder="Select services..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Time Ranges ({selectedTimeRanges.length})</Label>
                <MultiSelect
                  options={timeRangeOptions}
                  selected={selectedTimeRanges}
                  onChange={setSelectedTimeRanges}
                  placeholder="Select months..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Group By</Label>
                <select 
                  value={groupBy} 
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="department">Department</option>
                  <option value="project">Project</option>
                  <option value="service">Service</option>
                  <option value="month">Month</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                  {selectedDepartments.map(dept => (
                    <Badge key={`dept-${dept}`} variant="secondary" className="bg-blue-100 text-blue-800">
                      Dept: {dept}
                    </Badge>
                  ))}
                  {selectedProjects.map(project => (
                    <Badge key={`proj-${project}`} variant="secondary" className="bg-indigo-100 text-indigo-800">
                      Project: {project}
                    </Badge>
                  ))}
                  {selectedServices.map(service => (
                    <Badge key={`svc-${service}`} variant="secondary" className="bg-cyan-100 text-cyan-800">
                      Service: {service}
                    </Badge>
                  ))}
                  {selectedTimeRanges.map(time => (
                    <Badge key={`time-${time}`} variant="secondary" className="bg-slate-100 text-slate-800">
                      Time: {time}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts with export functionality */}
        <Tabs defaultValue="bar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-blue-50">
            <TabsTrigger value="bar" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart className="w-4 h-4" />
              Bar Chart
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <PieChart className="w-4 h-4" />
              Pie Chart
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <LineChart className="w-4 h-4" />
              Line Chart
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cost Analysis by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</CardTitle>
                    <p className="text-sm text-gray-600">Showing {filteredData.length} records</p>
                  </div>
                  <ChartExportButtons 
                    chartRef={barChartRef}
                    chartTitle={`Cost Analysis by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`}
                    chartType="bar"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div ref={barChartRef}>
                  <CostBarChart data={filteredData} groupBy={groupBy} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pie">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cost Distribution by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</CardTitle>
                    <p className="text-sm text-gray-600">Showing {filteredData.length} records</p>
                  </div>
                  <ChartExportButtons 
                    chartRef={pieChartRef}
                    chartTitle={`Cost Distribution by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`}
                    chartType="pie"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div ref={pieChartRef}>
                  <CostPieChart data={filteredData} groupBy={groupBy} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="line">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cost Trends Over Time</CardTitle>
                    <p className="text-sm text-gray-600">Showing {filteredData.length} records</p>
                  </div>
                  <ChartExportButtons 
                    chartRef={lineChartRef}
                    chartTitle="Cost Trends Over Time"
                    chartType="line"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div ref={lineChartRef}>
                  <CostLineChart data={filteredData} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
