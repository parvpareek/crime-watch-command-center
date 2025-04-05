
import React from 'react';
import { Grid } from '@/components/ui/grid';
import KpiCard from '@/components/KpiCard';
import { AlertTriangle, CheckCircle, CircleDot, XCircle } from 'lucide-react';
import { CrimeReport } from '@/utils/data';

interface StatusKpiCardsProps {
  reports: CrimeReport[];
}

const StatusKpiCards: React.FC<StatusKpiCardsProps> = ({ reports }) => {
  // Count reports by status
  const newReports = reports.filter(r => r.status === 'New').length;
  const investigatingReports = reports.filter(r => r.status === 'Under Investigation').length;
  const resolvedReports = reports.filter(r => r.status === 'Resolved').length;
  const falseReports = reports.filter(r => r.status === 'False Report').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        icon={<CircleDot className="h-4 w-4" />}
      />
      <KpiCard
        title="Resolved Cases"
        value={resolvedReports}
        description="completed cases"
        icon={<CheckCircle className="h-4 w-4" />}
      />
      <KpiCard
        title="False Reports"
        value={falseReports}
        description="invalid reports"
        icon={<XCircle className="h-4 w-4" />}
      />
    </div>
  );
};

export default StatusKpiCards;
