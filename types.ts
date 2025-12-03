export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
  isActive: boolean;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  services: string[]; // Service IDs
  workDays: number[]; // 0=Sunday, 1=Monday...
  workHoursStart: string; // "09:00"
  workHoursEnd: string; // "18:00"
  description?: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  professionalId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD (Local)
  time: string; // HH:mm (Local)
  timestampUtc?: string; // ISO String for Backend/DB
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface StoreConfig {
  name: string;
  description: string;
  logoUrl: string | null;
  colors: {
    background: string;
    card: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    price: string;
    buttonText: string;
  };
  contact: {
    phone: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    address: string;
  };
  planActive: boolean;
  hours: {
    open: string;
    close: string;
    workDays: number[]; // 0-6
  };
}

// Default config for fallback
export const DEFAULT_CONFIG: StoreConfig = {
  name: "Studio’Bella’s",
  description: "Realce sua beleza natural com nossos tratamentos exclusivos.",
  logoUrl: null,
  colors: {
    background: "#ffffff",
    card: "#f9fafb",
    text: "#111827",
    primary: "#ec4899", 
    secondary: "#db2777", 
    accent: "#FACC15", 
    price: "#eab308",
    buttonText: "#ffffff"
  },
  contact: {
    phone: "5511999999999",
    instagram: "studiobellas",
    facebook: "studiobellas",
    tiktok: "studiobellas",
    address: "Rua das Flores, 123 - Centro",
  },
  planActive: true,
  hours: {
    open: "09:00",
    close: "19:00",
    workDays: [1, 2, 3, 4, 5, 6],
  },
};