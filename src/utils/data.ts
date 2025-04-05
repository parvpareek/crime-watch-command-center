
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
  status: "New" | "Under Investigation" | "Resolved" | "False Report";
  incident_severity: "Low" | "Medium" | "High" | "Critical";
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

// Generate mock data for development - centered in Surat, Gujarat, India
export const generateMockData = (): CrimeReport[] => {
  // Define common incident types for India
  const incidentTypes = [
    "Theft", 
    "Vehicle Theft",
    "Burglary", 
    "Robbery",
    "Assault", 
    "Harassment",
    "Fraud", 
    "Public Disturbance", 
    "Drug Offense",
    "Traffic Violation",
    "Property Damage",
    "Eve Teasing"
  ];
  
  // Define statuses
  const statuses: ("New" | "Under Investigation" | "Resolved" | "False Report")[] = [
    "New", 
    "Under Investigation", 
    "Resolved", 
    "False Report"
  ];
  
  // Define severity levels
  const severityLevels: ("Low" | "Medium" | "High" | "Critical")[] = [
    "Low",
    "Medium",
    "High",
    "Critical"
  ];

  // Define Surat city center coordinates
  // Surat, Gujarat, India approximate coordinates
  const centerLat = 21.1702;
  const centerLng = 72.8311;
  
  // Generate 100 random crime reports
  return Array.from({ length: 100 }, (_, i) => {
    // Create a random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Random time
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    
    // Random location within ~3km of Surat city center
    const lat = centerLat + (Math.random() - 0.5) * 0.05;
    const lng = centerLng + (Math.random() - 0.5) * 0.05;
    
    // Generate mock Indian names for perpetrators
    const indianFirstNames = ["Raj", "Amit", "Rahul", "Vikram", "Sunil", "Ajay", "Unknown", "Unidentified"];
    const indianLastNames = ["Sharma", "Patel", "Singh", "Kumar", "Verma", "Shah", "Suspect"];
    
    const randomFirstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const randomLastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const perpetrator = Math.random() > 0.6 ? "Unknown" : `${randomFirstName} ${randomLastName}`;
    
    // Generate more realistic incident details
    const incidentDetails = [
      "Victim reported their mobile phone was snatched by two individuals on a motorcycle.",
      "Store owner reported break-in and theft of cash and electronics.",
      "Complainant reported harassment while walking home from work.",
      "Vehicle parked outside residence was damaged overnight.",
      "Resident reported suspicious activity in the neighborhood.",
      "Personal belongings stolen from apartment.",
      "Victim reported being followed by unknown individuals.",
      "Shop owner reported counterfeit currency used for purchase.",
      "Verbal altercation escalated to physical assault.",
      "Complainant reported online fraud and money loss."
    ];
    
    const chosenIncidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const chosenStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const chosenSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    return {
      id: i + 1,
      created_at: date.toISOString(),
      location: {
        type: "Point",
        coordinates: [lng, lat]
      },
      date: date.toISOString().split('T')[0],
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
      perpetrator: perpetrator,
      details: incidentDetails[Math.floor(Math.random() * incidentDetails.length)],
      user_id: Math.floor(Math.random() * 20) + 1,
      report_type: Math.random() > 0.3 ? "Citizen Report" : "Police Report",
      incident_type: chosenIncidentType,
      status: chosenStatus,
      incident_severity: chosenSeverity
    };
  });
};

// Generate mock user data for Surat, Gujarat
export const generateMockUsers = (): User[] => {
  // Common Indian names
  const firstNames = ["Raj", "Amit", "Rahul", "Priya", "Neha", "Anjali", "Vikram", "Sanjay", "Kavita", "Deepika"];
  const lastNames = ["Sharma", "Patel", "Shah", "Singh", "Kumar", "Verma", "Desai", "Mehta", "Joshi", "Gandhi"];
  
  // Areas in Surat
  const areas = ["Adajan", "City Light", "Vesu", "Althan", "Athwa", "Dumas", "Katargam", "Varachha", "Udhna", "Piplod"];
  
  // Languages common in Gujarat
  const languages = ["Gujarati", "Hindi", "English"];
  
  return Array.from({ length: 20 }, (_, i) => {
    // Create a random registration date within the last year
    const created = new Date();
    created.setDate(created.getDate() - Math.floor(Math.random() * 365));
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];
    
    return {
      id: i + 1,
      created_at: created.toISOString(),
      first_name: firstName,
      last_name: lastName,
      address: `${Math.floor(Math.random() * 999) + 1}, ${area} Road, Surat`,
      pincode: 395007,
      state: "Gujarat",
      city: "Surat",
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999) + 1}@example.com`,
      phone_number: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      points: Math.floor(Math.random() * 500),
      level: Math.floor(Math.random() * 5) + 1,
      language: language
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

// Function to fetch users from Supabase
export const fetchUsers = async (): Promise<User[]> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return generateMockUsers();
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to fetch users");
    return [];
  }
};

// Get crime category for styling/filtering
export const getCrimeCategory = (incidentType: string): string => {
  incidentType = incidentType.toLowerCase();
  
  if (['assault', 'robbery', 'homicide', 'shooting'].some(type => incidentType.includes(type))) {
    return 'violent';
  }
  
  if (['theft', 'burglary', 'vandalism', 'fraud', 'property'].some(type => incidentType.includes(type))) {
    return 'property';
  }
  
  if (['drug', 'narcotic'].some(type => incidentType.includes(type))) {
    return 'drugs';
  }
  
  if (['disturbance', 'public', 'disorder', 'noise', 'traffic', 'harassment'].some(type => incidentType.includes(type))) {
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

// Group reports by severity
export const getReportsBySeverity = (reports: CrimeReport[]): { severity: string; count: number }[] => {
  const severityCounts: Record<string, number> = {
    "Low": 0,
    "Medium": 0,
    "High": 0,
    "Critical": 0
  };
  
  reports.forEach(report => {
    if (report.incident_severity) {
      severityCounts[report.incident_severity] = (severityCounts[report.incident_severity] || 0) + 1;
    } else {
      severityCounts["Medium"] += 1; // Default to "Medium" if severity is not set
    }
  });
  
  return Object.entries(severityCounts)
    .map(([severity, count]) => ({ severity, count }));
};
