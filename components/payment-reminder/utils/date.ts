const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export interface ReminderDateInfo {
  dateLabel: string;
  countdownLabel: string;
  daysRemaining: number;
}

export function getReminderDateInfo(day: number, month: number, today = new Date()): ReminderDateInfo {
  const todayOnly = startOfDay(today);
  const picked = new Date(today.getFullYear(), month - 1, day);
  if (picked < todayOnly) picked.setFullYear(today.getFullYear() + 1);

  const dateLabel = `${MONTH_NAMES[month - 1]} ${day} ${DAY_NAMES[picked.getDay()]}`;

  const daysRemaining = Math.round((picked.getTime() - todayOnly.getTime()) / MS_PER_DAY);
  const countdownLabel =
    daysRemaining === 0 ? 'Today' : daysRemaining === 1 ? 'Tomorrow' : `In ${daysRemaining} days`;

  return { dateLabel, countdownLabel, daysRemaining };
}

