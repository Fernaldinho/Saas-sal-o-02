import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Scissors, Instagram, Facebook, MapPin, ArrowRight, Menu, X, Phone, Check } from 'lucide-react';
import { ClientPanel } from './ClientPanel';
import { Professional } from '../types';

interface LandingPageProps {
  onBook: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBook }) => {
  const { config, services, professionals, toggleAdmin } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProForBooking, setSelectedProForBooking] = useState<Professional | null>(null);

  if (selectedProForBooking) {
    return <ClientPanel onBack={() => setSelectedProForBooking(null)} initialProfessional={selectedProForBooking} />;
  }

  // Styles based on Config
  const primary = config.colors.primary;
  const secondary = config.colors.secondary;
  const bg = config.colors.background;
  const text = config.colors.text;

  const gradientText = {
    background: `linear-gradient(to right, ${primary}, ${secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const gradientBg = {
    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
    color: config.colors.buttonText
  };

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ backgroundColor: bg, color: text }}>
      
      {/* Header */}
      <nav className="fixed w-full z-50 backdrop-blur-md border-b" style={{ borderColor: `${text}10`, backgroundColor: `${bg}cc` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
               {config.logoUrl ? <img src={config.logoUrl} className="w-10 h-10 rounded-full object-cover"/> : <div className="w-10 h-10 rounded-full flex items-center justify-center" style={gradientBg}><Scissors size={20}/></div>}
               <span className="font-serif text-xl font-bold">{config.name}</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
               <button onClick={() => scrollTo('professionals')} className="font-medium hover:opacity-70">Profissionais</button>
               <button onClick={() => scrollTo('contact')} className="font-medium hover:opacity-70">Contato</button>
               <button onClick={onBook} className="px-6 py-2.5 rounded-full font-bold shadow-lg hover:brightness-110 transition-all" style={gradientBg}>
                 Agendar Agora
               </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
               <button onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X/> : <Menu/>}</button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
           <div className="md:hidden p-4 space-y-4 border-b" style={{ borderColor: `${text}10`, backgroundColor: bg }}>
              <button onClick={() => scrollTo('professionals')} className="block w-full text-left py-2 font-medium border-b border-gray-100/10">Profissionais</button>
              <button onClick={() => scrollTo('contact')} className="block w-full text-left py-2 font-medium border-b border-gray-100/10">Contato</button>
              <button onClick={onBook} className="w-full py-3 rounded-lg font-bold shadow-md" style={gradientBg}>Agendar Agora</button>
           </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: primary }}></div>
         <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: secondary }}></div>

         <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
              Realce Sua <br/> <span style={gradientText}>Beleza Natural</span>
            </h1>
            <p className="text-xl opacity-70 max-w-2xl mx-auto leading-relaxed">{config.description}</p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
               <button onClick={onBook} className="px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2" style={gradientBg}>
                  Agendar Horário <ArrowRight size={20} />
               </button>
               <button onClick={() => scrollTo('professionals')} className="px-8 py-4 rounded-full font-bold text-lg border hover:bg-gray-50/5 transition-colors" style={{ borderColor: `${text}20` }}>
                  Conhecer Profissionais
               </button>
            </div>
         </div>
      </section>

      {/* Professionals Section - Lovable Style */}
      <section id="professionals" className="py-20 px-4" style={{ backgroundColor: config.colors.card }}>
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-serif font-bold mb-4">Nossa Equipe</h2>
               <p className="opacity-60 text-lg">Especialistas prontos para transformar seu visual.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {professionals.filter(p => p.isActive).map(prof => {
                  const profServices = services.filter(s => prof.services.includes(s.id));
                  return (
                     <div key={prof.id} className="group rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-white" style={{ borderColor: `${text}10`, backgroundColor: bg }}>
                        {/* Big Photo */}
                        <div className="h-80 overflow-hidden relative">
                           <img src={prof.photoUrl} alt={prof.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                           <div className="absolute bottom-4 left-4 text-white">
                              <h3 className="text-2xl font-bold">{prof.name}</h3>
                              <p className="font-medium opacity-90">{prof.specialty}</p>
                           </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                           <p className="text-sm opacity-70 mb-4 line-clamp-2">{prof.description || "Profissional dedicada a excelência e cuidado."}</p>
                           
                           {/* Compact Service List */}
                           <div className="mb-6 flex flex-wrap gap-2">
                              {profServices.slice(0, 4).map(s => (
                                 <span key={s.id} className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                                    {s.name}
                                 </span>
                              ))}
                              {profServices.length > 4 && <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-400">+{profServices.length - 4}</span>}
                           </div>

                           <button 
                             onClick={() => setSelectedProForBooking(prof)}
                             className="mt-auto w-full py-3 rounded-xl font-bold shadow-md hover:brightness-105 transition-all"
                             style={gradientBg}
                           >
                              Agendar com {prof.name.split(' ')[0]}
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </section>

      {/* Footer (Simplified) */}
      <footer id="contact" className="py-16 border-t" style={{ borderColor: `${text}10` }}>
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={gradientBg}><Scissors size={14}/></div>
                  <span className="font-serif font-bold text-lg">{config.name}</span>
               </div>
               <p className="opacity-60 text-sm leading-relaxed">{config.description}</p>
            </div>
            
            <div>
               <h4 className="font-bold mb-6">Contato</h4>
               <ul className="space-y-3 opacity-70 text-sm">
                  <li className="flex items-center gap-3"><MapPin size={16}/> {config.contact.address}</li>
                  <li className="flex items-center gap-3"><Phone size={16}/> {config.contact.phone}</li>
                  <li>
                     <a href={`https://wa.me/${config.contact.phone}`} target="_blank" className="text-green-600 font-bold hover:underline">WhatsApp Oficial</a>
                  </li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold mb-6">Redes Sociais</h4>
               <div className="flex gap-4">
                  {config.contact.instagram && <a href={`https://instagram.com/${config.contact.instagram}`} className="opacity-70 hover:opacity-100"><Instagram/></a>}
                  {config.contact.facebook && <a href={`https://facebook.com/${config.contact.facebook}`} className="opacity-70 hover:opacity-100"><Facebook/></a>}
                  {config.contact.tiktok && <a href={`https://tiktok.com/@${config.contact.tiktok}`} className="opacity-70 hover:opacity-100">TikTok</a>}
               </div>
               <div className="mt-8 text-xs opacity-40">
                  <button onClick={toggleAdmin}>Admin Login</button>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};