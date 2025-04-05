
import React, { useEffect, useState } from 'react';
import CrimeMap from '@/components/CrimeMap';
import KpiCard from '@/components/KpiCard';
import CrimeTrendChart from '@/components/CrimeTrendChart';
import IncidentTypeChart from '@/components/IncidentTypeChart';
import TimeOfDayChart from '@/components/TimeOfDayChart';
import ReportsTable from '@/components/ReportsTable';
import ReportDetail from '@/components/ReportDetail';
import StatusKpiCards from '@/components/StatusKpiCards';
import GlobalFilters from '@/components/GlobalFilters';
import { FilterProvider, useFilters } from '@/contexts/FilterContext';
import { 
  CrimeReport, 
  fetchCrimeReports, 
  getTodayReports, 
  getLastWeekReports, 
  getLastMonthReports,
  getMostFrequentIncidentType,
  getReportsByStatus
} from '@/utils/data';
import { BarChart2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const DashboardContent: React.FC = () => {
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { 
    dateRange, 
    selectedIncidentTypes, 
    selectedStatuses, 
    applyFilters 
  } = useFilters();

  // Unique incident types and statuses for filters
  const incidentTypes = Array.from(new Set(reports.map(report => report.incident_type)));
  const statuses = ["New", "Under Investigation", "Resolved", "False Report"];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCrimeReports();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error('Error loading crime reports:', error);
        toast.error('Failed to load crime report data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply global filters
  useEffect(() => {
    if (!applyFilters) return;

    const newFilteredReports = reports.filter(report => {
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

    setFilteredReports(newFilteredReports);
  }, [applyFilters, reports, dateRange, selectedIncidentTypes, selectedStatuses]);

  const handleReportSelect = (report: CrimeReport) => {
    setSelectedReport(report);
    setDrawerOpen(true);
  };

  const handleStatusUpdate = (report: CrimeReport, newStatus: string) => {
    // Update the report in the local state
    const updatedReports = reports.map(r => 
      r.id === report.id ? { ...r, status: newStatus } : r
    );
    setReports(updatedReports);
    setFilteredReports(updatedReports.filter(r => filteredReports.some(fr => fr.id === r.id)));
    
    // If the report is selected, update it
    if (selectedReport && selectedReport.id === report.id) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  };

  // Calculate KPI values
  const todayCount = getTodayReports(filteredReports).length;
  const lastWeekCount = getLastWeekReports(filteredReports).length;
  const lastMonthCount = getLastMonthReports(filteredReports).length;
  const mostFrequentType = getMostFrequentIncidentType(filteredReports);
  
  // Calculate percentage change for week vs previous week
  const weeklyChange = lastWeekCount > 0 
    ? ((lastWeekCount - (lastMonthCount - lastWeekCount) / 3) / ((lastMonthCount - lastWeekCount) / 3) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="flex items-center p-4 border-b bg-background">
        <h1 className="text-xl font-semibold">Crime Watch Command Center</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* Placeholder for user menu, notifications, etc. */}
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse-soft">Loading dashboard data...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global Filters */}
            <GlobalFilters incidentTypes={incidentTypes} statuses={statuses} />
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard 
                title="Today's Reports" 
                value={todayCount}
                icon={<Clock className="h-4 w-4" />} 
              />
              <KpiCard 
                title="Last 7 Days" 
                value={lastWeekCount} 
                changeType={parseFloat(weeklyChange) > 0 ? 'increase' : parseFloat(weeklyChange) < 0 ? 'decrease' : 'neutral'}
                changeValue={`${Math.abs(parseFloat(weeklyChange))}%`}
                description="vs previous week"
                icon={<BarChart2 className="h-4 w-4" />} 
              />
            </div>

            {/* Status KPI Cards */}
            <StatusKpiCards reports={filteredReports} />

            {/* Temporal Visualization - Now Larger and Centered */}
            <div className="w-full h-[500px]">
              <CrimeTrendChart reports={filteredReports} className="h-full" />
            </div>

            {/* Map Section */}
            <div className="w-full h-[500px]">
              <CrimeMap 
                reports={filteredReports} 
                onReportSelect={handleReportSelect} 
              />
            </div>
            
            {/* Charts Section - Two column grid for smaller visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TimeOfDayChart reports={filteredReports} className="h-[400px]" />
              <IncidentTypeChart reports={filteredReports} className="h-[400px]" />
            </div>

            {/* Reports Table - Full width */}
            <div className="w-full">
              <ReportsTable 
                reports={filteredReports} 
                onReportSelect={handleReportSelect} 
              />
            </div>
          </div>
        )}
      </main>
      
      {/* Report Detail Drawer */}
      <ReportDetail 
        report={selectedReport} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

// Wrap the dashboard with the FilterProvider
const Dashboard: React.FC = () => {
  return (
    <FilterProvider>
      <DashboardContent />
    </FilterProvider>
  );
};

export default Dashboard;
