import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our data
export interface CrimeReport {
  id: number;
  created_at: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  perpetrator: string;
  details: string;
  user_id: number;
  report_type: string;
  incident_type: string;
  status: "New" | "Under Investigation" | "Resolved" | "False Report";
  severity: "Low" | "Medium" | "High" | "Critical";
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

// Function to fetch crime reports from Supabase
export const fetchCrimeReports = async (): Promise<CrimeReport[]> => {
  try {
    const { data, error } = await supabase
      .from('crime_report')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching crime reports:", error);
    toast.error("Failed to fetch crime reports");
    return [];
  }
};

// Function to fetch users from Supabase
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
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
export const getTodayReports = async (): Promise<CrimeReport[]> => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('crime_report')
    .select('*')
    .eq('date', today)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching today's reports:", error);
    toast.error("Failed to fetch today's reports");
    return [];
  }

  return data || [];
};

// Get crime reports for the last 7 days
export const getLastWeekReports = async (): Promise<CrimeReport[]> => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('crime_report')
      .select('*')
      .gte('date', oneWeekAgo.toISOString().split('T')[0])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching last week's reports:", error);
    toast.error("Failed to fetch last week's reports");
    return [];
  }
};

// Get crime reports for the last 30 days
export const getLastMonthReports = async (): Promise<CrimeReport[]> => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('crime_report')
      .select('*')
      .gte('date', oneMonthAgo.toISOString().split('T')[0])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching last month's reports:", error);
    toast.error("Failed to fetch last month's reports");
    return [];
  }
};

// Get the most frequent incident type in the reports
export const getMostFrequentIncidentType = async (): Promise<string> => {
  try {
    const query = `
      SELECT incident_type, COUNT(*) as count
      FROM crime_report
      GROUP BY incident_type
      ORDER BY count DESC
      LIMIT 1
    `;

    const { data, error } = await supabase.rpc('execute_sql', { query });

    if (error) {
      throw error;
    }

    // Extract the incident_type from the result
    return data?.[0]?.result?.incident_type || '';
  } catch (error) {
    console.error("Error fetching most frequent incident type:", error);
    toast.error("Failed to fetch most frequent incident type");
    return '';
  }
};

// Group reports by date for the time trend chart
export const getReportsByDate = async (timeFrame: 'day' | 'week' | 'month' = 'day'): Promise<{ date: string; count: number }[]> => {
  console.log(`[getReportsByDate] Fetching data with timeFrame: ${timeFrame}`);
  try {
    const query = `
      SELECT 
        date_trunc('${timeFrame}', date::timestamp) as date,
        COUNT(*) as count
      FROM crime_report
      GROUP BY date_trunc('${timeFrame}', date::timestamp)
      ORDER BY date_trunc('${timeFrame}', date::timestamp)
    `;

    console.log(`[getReportsByDate] Executing SQL query:`, query);
    const { data, error } = await supabase.rpc('execute_sql', { query });
    
    if (error) {
      console.error(`[getReportsByDate] Error details:`, error);
      throw error;
    }

    console.log(`[getReportsByDate] Raw data received:`, data);
    
    // Ensure we return an array of objects with the correct structure
    const formattedData = Array.isArray(data) ? data.map(item => {
      console.log(`[getReportsByDate] Processing item:`, item);
      return {
        date: item.result?.date || item.date,
        count: Number(item.result?.count || item.count)
      };
    }) : [];
    
    console.log(`[getReportsByDate] Formatted data:`, formattedData);
    return formattedData;
  } catch (error) {
    console.error("[getReportsByDate] Error fetching reports by date:", error);
    toast.error("Failed to fetch reports by date");
    return [];
  }
};

// Group reports by hour for the time of day analysis
export const getReportsByHour = async (): Promise<{ hour: number; count: number }[]> => {
  console.log(`[getReportsByHour] Fetching hour data`);
  try {
    const query = `
      SELECT 
        EXTRACT(HOUR FROM time::time) as hour,
        COUNT(*) as count
      FROM crime_report
      GROUP BY EXTRACT(HOUR FROM time::time)
      ORDER BY hour
    `;

    console.log(`[getReportsByHour] Executing SQL query:`, query);
    const { data, error } = await supabase.rpc('execute_sql', { query });

    if (error) {
      console.error(`[getReportsByHour] Error details:`, error);
      throw error;
    }

    console.log(`[getReportsByHour] Raw data received:`, data);
    
    // Ensure we return an array of objects with the correct structure
    const formattedData = Array.isArray(data) ? data.map(item => {
      console.log(`[getReportsByHour] Processing item:`, item);
      return {
        hour: Number(item.result?.hour || item.hour),
        count: Number(item.result?.count || item.count)
      };
    }) : [];
    
    console.log(`[getReportsByHour] Formatted data:`, formattedData);
    return formattedData;
  } catch (error) {
    console.error("[getReportsByHour] Error fetching reports by hour:", error);
    toast.error("Failed to fetch reports by hour");
    return [];
  }
};

// Group reports by incident type
export const getReportsByIncidentType = async (): Promise<{ type: string; count: number }[]> => {
  console.log(`[getReportsByIncidentType] Fetching incident type data`);
  try {
    const query = `
      SELECT 
        incident_type as type,
        COUNT(*) as count
      FROM crime_report
      GROUP BY incident_type
      ORDER BY count DESC
    `;

    console.log(`[getReportsByIncidentType] Executing SQL query:`, query);
    const { data, error } = await supabase.rpc('execute_sql', { query });

    if (error) {
      console.error(`[getReportsByIncidentType] Error details:`, error);
      throw error;
    }

    console.log(`[getReportsByIncidentType] Raw data received:`, data);
    
    // Ensure we return an array of objects with the correct structure
    const formattedData = Array.isArray(data) ? data.map(item => {
      console.log(`[getReportsByIncidentType] Processing item:`, item);
      return {
        type: item.result?.type || item.type,
        count: Number(item.result?.count || item.count)
      };
    }) : [];
    
    console.log(`[getReportsByIncidentType] Formatted data:`, formattedData);
    return formattedData;
  } catch (error) {
    console.error("[getReportsByIncidentType] Error fetching reports by incident type:", error);
    toast.error("Failed to fetch reports by incident type");
    return [];
  }
};

// Group reports by status
export const getReportsByStatus = async (): Promise<{ status: string; count: number }[]> => {
  console.log(`[getReportsByStatus] Fetching status data`);
  try {
    const query = `
      SELECT 
        status::text,
        COUNT(*)::integer as count
      FROM crime_report
      GROUP BY status
      ORDER BY count DESC
    `;

    console.log(`[getReportsByStatus] Executing SQL query:`, query);
    const { data, error } = await supabase.rpc('execute_sql', { query });

    if (error) {
      console.error(`[getReportsByStatus] Error details:`, error);
      throw error;
    }

    console.log(`[getReportsByStatus] Raw data received:`, data);
    
    // Extract the results from the data
    const formattedData = Array.isArray(data) ? data.map(item => {
      console.log(`[getReportsByStatus] Processing item:`, item);
      return {
        status: item.result?.status || item.status,
        count: Number(item.result?.count || item.count)
      };
    }) : [];
    
    console.log(`[getReportsByStatus] Formatted data:`, formattedData);
    return formattedData;
  } catch (error) {
    console.error("[getReportsByStatus] Error fetching reports by status:", error);
    toast.error("Failed to fetch reports by status");
    return [];
  }
};

// Group reports by severity
export const getReportsBySeverity = async (): Promise<{ severity: string; count: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('crime_report')
      .select('severity, count')
      .order('count', { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(item => ({
      severity: item.severity,
      count: item.count
    })) || [];
  } catch (error) {
    console.error("Error fetching reports by severity:", error);
    toast.error("Failed to fetch reports by severity");
    return [];
  }
};
