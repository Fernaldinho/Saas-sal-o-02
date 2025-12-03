import { DateTime } from 'luxon';

const TIMEZONE = 'America/Sao_Paulo';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const getTodayString = (): string => {
  return DateTime.now().setZone(TIMEZONE).toFormat('yyyy-MM-dd');
};

export const formatDateBr = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const getDayOfWeek = (dateString: string): number => {
  // ISO date string 'YYYY-MM-DD'
  return DateTime.fromISO(dateString, { zone: TIMEZONE }).weekday % 7; 
  // Luxon: 1=Mon...7=Sun. JS Date: 0=Sun...6=Sat. 
  // Modulo 7 maps 7(Sun) to 0, which matches JS/Our config.
};

export const generateTimeSlots = (
  start: string,
  end: string,
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  
  let current = DateTime.fromFormat(start, 'HH:mm', { zone: TIMEZONE });
  const endTime = DateTime.fromFormat(end, 'HH:mm', { zone: TIMEZONE });

  while (current < endTime) {
    slots.push(current.toFormat('HH:mm'));
    current = current.plus({ minutes: intervalMinutes });
  }

  return slots;
};

// Convert Local Date+Time to UTC Timestamp for DB
export const toUtcTimestamp = (date: string, time: string): string => {
  return DateTime.fromISO(`${date}T${time}`, { zone: TIMEZONE }).toUTC().toISO() || '';
};