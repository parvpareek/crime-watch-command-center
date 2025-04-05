import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getReportsByIncidentType, CrimeReport } from '@/utils/data';

interface IncidentTypeChartProps {
  reports: CrimeReport[];
  className?: string;
}

const COLORS = ['#3B82F6', '#F59E0B', '#EC4899', '#10B981', '#6366F1', '#8B5CF6', '#F43F5E', '#14B8A6'];

const IncidentTypeChart: React.FC<IncidentTypeChartProps> = ({ reports, className }) => {
  const [chartData, setChartData] = useState<{ type: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch incident type data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      console.log('[IncidentTypeChart] Starting to fetch incident type data');
      setLoading(true);
      try {
        console.log('[IncidentTypeChart] Calling getReportsByIncidentType');
        const data = await getReportsByIncidentType();
        console.log('[IncidentTypeChart] Data received from getReportsByIncidentType:', data);
        setChartData(data || []);
      } catch (error) {
        console.error("[IncidentTypeChart] Error fetching incident type data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
        console.log('[IncidentTypeChart] Updated chart data state. Loading set to false');
      }
    };

    fetchData();
  }, []);

  // Only show the top 7 incident types and group the rest as "Other"
  const topData = chartData.slice(0, 7);
  
  const otherCount = chartData.length > 7 
    ? chartData.slice(7).reduce((sum, item) => sum + item.count, 0)
    : 0;
  
  const finalData = otherCount > 0 
    ? [...topData, { type: 'Other', count: otherCount }] 
    : topData;

  console.log('[IncidentTypeChart] Final data for chart:', finalData);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Incidents by Type</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div>Loading chart data...</div>
          </div>
        ) : finalData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div>No data available</div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentTypeChart;
