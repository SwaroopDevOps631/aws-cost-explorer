
import { useMemo } from 'react';
import { CostData } from '@/data/sampleData';

interface FilterState {
  departments: string[];
  projects: string[];
  services: string[];
  timeRanges: string[];
  // New filter fields
  names: string[];
  categories: string[];
  projectNames: string[];
  owners: string[];
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
      filters.timeRanges.length > 0 ||
      filters.names.length > 0 ||
      filters.categories.length > 0 ||
      filters.projectNames.length > 0 ||
      filters.owners.length > 0;
    
    if (!hasAnyFilters) return data;
    
    return data.filter(item => {
      const departmentMatch = filters.departments.length === 0 || filters.departments.includes(item.department);
      const projectMatch = filters.projects.length === 0 || filters.projects.includes(item.project);
      const serviceMatch = filters.services.length === 0 || filters.services.includes(item.service);
      const timeMatch = filters.timeRanges.length === 0 || filters.timeRanges.includes(item.month);
      
      // New filter matches
      const nameMatch = filters.names.length === 0 || (item.name && filters.names.includes(item.name));
      const categoryMatch = filters.categories.length === 0 || (item.category && filters.categories.includes(item.category));
      const projectNameMatch = filters.projectNames.length === 0 || (item.projectName && filters.projectNames.includes(item.projectName));
      const ownerMatch = filters.owners.length === 0 || (item.owner && filters.owners.includes(item.owner));
      
      return departmentMatch && projectMatch && serviceMatch && timeMatch && 
             nameMatch && categoryMatch && projectNameMatch && ownerMatch;
    });
  }, [data, filters.departments, filters.projects, filters.services, filters.timeRanges, 
      filters.names, filters.categories, filters.projectNames, filters.owners]);
};

export const useUniqueValues = (data: CostData[]) => {
  return useMemo(() => {
    console.log('Computing unique values from data:', data.length);
    
    const departments = [...new Set(data.map(item => item.department))].sort();
    const projects = [...new Set(data.map(item => item.project))].sort();
    const services = [...new Set(data.map(item => item.service))].sort();
    const months = [...new Set(data.map(item => item.month))].sort();
    
    // New unique values
    const names = [...new Set(data.map(item => item.name).filter(Boolean))].sort();
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))].sort();
    const projectNames = [...new Set(data.map(item => item.projectName).filter(Boolean))].sort();
    const owners = [...new Set(data.map(item => item.owner).filter(Boolean))].sort();
    
    return { departments, projects, services, months, names, categories, projectNames, owners };
  }, [data]);
};
