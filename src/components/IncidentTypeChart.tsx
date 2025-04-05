
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getReportsByIncidentType, CrimeReport } from '@/utils/data';

interface IncidentTypeChartProps {
  reports: CrimeReport[];
  className?: string;
}

const COLORS = ['#3B82F6', '#F59E0B', '#EC4899', '#10B981', '#6366F1', '#8B5CF6', '#F43F5E', '#14B8A6'];

const IncidentTypeChart: React.FC<IncidentTypeChartProps> = ({ reports, className }) => {
  const chartData = getReportsByIncidentType(reports);

  // Only show the top 7 incident types and group the rest as "Other"
  const topData = chartData.slice(0, 7);
  
  const otherCount = chartData
    .slice(7)
    .reduce((sum, item) => sum + item.count, 0);
  
  const finalData = otherCount > 0 
    ? [...topData, { type: 'Other', count: otherCount }] 
    : topData;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Incidents by Type</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={finalData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
              nameKey="type"
              label={(entry) => entry.type}
              labelLine={false}
            >
              {finalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                borderColor: '#374151',
                color: '#F9FAFB',
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              layout="horizontal" 
              formatter={(value) => <span className="text-xs text-gray-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default IncidentTypeChart;
