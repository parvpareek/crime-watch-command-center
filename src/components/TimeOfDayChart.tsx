import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CrimeReport } from '@/utils/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TimeOfDayChartProps {
  reports: CrimeReport[];
  className?: string;
}

const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({ reports, className }) => {
  // State for filters
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all_severities");
  const [selectedStatus, setSelectedStatus] = useState<string>("all_statuses");
  const [selectedReportType, setSelectedReportType] = useState<string>("all_report_types");
  const [chartData, setChartData] = useState<{ hour: number; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Get unique values for filters
  const incidentTypes = Array.from(new Set(reports.map(report => report.incident_type)));
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = ['New', 'Under Investigation', 'Resolved', 'False Report'];
  const reportTypes = Array.from(new Set(reports.map(report => report.report_type)));

  // Calculate hour data based on filtered reports
  useEffect(() => {
    const calculateHourData = () => {
      console.log('[TimeOfDayChart] Filtering and calculating hour data');
      setLoading(true);
      try {
        // Filter reports based on selected filters
        const filteredReports = reports.filter(report => {
          // Filter by incident type
          if (selectedIncidentTypes.length > 0 && !selectedIncidentTypes.includes(report.incident_type)) {
            return false;
          }

          // Filter by severity
          if (selectedSeverity !== "all_severities" && report.severity !== selectedSeverity) {
            return false;
          }

          // Filter by status
          if (selectedStatus !== "all_statuses" && report.status !== selectedStatus) {
            return false;
          }

          // Filter by report type
          if (selectedReportType !== "all_report_types" && report.report_type !== selectedReportType) {
            return false;
          }

          return true;
        });
        
        console.log(`[TimeOfDayChart] Using ${filteredReports.length} filtered reports for visualization`);
        
        // Calculate hour distribution
        const hourCounts = new Map<number, number>();
        
        // Initialize all hours with 0 count
        for (let i = 0; i < 24; i++) {
          hourCounts.set(i, 0);
        }
        
        // Count reports by hour
        filteredReports.forEach(report => {
          if (report.time) {
            const hour = parseInt(report.time.split(':')[0], 10);
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
              hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            }
          }
        });
        
        // Convert to chart data format
        const data = Array.from(hourCounts.entries()).map(([hour, count]) => ({
          hour,
          count
        })).sort((a, b) => a.hour - b.hour);
        
        console.log('[TimeOfDayChart] Calculated hour data:', data);
        setChartData(data);
      } catch (error) {
        console.error("[TimeOfDayChart] Error calculating hour data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
        console.log('[TimeOfDayChart] Updated chart data state. Loading set to false');
      }
    };

    calculateHourData();
  }, [reports, selectedIncidentTypes, selectedSeverity, selectedStatus, selectedReportType]);

  // Format hours to be more readable
  const formattedData = Array.isArray(chartData) ? chartData.map(item => ({
    ...item,
    formattedHour: `${item.hour % 12 || 12}${item.hour < 12 ? 'am' : 'pm'}`
  })) : [];

  console.log('[TimeOfDayChart] Final formattedData for chart:', formattedData);

  // Reset all filters
  const resetFilters = () => {
    setSelectedIncidentTypes([]);
    setSelectedSeverity('all_severities');
    setSelectedStatus('all_statuses');
    setSelectedReportType('all_report_types');
  };

  // Display active filters as badges
  const renderActiveFilters = () => {
    const filters = [];

    if (selectedIncidentTypes.length > 0) {
      selectedIncidentTypes.forEach(type => {
        filters.push(
          <Badge key={`type-${type}`} variant="secondary" className="flex items-center gap-1">
            {type}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => setSelectedIncidentTypes(prev => prev.filter(t => t !== type))}
            />
          </Badge>
        );
      });
    }

    if (selectedSeverity !== 'all_severities') {
      filters.push(
        <Badge key="severity" variant="secondary" className="flex items-center gap-1">
          {selectedSeverity}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setSelectedSeverity('all_severities')}
          />
        </Badge>
      );
    }

    if (selectedStatus !== 'all_statuses') {
      filters.push(
        <Badge key="status" variant="secondary" className="flex items-center gap-1">
          {selectedStatus}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setSelectedStatus('all_statuses')}
          />
        </Badge>
      );
    }

    if (selectedReportType !== 'all_report_types') {
      filters.push(
        <Badge key="reportType" variant="secondary" className="flex items-center gap-1">
          {selectedReportType}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setSelectedReportType('all_report_types')}
          />
        </Badge>
      );
    }

    return filters.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="text-xs text-muted-foreground">Active filters:</span>
        {filters}
      </div>
    ) : null;
  };

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

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All Statuses</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_report_types">All Report Types</SelectItem>
              {reportTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Reset button */}
          <Button 
            variant="outline" 
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>

        {/* Display active filters */}
        {renderActiveFilters()}
      </CardHeader>
      <CardContent className="h-[calc(100%-10rem)] min-h-[250px]">
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
