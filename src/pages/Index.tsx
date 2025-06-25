
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, PieChart, LineChart, Download, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CostBarChart from '@/components/CostBarChart';
import CostPieChart from '@/components/CostPieChart';
import CostLineChart from '@/components/CostLineChart';
import CsvUploader from '@/components/CsvUploader';
import ExportButtons from '@/components/ExportButtons';
import { sampleData, CostData } from '@/data/sampleData';

const Index = () => {
  const { toast } = useToast();
  const [data, setData] = useState<CostData[]>(sampleData);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<string>('department');

  // Extract unique values for filters
  const departments = useMemo(() => [...new Set(data.map(item => item.department))], [data]);
  const projects = useMemo(() => [...new Set(data.map(item => item.project))], [data]);
  const services = useMemo(() => [...new Set(data.map(item => item.service))], [data]);
  const months = useMemo(() => [...new Set(data.map(item => item.month))].sort(), [data]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const departmentMatch = selectedDepartment === 'all' || item.department === selectedDepartment;
      const projectMatch = selectedProject === 'all' || item.project === selectedProject;
      const serviceMatch = selectedService === 'all' || item.service === selectedService;
      const timeMatch = selectedTimeRange === 'all' || item.month === selectedTimeRange;
      
      return departmentMatch && projectMatch && serviceMatch && timeMatch;
    });
  }, [data, selectedDepartment, selectedProject, selectedService, selectedTimeRange]);

  // Calculate summary metrics
  const totalCost = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.cost, 0);
  }, [filteredData]);

  const uniqueDepartments = useMemo(() => {
    return new Set(filteredData.map(item => item.department)).size;
  }, [filteredData]);

  const uniqueProjects = useMemo(() => {
    return new Set(filteredData.map(item => item.project)).size;
  }, [filteredData]);

  const uniqueServices = useMemo(() => {
    return new Set(filteredData.map(item => item.service)).size;
  }, [filteredData]);

  const handleDataUpload = (newData: CostData[]) => {
    setData(newData);
    toast({
      title: "Data uploaded successfully",
      description: `Loaded ${newData.length} cost records`,
    });
  };

  const resetFilters = () => {
    setSelectedDepartment('all');
    setSelectedProject('all');
    setSelectedService('all');
    setSelectedTimeRange('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-400">AWS Cost Explorer</h1>
              <p className="text-slate-300 mt-1">Internal Cost Reporting Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-orange-500 text-white">
                {filteredData.length} records
              </Badge>
              <CsvUploader onDataUpload={handleDataUpload} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{uniqueDepartments}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{uniqueProjects}</div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{uniqueServices}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-orange-500" />
                Filters & Grouping
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <ExportButtons data={filteredData} filters={{
                  department: selectedDepartment,
                  project: selectedProject,
                  service: selectedService,
                  timeRange: selectedTimeRange
                }} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="project">Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger id="project">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="service">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger id="service">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="timerange">Time Range</Label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger id="timerange">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="groupby">Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger id="groupby">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <Tabs defaultValue="bar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Bar Chart
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Pie Chart
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Line Chart
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CostBarChart data={filteredData} groupBy={groupBy} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pie">
            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CostPieChart data={filteredData} groupBy={groupBy} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="line">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <CostLineChart data={filteredData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
