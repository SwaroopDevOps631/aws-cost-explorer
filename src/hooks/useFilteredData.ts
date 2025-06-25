
import { useMemo } from 'react';
import { CostData } from '@/data/sampleData';

interface FilterState {
  departments: string[];
  projects: string[];
  services: string[];
  timeRanges: string[];
}

export const useFilteredData = (data: CostData[], filters: FilterState) => {
  return useMemo(() => {
    console.log('Filtering data with filters:', filters);
    
    // Early return if no data
    if (!data.length) return [];
    
    // If all filters are empty, return all data
    const hasAnyFilters = 
      filters.departments.length > 0 ||
      filters.projects.length > 0 ||
      filters.services.length > 0 ||
      filters.timeRanges.length > 0;
    
    if (!hasAnyFilters) return data;
    
    return data.filter(item => {
      const departmentMatch = filters.departments.length === 0 || filters.departments.includes(item.department);
      const projectMatch = filters.projects.length === 0 || filters.projects.includes(item.project);
      const serviceMatch = filters.services.length === 0 || filters.services.includes(item.service);
      const timeMatch = filters.timeRanges.length === 0 || filters.timeRanges.includes(item.month);
      
      return departmentMatch && projectMatch && serviceMatch && timeMatch;
    });
  }, [data, filters.departments, filters.projects, filters.services, filters.timeRanges]);
};

export const useUniqueValues = (data: CostData[]) => {
  return useMemo(() => {
    console.log('Computing unique values from data:', data.length);
    
    const departments = [...new Set(data.map(item => item.department))].sort();
    const projects = [...new Set(data.map(item => item.project))].sort();
    const services = [...new Set(data.map(item => item.service))].sort();
    const months = [...new Set(data.map(item => item.month))].sort();
    
    return { departments, projects, services, months };
  }, [data]);
};
