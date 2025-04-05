
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getReportsByDate, CrimeReport } from '@/utils/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
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
  const formatDateDisplay = (date: string) => {
    const dateObj = new Date(date);
    
    switch(timeFrame) {
      case 'day':
        return format(dateObj, 'MMM d');
      case 'week':
        return `Week ${format(dateObj, 'w')}`;
      case 'month':
        return format(dateObj, 'MMM yyyy');
      default:
        return format(dateObj, 'MMM d');
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
        <CardTitle>Crime Trend Over Time</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
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
              <SelectItem value="">All Severities</SelectItem>
              {severityLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedIncidentTypes.length > 0 ? selectedIncidentTypes[0] : ""}
            onValueChange={(value) => {
              if (value === "") {
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
              <SelectItem value="">All Types</SelectItem>
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
                selected={dateRange}
                onSelect={setDateRange}
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
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 20,
            }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedDate" 
              scale="point" 
              padding={{ left: 10, right: 10 }}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                borderColor: '#374151',
                color: '#F9FAFB',
              }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CrimeTrendChart;
