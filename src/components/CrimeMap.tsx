
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { toast } from "sonner";
import { CrimeReport, getCrimeCategory } from '@/utils/data';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons for different crime types
const crimeIcons = {
  violent: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  property: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  drugs: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  public: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  other: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

// MapView component to handle map operations
const MapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
};

interface CrimeMapProps {
  reports: CrimeReport[];
  onReportSelect?: (report: CrimeReport) => void;
}

// Import Marker separately and create a custom marker component to work around the TypeScript issue
import { Marker as LeafletMarker } from 'react-leaflet';

// Create a wrapper component for Marker that accepts the icon prop
const Marker = (props: any) => {
  return <LeafletMarker {...props} />;
};

const CrimeMap: React.FC<CrimeMapProps> = ({ reports, onReportSelect }) => {
  // Default center at Surat, Gujarat, India
  const [center, setCenter] = useState<[number, number]>([21.1702, 72.8311]);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);

  useEffect(() => {
    // If we have reports, center the map on the most recent one
    if (reports.length > 0) {
      try {
        const recentReport = [...reports].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        setCenter([
          recentReport.location.coordinates[1], 
          recentReport.location.coordinates[0]
        ]);
      } catch (error) {
        console.error("Error centering map:", error);
        toast.error("Failed to center map");
      }
    }
  }, [reports]);

  const handleMarkerClick = (report: CrimeReport) => {
    setSelectedReport(report);
    if (onReportSelect) {
      onReportSelect(report);
    }
  };

  // Get marker icon based on crime category and severity
  const getMarkerIcon = (report: CrimeReport) => {
    const category = getCrimeCategory(report.incident_type);
    return crimeIcons[category as keyof typeof crimeIcons];
  };

  return (
    <div className="crime-map-container relative h-full">
      <MapContainer
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapView center={center} />
        
        <MarkerClusterGroup chunkedLoading>
          {reports.map((report) => {
            // Create the Leaflet marker with the icon
            const icon = getMarkerIcon(report);
            return (
              <Marker
                key={report.id}
                position={[
                  report.location.coordinates[1],
                  report.location.coordinates[0]
                ]}
                icon={icon}
                eventHandlers={{
                  click: () => handleMarkerClick(report),
                }}
              >
                <Popup>
                  <div className="text-black">
                    <h3 className="font-bold">{report.incident_type}</h3>
                    <p className="text-sm">Date: {new Date(report.date).toLocaleDateString()}</p>
                    <p className="text-sm">Time: {report.time.substring(0, 5)}</p>
                    <p className="text-sm">ID: {report.id}</p>
                    <p className="text-sm">Status: {report.status}</p>
                    <p className="text-sm">Severity: {report.incident_severity}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
      
      <div className="map-overlay absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-md flex flex-wrap gap-2">
        {Object.keys(crimeIcons).map(category => (
          <div key={category} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1"
              style={{
                backgroundColor: 
                  category === 'violent' ? '#e53e3e' : 
                  category === 'property' ? '#dd6b20' : 
                  category === 'drugs' ? '#805ad5' : 
                  category === 'public' ? '#3182ce' : 
                  '#718096'
              }}
            />
            <span className="text-xs capitalize">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrimeMap;
