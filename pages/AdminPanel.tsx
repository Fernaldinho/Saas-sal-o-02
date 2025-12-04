import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { PlanGuard } from '../components/PlanGuard';
import { 
  LayoutDashboard, Calendar as CalendarIcon, Users, Scissors, 
  Settings, Menu, Plus, Trash2, Edit2, BarChart3
} from 'lucide-react';
import { formatCurrency, formatDateBr } from '../utils/dateUtils';
import { Service, Professional } from '../types';

type Tab = 'dashboard' | 'appointments' | 'services' | 'professionals' | 'settings' | 'reports';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { config, toggleAdmin } = useStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Agendamentos', icon: CalendarIcon },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'professionals', label: 'Profissionais', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const sidebarStyle = { backgroundColor: config.colors.card, borderRight: `1px solid ${config.colors.text}10` };

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ backgroundColor: config.colors.background, color: config.colors.text }}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-40 px-4 py-3 flex justify-between items-center shadow-sm" style={{ backgroundColor: config.colors.card }}>
        <span className="font-bold" style={{ color: config.colors.primary }}>Admin</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu /></button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-xl md:shadow-none`} style={sidebarStyle}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold" style={{ color: config.colors.primary }}>{config.name}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-14 md:mt-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all`}
              style={activeTab === item.id ? { backgroundColor: `${config.colors.primary}20`, color: config.colors.primary, fontWeight: 'bold' } : { opacity: 0.7 }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100/10">
          <button onClick={toggleAdmin} className="w-full text-sm opacity-60 hover:opacity-100">Sair</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
        <PlanGuard>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'professionals' && <ProfessionalsView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'appointments' && <AppointmentsView />}
          {activeTab === 'reports' && <ReportsView />}
        </PlanGuard>
      </main>
    </div>
  );
};

// --- Sub-Views ---

const ReportsView = () => {
    const { appointments, services, professionals, config } = useStore();
    
    // Logic for Reports
    const confirmedApps = appointments.filter(a => a.status === 'confirmed');
    const totalRevenue = confirmedApps.reduce((acc, curr) => {
        const s = services.find(serv => serv.id === curr.serviceId);
        return acc + (s ? s.price : 0);
    }, 0);

    // Mock Monthly Data for Chart
    const months = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr'];
    const monthlyData = [0, 35, 70, 105, 140]; // Demo data
    const maxVal = Math.max(...monthlyData);

    // Pie Chart Data (Apps per Pro)
    const appsPerPro = professionals.map(p => ({
        name: p.name,
        count: confirmedApps.filter(a => a.professionalId === p.id).length,
        color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random hex
    }));
    
    const totalApps = appsPerPro.reduce((a, b) => a + b.count, 0) || 1;
    let currentDeg = 0;
    const conicGradient = appsPerPro.map(p => {
        const deg = (p.count / totalApps) * 360;
        const str = `${p.color} ${currentDeg}deg ${currentDeg + deg}deg`;
        currentDeg += deg;
        return str;
    }).join(', ');

    const exportCsv = () => {
        const headers = "Cliente,Serviço,Profissional,Data,Valor\n";
        const rows = confirmedApps.map(a => {
            const s = services.find(x => x.id === a.serviceId);
            const p = professionals.find(x => x.id === a.professionalId);
            return `${a.clientName},${s?.name},${p?.name},${a.date},${s?.price}`;
        }).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'relatorio_studio.csv'; a.click();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Relatórios</h2>
                <button onClick={exportCsv} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Exportar CSV</button>
            </div>
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl border bg-opacity-50" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                    <h3 className="opacity-70 text-sm">Faturamento Total</h3>
                    <p className="text-3xl font-bold text-green-500">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-6 rounded-xl border bg-opacity-50" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                    <h3 className="opacity-70 text-sm">Total Agendamentos</h3>
                    <p className="text-3xl font-bold">{confirmedApps.length}</p>
                </div>
                <div className="p-6 rounded-xl border bg-opacity-50" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                    <h3 className="opacity-70 text-sm">Profissionais Ativos</h3>
                    <p className="text-3xl font-bold" style={{ color: config.colors.primary }}>{professionals.filter(p=>p.isActive).length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart (CSS) */}
                <div className="p-6 rounded-xl border" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                    <h3 className="font-bold mb-6">Faturamento Mensal (Demo)</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {monthlyData.map((val, idx) => (
                            <div key={idx} className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full rounded-t-lg transition-all hover:opacity-80 relative" style={{ height: `${(val/maxVal)*100}%`, backgroundColor: config.colors.primary }}>
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                                </div>
                                <span className="text-xs opacity-60">{months[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pie Chart (CSS) */}
                <div className="p-6 rounded-xl border" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                    <h3 className="font-bold mb-6">Atendimentos por Profissional</h3>
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-full" style={{ background: `conic-gradient(${conicGradient || '#eee 0deg 360deg'})` }}></div>
                        <div className="space-y-2">
                            {appsPerPro.map((p, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                                    <span>{p.name} ({p.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsView = () => {
    const { config, updateConfig, uploadImage } = useStore();
    const logoRef = useRef<HTMLInputElement>(null);

    const handleColor = (key: keyof typeof config.colors, val: string) => {
        updateConfig({ colors: { ...config.colors, [key]: val } });
    };

    const toggleDay = (dayIndex: number) => {
        const days = config.hours.workDays.includes(dayIndex) 
            ? config.hours.workDays.filter(d => d !== dayIndex) 
            : [...config.hours.workDays, dayIndex].sort();
        updateConfig({ hours: { ...config.hours, workDays: days } });
    };

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {/* Identity */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                <h3 className="font-bold mb-4">Identidade Visual</h3>
                <div className="space-y-4">
                    <input className="w-full p-2 rounded border bg-transparent" value={config.name} onChange={e => updateConfig({ name: e.target.value })} placeholder="Nome do Salão" />
                    <textarea className="w-full p-2 rounded border bg-transparent" value={config.description} onChange={e => updateConfig({ description: e.target.value })} placeholder="Descrição curta" />
                    <div className="flex items-center gap-4">
                        {config.logoUrl && <img src={config.logoUrl} className="w-16 h-16 rounded object-cover" />}
                        <button onClick={() => logoRef.current?.click()} className="text-sm underline">Trocar Logo</button>
                        <input type="file" ref={logoRef} hidden onChange={async (e) => {
                            if (e.target.files?.[0]) {
                                const url = await uploadImage(e.target.files[0], 'logos');
                                if (url) updateConfig({ logoUrl: url });
                            }
                        }} />
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                <h3 className="font-bold mb-4">Paleta de Cores</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs opacity-70">Primária</label><input type="color" className="w-full h-10 rounded" value={config.colors.primary} onChange={e => handleColor('primary', e.target.value)} /></div>
                    <div><label className="text-xs opacity-70">Secundária</label><input type="color" className="w-full h-10 rounded" value={config.colors.secondary} onChange={e => handleColor('secondary', e.target.value)} /></div>
                    <div><label className="text-xs opacity-70">Fundo</label><input type="color" className="w-full h-10 rounded" value={config.colors.background} onChange={e => handleColor('background', e.target.value)} /></div>
                    <div><label className="text-xs opacity-70">Card</label><input type="color" className="w-full h-10 rounded" value={config.colors.card} onChange={e => handleColor('card', e.target.value)} /></div>
                    <div><label className="text-xs opacity-70">Texto</label><input type="color" className="w-full h-10 rounded" value={config.colors.text} onChange={e => handleColor('text', e.target.value)} /></div>
                    <div><label className="text-xs opacity-70">Preços</label><input type="color" className="w-full h-10 rounded" value={config.colors.price} onChange={e => handleColor('price', e.target.value)} /></div>
                </div>
            </div>

            {/* Contact */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                <h3 className="font-bold mb-4">Contato & Redes</h3>
                <div className="space-y-3">
                    <input className="w-full p-2 rounded border bg-transparent" value={config.contact.phone} onChange={e => updateConfig({ contact: { ...config.contact, phone: e.target.value } })} placeholder="WhatsApp (5511...)" />
                    <input className="w-full p-2 rounded border bg-transparent" value={config.contact.address} onChange={e => updateConfig({ contact: { ...config.contact, address: e.target.value } })} placeholder="Endereço Completo" />
                    <input className="w-full p-2 rounded border bg-transparent" value={config.contact.instagram} onChange={e => updateConfig({ contact: { ...config.contact, instagram: e.target.value } })} placeholder="Instagram (sem @)" />
                    <input className="w-full p-2 rounded border bg-transparent" value={config.contact.facebook} onChange={e => updateConfig({ contact: { ...config.contact, facebook: e.target.value } })} placeholder="Facebook (username)" />
                    <input className="w-full p-2 rounded border bg-transparent" value={config.contact.tiktok} onChange={e => updateConfig({ contact: { ...config.contact, tiktok: e.target.value } })} placeholder="TikTok (sem @)" />
                </div>
            </div>

            {/* Hours */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                <h3 className="font-bold mb-4">Horários de Funcionamento</h3>
                <div className="flex gap-4 mb-4">
                    <input type="time" value={config.hours.open} onChange={e => updateConfig({ hours: { ...config.hours, open: e.target.value } })} className="p-2 border rounded bg-transparent" />
                    <span className="self-center">até</span>
                    <input type="time" value={config.hours.close} onChange={e => updateConfig({ hours: { ...config.hours, close: e.target.value } })} className="p-2 border rounded bg-transparent" />
                </div>
                <h4 className="text-xs opacity-70 mb-2">Dias de Funcionamento</h4>
                <div className="flex flex-wrap gap-2">
                    {days.map((d, i) => (
                        <button 
                            key={i} 
                            onClick={() => toggleDay(i)} 
                            className={`px-3 py-1 rounded text-xs border ${config.hours.workDays.includes(i) ? 'bg-green-500 text-white border-green-500' : 'opacity-50'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ServicesView = () => {
  const { services, addService, updateService, deleteService, config } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (s: Service) => { setEditingId(s.id); setFormData(s); setIsFormOpen(true); };
  const handleNew = () => { setEditingId(null); setFormData({ name: '', price: 0, duration: 30, isActive: true }); setIsFormOpen(true); };
  
  const save = async () => {
    if (!formData.name) return;
    if (editingId) await updateService(editingId, formData);
    else await addService(formData as any);
    setIsFormOpen(false);
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Serviços</h2>
          <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ background: config.colors.primary }}><Plus size={16}/> Novo</button>
       </div>
       
       {isFormOpen && (
         <div className="p-6 rounded-xl border mb-6 space-y-4" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
            <h3 className="font-bold">{editingId ? 'Editar' : 'Novo'} Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input placeholder="Nome" className="p-2 border rounded bg-transparent" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
               <input type="number" placeholder="Preço" className="p-2 border rounded bg-transparent" value={formData.price} onChange={e=>setFormData({...formData, price: Number(e.target.value)})} />
               <input type="number" placeholder="Duração (min)" className="p-2 border rounded bg-transparent" value={formData.duration} onChange={e=>setFormData({...formData, duration: Number(e.target.value)})} />
               <input placeholder="Descrição" className="p-2 border rounded bg-transparent" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2">
               <button onClick={()=>setIsFormOpen(false)} className="px-3 py-1 text-sm opacity-60">Cancelar</button>
               <button onClick={save} className="px-3 py-1 bg-green-600 text-white rounded">Salvar</button>
            </div>
         </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map(s => (
             <div key={s.id} className={`p-4 rounded-xl border ${!s.isActive ? 'opacity-50' : ''}`} style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                <div className="flex justify-between">
                   <h3 className="font-bold">{s.name}</h3>
                   <span style={{ color: config.colors.price }}>{formatCurrency(s.price)}</span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => updateService(s.id, { isActive: !s.isActive })} className="text-xs px-2 py-1 border rounded">{s.isActive ? 'Desativar' : 'Ativar'}</button>
                    <button onClick={() => handleEdit(s)} className="text-blue-500"><Edit2 size={16}/></button>
                    <button onClick={() => { if(confirm('Excluir permanentemente?')) deleteService(s.id) }} className="text-red-500"><Trash2 size={16}/></button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

const ProfessionalsView = () => {
    // Similar implementation to Services, but with Photo Upload and Multi-select Services
    // For brevity, using placeholder structure which user can expand based on ServicesView pattern
    const { professionals, addProfessional, updateProfessional, deleteProfessional, uploadImage, config, services } = useStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Professional>>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!formData.name) return;
        if (editingId) await updateProfessional(editingId, formData);
        else await addProfessional(formData as any);
        setIsFormOpen(false);
    }

    return (
        <div>
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Profissionais</h2>
              <button onClick={() => { setEditingId(null); setFormData({ services: [], isActive: true }); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded text-white" style={{ background: config.colors.primary }}><Plus size={16}/> Novo</button>
           </div>
           
           {isFormOpen && (
               <div className="p-6 rounded-xl border mb-6" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                   {/* Simplified Form for Pro */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <input placeholder="Nome" className="p-2 border rounded bg-transparent" value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} />
                       <input placeholder="Especialidade" className="p-2 border rounded bg-transparent" value={formData.specialty || ''} onChange={e=>setFormData({...formData, specialty: e.target.value})} />
                       <input type="file" onChange={async (e) => {
                           if(e.target.files?.[0]) {
                               const url = await uploadImage(e.target.files[0], 'profiles');
                               if(url) setFormData({...formData, photoUrl: url});
                           }
                       }} />
                       {formData.photoUrl && <img src={formData.photoUrl} className="w-10 h-10 rounded-full"/>}
                   </div>
                   {/* Service Selector */}
                   <div className="flex flex-wrap gap-2 mb-4">
                       {services.map(s => (
                           <button key={s.id} onClick={() => {
                               const curr = formData.services || [];
                               setFormData({...formData, services: curr.includes(s.id) ? curr.filter(x=>x!==s.id) : [...curr, s.id]});
                           }} className={`text-xs px-2 py-1 border rounded ${formData.services?.includes(s.id) ? 'bg-pink-500 text-white' : ''}`}>
                               {s.name}
                           </button>
                       ))}
                   </div>
                   <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Salvar</button>
                   <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 ml-2">Cancelar</button>
               </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {professionals.map(p => (
                   <div key={p.id} className="p-6 rounded-xl border text-center relative" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                       <img src={p.photoUrl} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" />
                       <h3 className="font-bold">{p.name}</h3>
                       <p className="text-sm opacity-60 mb-4">{p.specialty}</p>
                       <div className="flex justify-center gap-2">
                           <button onClick={() => { setEditingId(p.id); setFormData(p); setIsFormOpen(true); }}><Edit2 size={16}/></button>
                           <button onClick={() => { if(confirm('Excluir?')) deleteProfessional(p.id); }} className="text-red-500"><Trash2 size={16}/></button>
                       </div>
                   </div>
               ))}
           </div>
        </div>
    )
};

const DashboardView = () => ( <div className="p-10 text-center opacity-50">Selecione uma aba para gerenciar.</div> );

const AppointmentsView = () => {
    const { appointments, cancelAppointment, config } = useStore();
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Agendamentos</h2>
            {appointments.length === 0 && <p className="opacity-50">Sem agendamentos.</p>}
            {appointments.map(a => (
                <div key={a.id} className="flex justify-between items-center p-4 border rounded-xl" style={{ backgroundColor: config.colors.card, borderColor: `${config.colors.text}10` }}>
                    <div>
                        <p className="font-bold">{a.clientName} <span className="font-normal opacity-60">({a.clientPhone})</span></p>
                        <p className="text-sm opacity-70">{formatDateBr(a.date)} às {a.time} • Status: {a.status}</p>
                    </div>
                    {a.status === 'confirmed' && (
                        <button onClick={() => { if(confirm('Cancelar agendamento?')) cancelAppointment(a.id) }} className="text-red-500 border border-red-500 px-3 py-1 rounded text-sm hover:bg-red-500 hover:text-white transition-colors">
                            Cancelar
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};