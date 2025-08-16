// Format date with various display options
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' | 'date-only' | 'month-year' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }

    switch (format) {
        case 'short':
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        case 'long':
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        case 'time':
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        case 'date-only':
            return d.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            });
        case 'month-year':
            return d.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        default:
            return d.toLocaleDateString();
    }
};

// Format time with various display options
export const formatTime = (date: Date | string, format: '12h' | '24h' | 'short' = '12h'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
        return 'Invalid Time';
    }

    switch (format) {
        case '12h':
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        case '24h':
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        case 'short':
            return d.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        default:
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
    }
};

export const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${formatDate(d, 'short')} at ${formatTime(d)}`;
};

export const isToday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
};

export const getRelativeDate = (date: Date | string): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return formatDate(date, 'short');
};

// Calculate time duration between two dates/times
export const calculateDuration = (startTime: Date | string, endTime: Date | string): {
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
    totalSeconds: number;
    formatted: string;
} => {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

    const diffMs = end.getTime() - start.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (hours > 0) {
        formatted = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        formatted = `${minutes}m ${seconds}s`;
    } else {
        formatted = `${seconds}s`;
    }

    return {
        hours,
        minutes,
        seconds,
        totalMinutes,
        totalSeconds,
        formatted
    };
};

// Format duration in seconds to readable format
export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${secs}s`;
    }
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

export const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

export const getDaysDifference = (startDate: Date | string, endDate: Date | string): number => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get current date/time information
export const getCurrentDate = (): Date => new Date();

export const getCurrentWeek = (): { start: Date; end: Date } => getCurrentWeekDates();

export const getCurrentMonth = (): { start: Date; end: Date } => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
        start: startOfDay(start),
        end: endOfDay(end)
    };
};

// Get date ranges for reports
export const getDateRange = (period: 'today' | 'week' | 'month' | 'year'): { start: Date; end: Date } => {
    const today = new Date();

    switch (period) {
        case 'today':
            return {
                start: startOfDay(today),
                end: endOfDay(today)
            };
        case 'week':
            return getCurrentWeekDates();
        case 'month':
            return getCurrentMonth();
        case 'year':
            return {
                start: new Date(today.getFullYear(), 0, 1),
                end: new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
            };
        default:
            return {
                start: startOfDay(today),
                end: endOfDay(today)
            };
    }
};

// Parse time string (HH:MM) to Date object
export const parseTimeString = (timeString: string, baseDate?: Date): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = baseDate ? new Date(baseDate) : new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

// Check if a date is a weekend
export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Check if a date is a holiday (placeholder - you would integrate with holiday API)
export const isHoliday = (date: Date): boolean => {
    // This is a placeholder. In a real app, you'd check against a holiday API or database
    return false;
};

// Get the next working day (skip weekends)
export const getNextWorkingDay = (date: Date): Date => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    while (isWeekend(nextDay)) {
        nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
};

// Get age from birth date
export const calculateAge = (birthDate: Date | string): number => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

// Time zone utilities
export const getTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const convertToTimezone = (date: Date, timezone: string): string => {
    return date.toLocaleString('en-US', { timeZone: timezone });
};