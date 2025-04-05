
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getReportsByHour, CrimeReport } from '@/utils/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TimeOfDayChartProps {
  reports: CrimeReport[];
  className?: string;
}

const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({ reports, className }) => {
  // State for filters
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');

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

    return true;
  });

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
        <div className="flex flex-wrap gap-2 mt-2">
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
          
          {/* Reset button */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedIncidentTypes([]);
              setSelectedSeverity('');
            }}
          >
            Reset Filters
          </Button>
        </div>
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
