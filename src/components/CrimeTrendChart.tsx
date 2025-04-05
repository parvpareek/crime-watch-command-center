
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getReportsByDate, CrimeReport } from '@/utils/data';

interface CrimeTrendChartProps {
  reports: CrimeReport[];
  className?: string;
}

const CrimeTrendChart: React.FC<CrimeTrendChartProps> = ({ reports, className }) => {
  const chartData = getReportsByDate(reports);

  // Format dates to be more readable
  const formattedData = chartData.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Crime Trend Over Time</CardTitle>
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
              dataKey="formattedDate" 
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
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CrimeTrendChart;
