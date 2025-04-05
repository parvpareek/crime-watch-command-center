
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
        <CardTitle>Incidents by Time of Day</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
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
              dataKey="formattedHour" 
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
            <Bar dataKey="count" fill="#EC4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TimeOfDayChart;
