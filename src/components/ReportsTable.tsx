
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Download, 
  Search 
} from 'lucide-react';
import { CrimeReport } from '@/utils/data';
import { Badge } from '@/components/ui/badge';

interface ReportsTableProps {
  reports: CrimeReport[];
  onReportSelect?: (report: CrimeReport) => void;
  className?: string;
}

// Status badge variant mapping
const statusVariant: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  "New": "default",
  "Under Investigation": "secondary",
  "Resolved": "outline",
  "False Report": "destructive"
};

const ReportsTable: React.FC<ReportsTableProps> = ({ reports, onReportSelect, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.incident_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toString().includes(searchTerm) ||
    report.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate reports
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + rowsPerPage);

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create headers
    const headers = ['ID', 'Date', 'Time', 'Incident Type', 'Location', 'Status', 'Details'];
    
    // Format report data for CSV
    const csvData = filteredReports.map(report => [
      report.id,
      report.date,
      report.time,
      report.incident_type,
      `${report.location.coordinates[1]}, ${report.location.coordinates[0]}`,
      report.status || 'New',
      report.details
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'crime_reports.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Crime Reports</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Incident Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <TableRow 
                    key={report.id}
                    onClick={() => onReportSelect && onReportSelect(report)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>{report.time.substring(0, 5)}</TableCell>
                    <TableCell>{report.incident_type}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[report.status || "New"]} className="text-xs">
                        {report.status || "New"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.details}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No reports found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredReports.length)} of {filteredReports.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportsTable;
