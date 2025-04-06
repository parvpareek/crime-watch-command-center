import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Types matching database schema
interface CrimeReport {
  id?: number;
  created_at: string;
  latitude: number;  // Latitude coordinate
  longitude: number; // Longitude coordinate
  date: string;
  time: string;
  perpetrator: string;
  details: string;
  user_id: number;
  report_type: string;
  incident_type: string;
  severity: string;
  status: string;
  reporter_uuid: string; // UUID of the user who submitted the report
}

interface User {
  id?: number;
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
  uuid: string;      // UUID for unique identification
}

// Generate mock users
const generateMockUsers = (): User[] => {
  const firstNames = ["Raj", "Amit", "Rahul", "Priya", "Neha", "Anjali", "Vikram", "Sanjay", "Kavita", "Deepika"];
  const lastNames = ["Sharma", "Patel", "Shah", "Singh", "Kumar", "Verma", "Desai", "Mehta", "Joshi", "Gandhi"];
  const areas = ["Adajan", "City Light", "Vesu", "Althan", "Athwa", "Dumas", "Katargam", "Varachha", "Udhna", "Piplod"];
  const languages = ["Gujarati", "Hindi", "English"];
  
  return Array.from({ length: 20 }, (_, i) => {
    const created = new Date();
    created.setDate(created.getDate() - Math.floor(Math.random() * 365));
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];
    
    return {
      created_at: created.toISOString(),
      first_name: firstName,
      last_name: lastName,
      uuid: uuidv4(), // Generate a unique UUID for each user
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

// Generate mock crime reports
const generateMockCrimeReports = (users: { id: number; uuid: string }[]): CrimeReport[] => {
  const incidentTypes = [
    "Theft", "Vehicle Theft", "Burglary", "Robbery",
    "Assault", "Harassment", "Fraud", "Public Disturbance",
    "Drug Offense", "Traffic Violation", "Property Damage", "Eve Teasing"
  ];
  
  const statuses = ["New", "Under Investigation", "Resolved", "False Report"];
  const severityLevels = ["Low", "Medium", "High", "Critical"];
  const reportTypes = ["Citizen Report", "Police Report"];
  
  // Surat city center coordinates
  const centerLat = 21.1702;
  const centerLng = 72.8311;
  
  return Array.from({ length: 100 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    
    // Random location within ~3km of Surat city center
    const lat = centerLat + (Math.random() - 0.5) * 0.05;
    const lng = centerLng + (Math.random() - 0.5) * 0.05;
    
    const indianFirstNames = ["Raj", "Amit", "Rahul", "Vikram", "Sunil", "Ajay", "Unknown", "Unidentified"];
    const indianLastNames = ["Sharma", "Patel", "Singh", "Kumar", "Verma", "Shah", "Suspect"];
    
    const randomFirstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
    const randomLastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
    const perpetrator = Math.random() > 0.6 ? "Unknown" : `${randomFirstName} ${randomLastName}`;
    
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
    
    // Randomly select a user
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const user = users[randomUserIndex];
    
    return {
      created_at: date.toISOString(),
      latitude: lat,     // Assign the latitude value
      longitude: lng,    // Assign the longitude value
      date: date.toISOString().split('T')[0],
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
      perpetrator: perpetrator,
      details: incidentDetails[Math.floor(Math.random() * incidentDetails.length)],
      user_id: user.id,
      report_type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
      incident_type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
      severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reporter_uuid: user.uuid // Link the crime report to the user's UUID
    };
  });
};

// Main function to populate the database
async function populateDatabase() {
  try {
    console.log('Starting database population...');

    // First, insert users
    console.log('Inserting users...');
    const mockUsers = generateMockUsers();
    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .insert(mockUsers)
      .select('id, uuid');

    if (userError) {
      throw userError;
    }

    if (!insertedUsers) {
      throw new Error('No users were inserted');
    }

    console.log(`Successfully inserted ${insertedUsers.length} users`);

    // Then, insert crime reports
    console.log('Inserting crime reports...');
    const mockCrimeReports = generateMockCrimeReports(insertedUsers);
    const { error: crimeError } = await supabase
      .from('crime_report')
      .insert(mockCrimeReports);

    if (crimeError) {
      throw crimeError;
    }

    console.log(`Successfully inserted ${mockCrimeReports.length} crime reports`);
    console.log('Database population completed successfully!');

  } catch (error) {
    console.error('Error populating database:', error);
  }
}


async function deleteAllRecords() {
  try {
    // Delete all records from the "crime_report" table first (due to foreign key constraints)
    const { error: crimeError } = await supabase
      .from('crime_report')
      .delete()
      .not('id', 'is', null); // This matches all rows

    if (crimeError) {
      throw new Error(`Error deleting crime reports: ${crimeError.message}`);
    }

    // Then delete all records from the "users" table
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .not('id', 'is', null); // This matches all rows
    
    if (usersError) {
      throw new Error(`Error deleting users: ${usersError.message}`);
    }

    console.log('Successfully deleted all records from both tables.');
  } catch (error) {
    console.error('Failed to delete records:', error);
  }
}



// Run the population script
populateDatabase(); 
// deleteAllRecords();