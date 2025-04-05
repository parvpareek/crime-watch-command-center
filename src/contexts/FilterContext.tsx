
import React, { createContext, useContext, useState, ReactNode } from 'react';

type FilterContextType = {
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  selectedIncidentTypes: string[];
  setSelectedIncidentTypes: (types: string[]) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  applyFilters: boolean;
  setApplyFilters: (apply: boolean) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [applyFilters, setApplyFilters] = useState<boolean>(false);

  return (
    <FilterContext.Provider value={{
      dateRange,
      setDateRange,
      selectedIncidentTypes,
      setSelectedIncidentTypes,
      selectedStatuses,
      setSelectedStatuses,
      applyFilters,
      setApplyFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
