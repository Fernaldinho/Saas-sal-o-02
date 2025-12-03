import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getDayOfWeek, getTodayString } from '../utils/dateUtils';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  blockedDates?: string[]; // YYYY-MM-DD
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, blockedDates = [] }) => {
  const { config } = useStore();
  const today = new Date();
  
  // State for current view (year/month)
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startDay = getFirstDayOfMonth(currentMonth, currentYear);
  const todayString = getTodayString();

  const days = [];
  // Empty slots for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = getDayOfWeek(dateStr);
    
    // Check constraints
    const isPast = dateStr < todayString;
    const isWorkDay = config.hours.workDays.includes(dayOfWeek);
    const isBlocked = blockedDates.includes(dateStr);
    const isDisabled = isPast || !isWorkDay || isBlocked;
    const isSelected = selectedDate === dateStr;

    days.push(
      <button
        key={day}
        disabled={isDisabled}
        onClick={() => onSelectDate(dateStr)}
        className={`
          h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
          ${isDisabled ? 'text-gray-600 cursor-not-allowed opacity-50' : 'hover:bg-gray-700 text-white'}
          ${isSelected ? 'font-bold shadow-lg transform scale-105' : ''}
        `}
        style={isSelected ? {
          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
          color: '#111827'
        } : {}}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-700 rounded-full text-gold-400">
          <ChevronLeft size={20} />
        </button>
        <span className="text-white font-semibold capitalize">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-700 rounded-full text-gold-400">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="h-10 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-600"></div> Indisponível
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{background: config.colors.primary}}></div> Selecionado
        </div>
      </div>
    </div>
  );
};