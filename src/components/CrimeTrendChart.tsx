
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getReportsByDate, CrimeReport } from '@/utils/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface CrimeTrendChartProps {
  reports: CrimeReport[];
  className?: string;
}

const CrimeTrendChart: React.FC<CrimeTrendChartProps> = ({ reports, className }) => {
  // State for filters
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Get unique incident types
  const incidentTypes = Array.from(new Set(reports.map(report => report.incident_type)));
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  // Filter reports based on selected filters
  const filteredReports = reports.filter(report => {
    // Filter by incident type
    if (selectedIncidentTypes.length > 0 && !selectedIncidentTypes.includes(report.incident_type)) {
      return false;
    }

    // Filter by severity
    if (selectedSeverity && report.incident_severity !== selectedSeverity) {
      return false;
    }

    // Filter by date range
    if (dateRange.from) {
      const reportDate = new Date(report.date);
      if (reportDate < dateRange.from) {
        return false;
      }
    }
    
    if (dateRange.to) {
      const reportDate = new Date(report.date);
      if (reportDate > dateRange.to) {
        return false;
      }
    }

    return true;
  });

  // Process data based on the selected time frame
  const chartData = getReportsByDate(filteredReports, timeFrame);

  // Format the date display based on the selected time frame
  const formatDateDisplay = (dateStr: string) => {
    try {
      // Different handling based on timeFrame
      if (timeFrame === 'day') {
        // For daily view, the date is in 'YYYY-MM-DD' format
        return format(new Date(dateStr), 'MMM d');
      } else if (timeFrame === 'week') {
        // For weekly view, the date is in 'YYYY-Wxx' format (year-week)
        // Parse the year and week number
        const [year, weekPart] = dateStr.split('-');
        const weekNumber = parseInt(weekPart.substring(1), 10);
        return `Week ${weekNumber}`;
      } else if (timeFrame === 'month') {
        // For monthly view, the date is in 'YYYY-MM' format
        // Parse the year and month
        const [year, month] = dateStr.split('-');
        // Create a date for the first day of the month
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, 'MMM yyyy');
      }
      
      // Fallback if format is unknown
      return dateStr;
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return "Invalid date";
    }
  };

  // Format dates to be more readable
  const formattedData = chartData.map(item => ({
    ...item,
    formattedDate: formatDateDisplay(item.date)
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Crime Trend Over Time</CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as 'day' | 'week' | 'month')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_severities">All Severities</SelectItem>
              {severityLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedIncidentTypes.length > 0 ? selectedIncidentTypes[0] : "all_types"}
            onValueChange={(value) => {
              if (value === "all_types") {
                setSelectedIncidentTypes([]);
              } else {
                setSelectedIncidentTypes([value]);
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Incident Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_types">All Types</SelectItem>
              {incidentTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to
                }}
                onSelect={(range) => {
                  if (range) {
                    setDateRange({
                      from: range.from,
                      to: range.to
                    });
                  } else {
                    setDateRange({
                      from: undefined,
                      to: undefined
                    });
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {/* Reset button */}
          <Button 
            variant="outline" 
            onClick={() => {
              setTimeFrame('day');
              setSelectedIncidentTypes([]);
              setSelectedSeverity('');
              setDateRange({ from: undefined, to: undefined });
            }}
          >
            Reset Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-8rem)] min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis 
              dataKey="formattedDate" 
              padding={{ left: 10, right: 10 }}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickMargin={10}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                borderColor: '#374151',
                color: '#F9FAFB',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              formatter={(value) => [`${value} incidents`, 'Count']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.4}
              strokeWidth={2}
              activeDot={{ r: 6 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CrimeTrendChart;
