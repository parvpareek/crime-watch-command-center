
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getReportsByHour, CrimeReport } from '@/utils/data';
import { useFilters } from '@/contexts/FilterContext';

interface TimeOfDayChartProps {
  reports: CrimeReport[];
  className?: string;
}

const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({ reports, className }) => {
  const { 
    dateRange,
    selectedIncidentTypes,
    selectedStatuses,
    applyFilters,
    setApplyFilters
  } = useFilters();

  // Filter reports based on global filters
  const filteredReports = reports.filter(report => {
    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      const reportDate = new Date(report.date);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      
      // Set time to midnight for proper date comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (reportDate < startDate || reportDate > endDate) {
        return false;
      }
    }

    // Filter by incident type
    if (selectedIncidentTypes.length > 0 && !selectedIncidentTypes.includes(report.incident_type)) {
      return false;
    }

    // Filter by status
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(report.status)) {
      return false;
    }

    return true;
  });

  // Reset the apply filters flag after applying
  useEffect(() => {
    if (applyFilters) {
      setApplyFilters(false);
    }
  }, [applyFilters, setApplyFilters]);

  const chartData = getReportsByHour(filteredReports);

  // Format hours to be more readable
  const formattedData = chartData.map(item => ({
    ...item,
    formattedHour: `${item.hour % 12 || 12}${item.hour < 12 ? 'am' : 'pm'}`
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Incidents by Time of Day</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-7rem)] min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{
              top: 10,
              right: 20,
              left: 5,
              bottom: 20,
            }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis 
              dataKey="formattedHour" 
              scale="point" 
              padding={{ left: 10, right: 10 }}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickMargin={8}
              width={30}
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
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Bar 
              dataKey="count" 
              fill="#EC4899" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TimeOfDayChart;
