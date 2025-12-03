import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Calendar } from '../components/Calendar';
import { formatCurrency, generateTimeSlots, formatDateBr } from '../utils/dateUtils';
import { ChevronLeft, Check, User, Scissors, Calendar as CalIcon, Home } from 'lucide-react';
import { Service, Professional } from '../types';

type Step = 'service' | 'professional' | 'datetime' | 'confirm' | 'success';

interface ClientPanelProps {
  onBack: () => void;
  initialProfessional?: Professional | null;
}

export const ClientPanel: React.FC<ClientPanelProps> = ({ onBack, initialProfessional = null }) => {
  const { config, services, professionals, addAppointment, toggleAdmin } = useStore();
  
  // If an initial professional is passed, we skip to service selection for that pro, or just preselect
  const [step, setStep] = useState<Step>(initialProfessional ? 'service' : 'professional');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(initialProfessional);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });

  // --- Dynamic Styles ---
  const primaryGradient = `linear-gradient(to right, ${config.colors.primary}, ${config.colors.secondary})`;
  
  // Styles
  const containerStyle = {
    backgroundColor: config.colors.background,
    color: config.colors.text
  };

  const cardStyle = {
    backgroundColor: config.colors.card,
    borderColor: 'rgba(0,0,0,0.05)'
  };

  const buttonStyle = {
    background: primaryGradient,
    color: config.colors.buttonText
  };

  const buttonClass = "w-full py-3 rounded-lg font-bold shadow-lg transform transition active:scale-95 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed";

  // --- Handlers ---

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleBooking = () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !clientInfo.name) return;

    // Save to local "database"
    addAppointment({
      clientId: 'guest',
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      professionalId: selectedProfessional.id,
      serviceId: selectedService.id,
      date: selectedDate,
      time: selectedTime,
    });

    // Generate WhatsApp Link
    const message = `Olá! Gostaria de confirmar meu agendamento no *${config.name}*.\n\n` +
      `👤 *Cliente:* ${clientInfo.name}\n` +
      `💅 *Serviço:* ${selectedService.name}\n` +
      `💆‍♀️ *Profissional:* ${selectedProfessional.name}\n` +
      `📅 *Data:* ${formatDateBr(selectedDate)}\n` +
      `⏰ *Horário:* ${selectedTime}\n\n` +
      `Aguardo confirmação!`;
    
    const url = `https://wa.me/${config.contact.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    setStep('success');
  };

  const reset = () => {
    onBack();
  };

  // --- Renders ---

  const renderHeader = () => (
    <div className="text-center mb-8 pt-4">
      {config.logoUrl ? (
        <img src={config.logoUrl} alt="Logo" className="w-20 h-20 mx-auto rounded-full object-cover mb-4 shadow-md" />
      ) : (
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 text-white shadow-md" style={{ background: primaryGradient }}>
          <Scissors size={32} />
        </div>
      )}
      <h1 className="text-2xl font-bold mb-2" style={{ color: config.colors.text }}>{config.name}</h1>
    </div>
  );

  const BackButton = () => {
    return (
      <button 
        onClick={() => {
            if(step === 'service' && initialProfessional) return onBack();
            if(step === 'professional') return onBack();
            if(step === 'service') setStep('professional');
            if(step === 'datetime') setStep('service');
            if(step === 'confirm') setStep('datetime');
        }}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium z-10"
      >
        <ChevronLeft size={24} /> Voltar
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative font-sans transition-colors duration-300" style={{ backgroundColor: config.colors.background }}>
      <div className="w-full max-w-lg min-h-[80vh] flex flex-col relative pb-10">
        
        {step !== 'success' && <BackButton />}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderHeader()}

          {/* STEP 1: Professional (if not selected via landing) */}
          {step === 'professional' && !initialProfessional && (
             <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold mb-4" style={{ color: config.colors.text }}>Escolha o Profissional</h2>
                <div className="grid grid-cols-2 gap-4">
                    {professionals.filter(p => p.isActive).map(prof => (
                        <button
                          key={prof.id}
                          onClick={() => { setSelectedProfessional(prof); setStep('service'); }}
                          className="p-4 rounded-xl border flex flex-col items-center gap-3 hover:shadow-md transition-all"
                          style={cardStyle}
                        >
                          <img src={prof.photoUrl} alt={prof.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                          <div className="text-center">
                            <h3 className="font-bold text-sm" style={{ color: config.colors.text }}>{prof.name}</h3>
                            <p className="text-xs opacity-70" style={{ color: config.colors.text }}>{prof.specialty}</p>
                          </div>
                        </button>
                    ))}
                </div>
             </div>
          )}

          {/* STEP 2: Services */}
          {step === 'service' && selectedProfessional && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold mb-4" style={{ color: config.colors.text }}>
                Serviços de {selectedProfessional.name.split(' ')[0]}
              </h2>
              {services
                 .filter(s => s.isActive && selectedProfessional.services.includes(s.id))
                 .map(service => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep('datetime'); }}
                  className="w-full p-4 rounded-xl border flex justify-between items-center hover:shadow-md transition-all group"
                  style={cardStyle}
                >
                  <div className="text-left">
                    <h3 className="font-bold group-hover:text-pink-500 transition-colors" style={{ color: config.colors.text }}>{service.name}</h3>
                    <p className="text-xs opacity-70 max-w-[200px]" style={{ color: config.colors.text }}>{service.duration} min • {service.description}</p>
                  </div>
                  <span className="font-bold text-lg" style={{ color: config.colors.price }}>
                    {formatCurrency(service.price)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 3: Date & Time */}
          {step === 'datetime' && selectedProfessional && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold" style={{ color: config.colors.text }}>Data e Horário</h2>
              
              <div className="bg-opacity-50 p-2 rounded-xl" style={cardStyle}>
                 <Calendar 
                    selectedDate={selectedDate} 
                    onSelectDate={handleDateSelect}
                 />
              </div>

              {selectedDate && (
                <div className="animate-slide-up">
                   <h3 className="text-sm font-medium opacity-70 mb-3" style={{ color: config.colors.text }}>Horários Disponíveis</h3>
                   <div className="grid grid-cols-4 gap-2">
                     {generateTimeSlots(
                        selectedProfessional.workHoursStart,
                        selectedProfessional.workHoursEnd,
                        selectedService?.duration
                     ).map(time => (
                       <button
                         key={time}
                         onClick={() => setSelectedTime(time)}
                         className={`py-2 rounded-lg text-sm font-medium border transition-colors`}
                         style={
                           selectedTime === time 
                            ? { background: primaryGradient, color: config.colors.buttonText, borderColor: 'transparent' }
                            : { backgroundColor: 'transparent', color: config.colors.text, borderColor: 'rgba(0,0,0,0.1)' }
                         }
                       >
                         {time}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              <button 
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep('confirm')}
                className={buttonClass}
                style={selectedDate && selectedTime ? buttonStyle : { backgroundColor: '#e5e7eb', color: '#9ca3af' }}
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold" style={{ color: config.colors.text }}>Confirmar</h2>
              
              <div className="p-5 rounded-xl border space-y-4 shadow-sm" style={cardStyle}>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-10" style={{ backgroundColor: config.colors.primary, color: config.colors.primary }}><Scissors size={18} /></div>
                    <div>
                       <p className="text-xs opacity-60" style={{ color: config.colors.text }}>Serviço</p>
                       <p className="font-bold" style={{ color: config.colors.text }}>{selectedService?.name}</p>
                       <p className="text-xs font-bold" style={{ color: config.colors.price }}>{formatCurrency(selectedService!.price)}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-10" style={{ backgroundColor: config.colors.primary, color: config.colors.primary }}><User size={18} /></div>
                    <div>
                       <p className="text-xs opacity-60" style={{ color: config.colors.text }}>Profissional</p>
                       <p className="font-bold" style={{ color: config.colors.text }}>{selectedProfessional?.name}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-10" style={{ backgroundColor: config.colors.primary, color: config.colors.primary }}><CalIcon size={18} /></div>
                    <div>
                       <p className="text-xs opacity-60" style={{ color: config.colors.text }}>Data e Hora</p>
                       <p className="font-bold capitalize" style={{ color: config.colors.text }}>{formatDateBr(selectedDate!)} às {selectedTime}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-sm opacity-60" style={{ color: config.colors.text }}>Seus Dados</label>
                 <input 
                   placeholder="Seu Nome" 
                   className="w-full border rounded-lg p-3 outline-none focus:ring-2"
                   style={{ backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.1)', color: config.colors.text }}
                   value={clientInfo.name}
                   onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                 />
                 <input 
                   placeholder="Seu WhatsApp (apenas números)" 
                   className="w-full border rounded-lg p-3 outline-none focus:ring-2"
                   style={{ backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.1)', color: config.colors.text }}
                   value={clientInfo.phone}
                   onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
                 />
              </div>

              <button 
                onClick={handleBooking}
                disabled={!clientInfo.name || !clientInfo.phone}
                className={buttonClass}
                style={clientInfo.name && clientInfo.phone ? buttonStyle : { backgroundColor: '#e5e7eb', color: '#9ca3af' }}
              >
                Confirmar no WhatsApp
              </button>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 'success' && (
            <div className="text-center py-10 animate-fade-in h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-green-100">
                 <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: config.colors.text }}>Agendamento Enviado!</h2>
              <p className="opacity-70 mb-8 max-w-xs mx-auto" style={{ color: config.colors.text }}>
                Você será redirecionado para o WhatsApp para finalizar a confirmação.
              </p>
              <button 
                onClick={reset}
                className="underline text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: config.colors.primary }}
              >
                Voltar ao início
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};