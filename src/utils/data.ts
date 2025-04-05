
import { toast } from "sonner";

// Types for our data
export interface CrimeReport {
  id: number;
  created_at: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  date: string;
  time: string;
  perpetrator: string;
  details: string;
  user_id: number;
  report_type: string;
  incident_type: string;
  status?: "New" | "Under Investigation" | "Resolved" | "False Report";
}

export interface User {
  id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  address: string;
  pincode: number;
  state: string;
  city: string;
  email: string;
  phone_number: string;
  points: number;
  level: number;
  language: string;
}

// Generate mock data for development
export const generateMockData = (): CrimeReport[] => {
  // Define common incident types
  const incidentTypes = [
    "Assault", 
    "Burglary", 
    "Theft", 
    "Drug Offense", 
    "Vandalism", 
    "Fraud", 
    "Public Disturbance", 
    "Robbery"
  ];
  
  // Define statuses
  const statuses: ("New" | "Under Investigation" | "Resolved" | "False Report")[] = [
    "New", 
    "Under Investigation", 
    "Resolved", 
    "False Report"
  ];

  // Define city center coordinates (default to a generic US location)
  const centerLat = 40.7128;
  const centerLng = -74.006;
  
  // Generate 100 random crime reports
  return Array.from({ length: 100 }, (_, i) => {
    // Create a random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Random time
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    
    // Random location within ~5km of the center point
    const lat = centerLat + (Math.random() - 0.5) * 0.1;
    const lng = centerLng + (Math.random() - 0.5) * 0.1;
    
    return {
      id: i + 1,
      created_at: date.toISOString(),
      location: {
        type: "Point",
        coordinates: [lng, lat]
      },
      date: date.toISOString().split('T')[0],
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
      perpetrator: Math.random() > 0.7 ? "Unknown" : `Suspect ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      details: `Mock crime report ${i + 1}`,
      user_id: Math.floor(Math.random() * 20) + 1,
      report_type: "Citizen Report",
      incident_type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
};

// Function to fetch crime reports from Supabase
export const fetchCrimeReports = async (): Promise<CrimeReport[]> => {
  // For now, return mock data
  // In production, this would be replaced with a Supabase query
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return generateMockData();
  } catch (error) {
    console.error("Error fetching crime reports:", error);
    toast.error("Failed to fetch crime reports");
    return [];
  }
};

// Get crime category for styling/filtering
export const getCrimeCategory = (incidentType: string): string => {
  incidentType = incidentType.toLowerCase();
  
  if (['assault', 'robbery', 'homicide', 'shooting'].some(type => incidentType.includes(type))) {
    return 'violent';
  }
  
  if (['theft', 'burglary', 'vandalism', 'fraud'].some(type => incidentType.includes(type))) {
    return 'property';
  }
  
  if (['drug', 'narcotic'].some(type => incidentType.includes(type))) {
    return 'drugs';
  }
  
  if (['disturbance', 'public', 'disorder', 'noise'].some(type => incidentType.includes(type))) {
    return 'public';
  }
  
  return 'other';
};

// Format date to human-readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get crime reports for today
export const getTodayReports = (reports: CrimeReport[]): CrimeReport[] => {
  const today = new Date().toISOString().split('T')[0];
  return reports.filter(report => report.date === today);
};

// Get crime reports for the last 7 days
export const getLastWeekReports = (reports: CrimeReport[]): CrimeReport[] => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return reports.filter(report => {
    const reportDate = new Date(report.date);
    return reportDate >= oneWeekAgo;
  });
};

// Get crime reports for the last 30 days
export const getLastMonthReports = (reports: CrimeReport[]): CrimeReport[] => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  return reports.filter(report => {
    const reportDate = new Date(report.date);
    return reportDate >= oneMonthAgo;
  });
};

// Get the most frequent incident type in the reports
export const getMostFrequentIncidentType = (reports: CrimeReport[]): string => {
  const incidentCounts: Record<string, number> = {};
  
  reports.forEach(report => {
    incidentCounts[report.incident_type] = (incidentCounts[report.incident_type] || 0) + 1;
  });
  
  let mostFrequent = '';
  let highestCount = 0;
  
  Object.entries(incidentCounts).forEach(([type, count]) => {
    if (count > highestCount) {
      mostFrequent = type;
      highestCount = count;
    }
  });
  
  return mostFrequent;
};

// Group reports by date for the time trend chart
export const getReportsByDate = (reports: CrimeReport[]): { date: string; count: number }[] => {
  const dateMap: Record<string, number> = {};
  
  reports.forEach(report => {
    const date = report.date;
    dateMap[date] = (dateMap[date] || 0) + 1;
  });
  
  // Convert to array and sort by date
  return Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Group reports by hour for the time of day analysis
export const getReportsByHour = (reports: CrimeReport[]): { hour: number; count: number }[] => {
  const hourCounts = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
  
  reports.forEach(report => {
    const hour = parseInt(report.time.split(':')[0], 10);
    hourCounts[hour].count += 1;
  });
  
  return hourCounts;
};

// Group reports by incident type
export const getReportsByIncidentType = (reports: CrimeReport[]): { type: string; count: number }[] => {
  const typeCounts: Record<string, number> = {};
  
  reports.forEach(report => {
    typeCounts[report.incident_type] = (typeCounts[report.incident_type] || 0) + 1;
  });
  
  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
};

// Group reports by status
export const getReportsByStatus = (reports: CrimeReport[]): { status: string; count: number }[] => {
  const statusCounts: Record<string, number> = {
    "New": 0,
    "Under Investigation": 0,
    "Resolved": 0,
    "False Report": 0
  };
  
  reports.forEach(report => {
    if (report.status) {
      statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
    } else {
      statusCounts["New"] += 1; // Default to "New" if status is not set
    }
  });
  
  return Object.entries(statusCounts)
    .map(([status, count]) => ({ status, count }));
};
