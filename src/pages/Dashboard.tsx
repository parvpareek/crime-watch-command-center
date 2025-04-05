
import React, { useEffect, useState } from 'react';
import CrimeMap from '@/components/CrimeMap';
import KpiCard from '@/components/KpiCard';
import CrimeTrendChart from '@/components/CrimeTrendChart';
import IncidentTypeChart from '@/components/IncidentTypeChart';
import TimeOfDayChart from '@/components/TimeOfDayChart';
import ReportsTable from '@/components/ReportsTable';
import ReportDetail from '@/components/ReportDetail';
import { 
  CrimeReport, 
  fetchCrimeReports, 
  getTodayReports, 
  getLastWeekReports, 
  getLastMonthReports,
  getMostFrequentIncidentType,
  getReportsByStatus
} from '@/utils/data';
import { AlertTriangle, BarChart2, Clock, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCrimeReports();
        setReports(data);
      } catch (error) {
        console.error('Error loading crime reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleReportSelect = (report: CrimeReport) => {
    setSelectedReport(report);
    setDrawerOpen(true);
  };

  // Calculate KPI values
  const todayCount = getTodayReports(reports).length;
  const lastWeekCount = getLastWeekReports(reports).length;
  const lastMonthCount = getLastMonthReports(reports).length;
  const mostFrequentType = getMostFrequentIncidentType(reports);
  
  // Calculate percentage change for week vs previous week
  const weeklyChange = lastWeekCount > 0 
    ? ((lastWeekCount - (lastMonthCount - lastWeekCount) / 3) / ((lastMonthCount - lastWeekCount) / 3) * 100).toFixed(1)
    : '0.0';
  
  const statusCounts = getReportsByStatus(reports);
  const newReports = statusCounts.find(s => s.status === 'New')?.count || 0;
  const investigatingReports = statusCounts.find(s => s.status === 'Under Investigation')?.count || 0;

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
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard 
                title="Today's Reports" 
                value={todayCount}
                icon={<FileText className="h-4 w-4" />} 
              />
              <KpiCard 
                title="Last 7 Days" 
                value={lastWeekCount} 
                changeType={parseFloat(weeklyChange) > 0 ? 'increase' : parseFloat(weeklyChange) < 0 ? 'decrease' : 'neutral'}
                changeValue={`${Math.abs(parseFloat(weeklyChange))}%`}
                description="vs previous week"
                icon={<BarChart2 className="h-4 w-4" />} 
              />
              <KpiCard 
                title="New Reports" 
                value={newReports} 
                description="awaiting review"
                icon={<AlertTriangle className="h-4 w-4" />} 
              />
              <KpiCard 
                title="Under Investigation" 
                value={investigatingReports} 
                description="active cases"
                icon={<Clock className="h-4 w-4" />} 
              />
            </div>

            {/* Temporal Visualization - Now Larger and Centered */}
            <div className="w-full h-[500px]">
              <CrimeTrendChart reports={reports} className="h-full" />
            </div>

            {/* Map Section */}
            <div className="w-full h-[500px]">
              <CrimeMap 
                reports={reports} 
                onReportSelect={handleReportSelect} 
              />
            </div>
            
            {/* Charts Section - Two column grid for smaller visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TimeOfDayChart reports={reports} className="h-[400px]" />
              <IncidentTypeChart reports={reports} className="h-[400px]" />
            </div>

            {/* Reports Table - Full width */}
            <div className="w-full">
              <ReportsTable 
                reports={reports} 
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
      />
    </div>
  );
};

export default Dashboard;
