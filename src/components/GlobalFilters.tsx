
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFilters } from '@/contexts/FilterContext';

interface GlobalFiltersProps {
  incidentTypes: string[];
  statuses: string[];
}

const GlobalFilters: React.FC<GlobalFiltersProps> = ({ incidentTypes, statuses }) => {
  const { 
    dateRange, 
    setDateRange, 
    selectedIncidentTypes, 
    setSelectedIncidentTypes,
    selectedStatuses,
    setSelectedStatuses,
    setApplyFilters
  } = useFilters();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isIncidentFilterOpen, setIsIncidentFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [startDate, endDate] = dateRange;

  const handleIncidentTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedIncidentTypes([...selectedIncidentTypes, type]);
    } else {
      setSelectedIncidentTypes(selectedIncidentTypes.filter(t => t !== type));
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    }
  };

  const handleApplyFilters = () => {
    setApplyFilters(true);
  };

  const handleResetFilters = () => {
    setDateRange([null, null]);
    setSelectedIncidentTypes([]);
    setSelectedStatuses([]);
    setApplyFilters(true);
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Dashboard Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-wrap gap-2">
          {/* Date Range Filter */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate && endDate ? (
                  <>
                    {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                  </>
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={startDate || new Date()}
                selected={{ from: startDate || undefined, to: endDate || undefined }}
                onSelect={(range) => {
                  const { from, to } = range || { from: null, to: null };
                  setDateRange([from, to]);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Incident Type Filter */}
          <Popover open={isIncidentFilterOpen} onOpenChange={setIsIncidentFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                {selectedIncidentTypes.length > 0 ? (
                  <span>
                    {selectedIncidentTypes.length} Incident Types
                  </span>
                ) : (
                  <span className="text-muted-foreground">Incident Types</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2" align="start">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {incidentTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedIncidentTypes.includes(type)}
                      onCheckedChange={(checked) => handleIncidentTypeChange(type, !!checked)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Popover open={isStatusFilterOpen} onOpenChange={setIsStatusFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                {selectedStatuses.length > 0 ? (
                  <span>{selectedStatuses.length} Statuses</span>
                ) : (
                  <span className="text-muted-foreground">Status</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2" align="start">
              <div className="space-y-2">
                {statuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => handleStatusChange(status, !!checked)}
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Apply and Reset buttons */}
          <Button onClick={handleApplyFilters} className="ml-auto">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleResetFilters}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalFilters;
