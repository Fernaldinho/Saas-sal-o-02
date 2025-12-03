import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreConfig, DEFAULT_CONFIG, Service, Professional, Appointment } from '../types';
import { supabase } from '../utils/supabaseClient';
import { toUtcTimestamp, getTodayString } from '../utils/dateUtils';

interface StoreContextType {
  config: StoreConfig;
  updateConfig: (newConfig: Partial<StoreConfig>) => Promise<void>;
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  professionals: Professional[];
  addProfessional: (professional: Omit<Professional, 'id'>) => Promise<void>;
  updateProfessional: (id: string, data: Partial<Professional>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  isAdmin: boolean;
  toggleAdmin: () => void;
  activatePlan: () => void;
  isLoading: boolean;
  uploadImage: (file: File, bucket: 'images' | 'profiles' | 'logos') => Promise<string | null>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Data (Fallback if DB is empty/unreachable)
const MOCK_CONFIG: StoreConfig = { ...DEFAULT_CONFIG };

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<StoreConfig>(MOCK_CONFIG);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const isSupabaseEnabled = !!supabase;

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (isSupabaseEnabled && supabase) {
        try {
          // 1. Config
          const { data: configData } = await supabase.from('store_config').select('data').eq('id', 1).single();
          if (configData) setConfig({ ...DEFAULT_CONFIG, ...configData.data });

          // 2. Services
          const { data: servicesData } = await supabase.from('services').select('*').eq('is_active', true); // Or handle soft delete
          if (servicesData) {
              setServices(servicesData.map((s: any) => ({
                 id: s.id,
                 name: s.name,
                 price: s.price,
                 duration: s.duration,
                 description: s.description,
                 isActive: s.is_active
              })));
          }

          // 3. Professionals
          const { data: prosData } = await supabase.from('professionals').select('*');
          if (prosData) {
              setProfessionals(prosData.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  specialty: p.specialty,
                  photoUrl: p.photo_url,
                  services: p.services || [],
                  workDays: p.work_days || [],
                  workHoursStart: p.work_hours_start,
                  workHoursEnd: p.work_hours_end,
                  isActive: p.is_active,
                  description: p.description
              })));
          }

          // 4. Appointments
          const { data: apptsData } = await supabase.from('appointments').select('*');
          if (apptsData) {
              setAppointments(apptsData.map((a: any) => ({
                  id: a.id,
                  clientId: a.client_id,
                  clientName: a.client_name,
                  clientPhone: a.client_phone,
                  professionalId: a.professional_id,
                  serviceId: a.service_id,
                  date: a.date,
                  time: a.time,
                  status: a.status,
                  createdAt: a.created_at
              })));
          }

        } catch (error) {
          console.error("Supabase load error:", error);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // --- Storage ---
  const uploadImage = async (file: File, bucket: 'images' | 'profiles' | 'logos' = 'images'): Promise<string | null> => {
      if (isSupabaseEnabled && supabase) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
          if (uploadError) { console.error(uploadError); return null; }
          const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
          return data.publicUrl;
      }
      // Mock fallback
      return new Promise(r => {
          const reader = new FileReader();
          reader.onload = () => r(reader.result as string);
          reader.readAsDataURL(file);
      });
  };

  // --- CRUD Actions ---

  const updateConfig = async (newConfig: Partial<StoreConfig>) => {
    const updated = { 
      ...config, 
      ...newConfig,
      colors: { ...config.colors, ...(newConfig.colors || {}) },
      contact: { ...config.contact, ...(newConfig.contact || {}) },
      hours: { ...config.hours, ...(newConfig.hours || {}) }
    };
    setConfig(updated);
    if (isSupabaseEnabled && supabase) {
        await supabase.from('store_config').upsert({ id: 1, data: updated });
    }
  };

  const activatePlan = async () => updateConfig({ planActive: true });

  const addService = async (data: Omit<Service, 'id'>) => {
    if (isSupabaseEnabled && supabase) {
        const { data: res, error } = await supabase.from('services').insert([{
            name: data.name, price: data.price, duration: data.duration, description: data.description, is_active: data.isActive
        }]).select();
        if (res) setServices([...services, { ...data, id: res[0].id }]);
    } else {
        setServices([...services, { ...data, id: Math.random().toString(36).substr(2,9) }]);
    }
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    if (isSupabaseEnabled && supabase) {
        const dbData: any = {};
        if (data.name) dbData.name = data.name;
        if (data.price) dbData.price = data.price;
        if (data.duration) dbData.duration = data.duration;
        if (data.description) dbData.description = data.description;
        if (data.isActive !== undefined) dbData.is_active = data.isActive;
        await supabase.from('services').update(dbData).eq('id', id);
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteService = async (id: string) => {
    if (isSupabaseEnabled && supabase) await supabase.from('services').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addProfessional = async (data: Omit<Professional, 'id'>) => {
    if (isSupabaseEnabled && supabase) {
        const { data: res } = await supabase.from('professionals').insert([{
            name: data.name, specialty: data.specialty, photo_url: data.photoUrl,
            services: data.services, work_days: data.workDays,
            work_hours_start: data.workHoursStart, work_hours_end: data.workHoursEnd,
            is_active: data.isActive, description: data.description
        }]).select();
        if (res) setProfessionals([...professionals, { ...data, id: res[0].id }]);
    } else {
        setProfessionals([...professionals, { ...data, id: Math.random().toString(36).substr(2,9) }]);
    }
  };

  const updateProfessional = async (id: string, data: Partial<Professional>) => {
    if (isSupabaseEnabled && supabase) {
        const dbData: any = {};
        if (data.name) dbData.name = data.name;
        if (data.photoUrl) dbData.photo_url = data.photoUrl;
        if (data.services) dbData.services = data.services;
        if (data.workDays) dbData.work_days = data.workDays;
        if (data.isActive !== undefined) dbData.is_active = data.isActive;
        await supabase.from('professionals').update(dbData).eq('id', id);
    }
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProfessional = async (id: string) => {
    if (isSupabaseEnabled && supabase) await supabase.from('professionals').delete().eq('id', id);
    setProfessionals(prev => prev.filter(p => p.id !== id));
  };

  const addAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newAppt = {
        client_name: data.clientName,
        client_phone: data.clientPhone,
        client_id: data.clientId,
        professional_id: data.professionalId,
        service_id: data.serviceId,
        date: data.date,
        time: data.time,
        timestamp_utc: toUtcTimestamp(data.date, data.time),
        status: 'confirmed'
    };

    if (isSupabaseEnabled && supabase) {
        const { data: res } = await supabase.from('appointments').insert([newAppt]).select();
        if (res) {
             setAppointments([...appointments, { 
                 ...data, id: res[0].id, status: 'confirmed', createdAt: res[0].created_at 
             }]);
        }
    } else {
        setAppointments([...appointments, { ...data, id: Math.random().toString(), status: 'confirmed', createdAt: new Date().toISOString() }]);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (isSupabaseEnabled && supabase) {
        await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const toggleAdmin = () => setIsAdmin(!isAdmin);

  return (
    <StoreContext.Provider value={{
      config, updateConfig,
      services, addService, updateService, deleteService,
      professionals, addProfessional, updateProfessional, deleteProfessional,
      appointments, addAppointment, cancelAppointment,
      isAdmin, toggleAdmin, activatePlan, isLoading, uploadImage
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};