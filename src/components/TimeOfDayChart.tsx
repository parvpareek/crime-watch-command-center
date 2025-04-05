import React, { useState, useEffect } from 'react';
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
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all_severities");
  const [chartData, setChartData] = useState<{ hour: number; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Get unique incident types
  const incidentTypes = Array.from(new Set(reports.map(report => report.incident_type)));
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  // Fetch hour data on component mount
  useEffect(() => {
    const fetchData = async () => {
      console.log('[TimeOfDayChart] Starting to fetch hour data');
      setLoading(true);
      try {
        console.log('[TimeOfDayChart] Calling getReportsByHour');
        const filteredReports = reports.filter(report => {
          // Filter by incident type
          if (selectedIncidentTypes.length > 0 && !selectedIncidentTypes.includes(report.incident_type)) {
            return false;
          }

          // Filter by severity
          if (selectedSeverity !== "all_severities" && report.severity !== selectedSeverity) {
            return false;
          }

          return true;
        });
        const data = await getReportsByHour();
        console.log('[TimeOfDayChart] Data received from getReportsByHour:', data);
        setChartData(data);
      } catch (error) {
        console.error("[TimeOfDayChart] Error fetching hour data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
        console.log('[TimeOfDayChart] Updated chart data state. Loading set to false');
      }
    };

    fetchData();
  }, [reports, selectedIncidentTypes, selectedSeverity]);

  // Format hours to be more readable
  const formattedData = Array.isArray(chartData) ? chartData.map(item => ({
    ...item,
    formattedHour: `${item.hour % 12 || 12}${item.hour < 12 ? 'am' : 'pm'}`
  })) : [];

  console.log('[TimeOfDayChart] Final formattedData for chart:', formattedData);

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
              setSelectedSeverity('all_severities');
            }}
          >
            Reset Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-7rem)] min-h-[250px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div>Loading chart data...</div>
          </div>
        ) : formattedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div>No data available</div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default TimeOfDayChart;
