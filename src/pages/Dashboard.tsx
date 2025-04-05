
import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from '@/components/DashboardSidebar';
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold ml-2">Crime Watch Command Center</h1>
            <div className="ml-auto flex items-center gap-2">
              {/* Placeholder for user menu, notifications, etc. */}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse-soft">Loading dashboard data...</div>
              </div>
            ) : (
              <div className="space-y-4">
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

                {/* Map Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 h-[500px]">
                    <CrimeMap 
                      reports={reports} 
                      onReportSelect={handleReportSelect} 
                    />
                  </div>
                  
                  {/* Charts Section */}
                  <div className="space-y-4">
                    <CrimeTrendChart reports={reports} />
                    <IncidentTypeChart reports={reports} />
                  </div>
                </div>

                {/* Time Analysis and Reports Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <TimeOfDayChart reports={reports} />
                  </div>
                  <div className="lg:col-span-2">
                    <ReportsTable 
                      reports={reports} 
                      onReportSelect={handleReportSelect} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Report Detail Drawer */}
        <ReportDetail 
          report={selectedReport} 
          open={drawerOpen} 
          onOpenChange={setDrawerOpen} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
