import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CrimeReport } from '@/utils/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CrimeTrendChartProps {
  reports: CrimeReport[];
  className?: string;
}

const TIME_FRAMES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const CrimeTrendChart: React.FC<CrimeTrendChartProps> = ({ reports, className }) => {
  const [timeFrame, setTimeFrame] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIncidentType, setSelectedIncidentType] = useState('all_types');
  const [selectedSeverity, setSelectedSeverity] = useState('all_severities');
  const [selectedStatus, setSelectedStatus] = useState('all_statuses');
  const [chartData, setChartData] = useState<any[]>([]);

  // Get unique values for filters
  const incidentTypes = Array.from(new Set(reports.map(report => report.incident_type)));
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = ['New', 'Under Investigation', 'Resolved', 'False Report'];

  // Helper function to check if any filter is active
  const hasActiveFilters = () => {
    return selectedIncidentType !== 'all_types' || 
           selectedSeverity !== 'all_severities' || 
           selectedStatus !== 'all_statuses' ||
           startDate !== '' || 
           endDate !== '';
  };

  // Helper function to get date key based on time frame
  const getDateKeyByTimeFrame = (date: Date) => {
    switch (timeFrame) {
      case 'daily':
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'weekly':
        const startOfWeek = new Date(date);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        startOfWeek.setDate(diff);
        return startOfWeek.toISOString().split('T')[0]; // Start of week YYYY-MM-DD
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  };

  // Filter logic
  const filterReport = (report: CrimeReport) => {
    // Filter by incident type
    if (selectedIncidentType !== 'all_types' && report.incident_type !== selectedIncidentType) {
      return false;
    }

    // Filter by severity
    if (selectedSeverity !== 'all_severities' && report.severity !== selectedSeverity) {
      return false;
    }

    // Filter by status
    if (selectedStatus !== 'all_statuses' && report.status !== selectedStatus) {
      return false;
    }

    // Filter by date range
    if (startDate && new Date(report.date) < new Date(startDate)) {
      return false;
    }

    if (endDate && new Date(report.date) > new Date(endDate)) {
      return false;
    }

    return true;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedIncidentType('all_types');
    setSelectedSeverity('all_severities');
    setSelectedStatus('all_statuses');
    setStartDate('');
    setEndDate('');
  };

  // Display active filters as badges
  const renderActiveFilters = () => {
    const filters = [];

    if (selectedIncidentType !== 'all_types') {
      filters.push(
        <Badge key="type" variant="secondary" className="flex items-center gap-1">
          {selectedIncidentType}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setSelectedIncidentType('all_types')}
          />
        </Badge>
      );
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

    if (startDate) {
      filters.push(
        <Badge key="startDate" variant="secondary" className="flex items-center gap-1">
          From: {startDate}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setStartDate('')}
          />
        </Badge>
      );
    }

    if (endDate) {
      filters.push(
        <Badge key="endDate" variant="secondary" className="flex items-center gap-1">
          To: {endDate}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => setEndDate('')}
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

  // Calculate chart data based on filtered reports and timeframe
  useEffect(() => {
    const calculateTrendData = () => {
      console.log('[CrimeTrendChart] Filtering and calculating trend data');
      
      // Filter reports based on selected filters
      const filteredReports = reports.filter(filterReport);
      
      console.log(`[CrimeTrendChart] Using ${filteredReports.length} filtered reports for visualization`);
      
      // Create a map to store counts by date
      const countsByDate = new Map<string, number>();
      
      // Count reports by date key based on time frame
      filteredReports.forEach(report => {
        const date = new Date(report.date);
        const dateKey = getDateKeyByTimeFrame(date);
        countsByDate.set(dateKey, (countsByDate.get(dateKey) || 0) + 1);
      });
      
      // Convert to chart data format and sort by date
      const data = Array.from(countsByDate.entries())
        .map(([date, count]) => ({
          date,
          count
        }))
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      
      console.log('[CrimeTrendChart] Calculated trend data:', data);
      setChartData(data);
    };

    calculateTrendData();
  }, [reports, timeFrame, startDate, endDate, selectedIncidentType, selectedSeverity, selectedStatus]);

  // Format the date for display on the chart
  const formatXAxis = (dateKey: string) => {
    switch (timeFrame) {
      case 'daily':
        const [year, month, day] = dateKey.split('-').map(Number);
        return `${month}/${day}`;
      case 'weekly':
        const weekDate = new Date(dateKey);
        return `W${Math.ceil((weekDate.getDate() + 
                 new Date(weekDate.getFullYear(), weekDate.getMonth(), 1).getDay()) / 7)}`;
      case 'monthly':
        const [y, m] = dateKey.split('-');
        return `${m}/${y.substring(2)}`;
      default:
        return dateKey;
    }
  };

  console.log('[CrimeTrendChart] Final data for chart:', chartData);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Crime Trend Over Time</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Time frame selector */}
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent>
              {TIME_FRAMES.map(frame => (
                <SelectItem key={frame.value} value={frame.value}>{frame.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Incident type filter */}
          <Select value={selectedIncidentType} onValueChange={setSelectedIncidentType}>
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

          {/* Severity filter */}
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

          {/* Status filter */}
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

          {/* Date range filters */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            />
          </div>
          
          {/* Reset button */}
          <Button 
            variant="outline" 
            onClick={resetFilters}
            disabled={!hasActiveFilters()}
          >
            Reset Filters
          </Button>
        </div>

        {/* Display active filters */}
        {renderActiveFilters()}
      </CardHeader>
      <CardContent className="h-[calc(100%-10rem)] min-h-[250px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div>No data available</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickMargin={8}
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
                labelFormatter={(label) => {
                  switch (timeFrame) {
                    case 'daily':
                      return `Date: ${label}`;
                    case 'weekly':
                      return `Week starting: ${label}`;
                    case 'monthly':
                      return `Month: ${label}`;
                    default:
                      return `Date: ${label}`;
                  }
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#3B82F6' }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CrimeTrendChart;
