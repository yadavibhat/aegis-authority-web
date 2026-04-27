export interface Alert {
  id: string;
  tourist_id: string;
  type: string;
  message: string;
  latitude: number;
  longitude: number;
  resolved: boolean | null;
  resolved_by?: string | null;
  created_at: string;
  status: 'OPEN' | 'RESOLVED';
  isPanic: boolean;
  tourist?: Tourist;
}

export interface Tourist {
  id: string;
  full_name?: string;
  name: string;
  phone?: string;
  email?: string;
  aadhaar?: string;
  device_id: string | null;
  active?: boolean;
  latitude: number | null;
  longitude: number | null;
  lat?: number;
  lng?: number;
  hasActivePanic?: boolean;
  aadhaar_masked?: string;
}

export interface Location {
  id: string;
  tourist_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  radius?: number;
  type?: string;
  coordinates?: Record<string, unknown> | [number, number][]; // Leaflet format varying
}

export interface DashboardData {
  alerts: Alert[];
  tourists: Tourist[];
  locations: Location[];
  zones: Zone[];
}
