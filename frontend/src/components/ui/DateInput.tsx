import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value?: string; // ISO string (YYYY-MM-DD)
  onChange?: (value: string) => void; // ISO string (YYYY-MM-DD)
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  className,
  placeholder = 'MM/DD/YYYY',
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Convert ISO string to MM/DD/YYYY format
  const formatDateForDisplay = (isoString: string): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return '';
    }
  };

  // Convert MM/DD/YYYY to ISO string
  const parseDateFromDisplay = (displayString: string): string => {
    if (!displayString) return '';
    const match = displayString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return '';

    const [, month, day, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (isNaN(date.getTime())) return '';

    // Validate date components
    if (parseInt(month) < 1 || parseInt(month) > 12) return '';
    if (parseInt(day) < 1 || parseInt(day) > 31) return '';

    return date.toISOString().split('T')[0];
  };

  // Update display value when value prop changes
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value || ''));
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize currentMonth to selected date or today
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    } else {
      setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    }
  }, [value]);

  const handleCalendarClick = () => {
    setShowPicker(!showPicker);
    if (!showPicker && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    // Extract year, month, day directly to avoid any timezone conversion issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create the date string directly without using Date constructor or toISOString
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    setDisplayValue(formatDateForDisplay(dateString));
    if (onChange) {
      onChange(dateString);
    }
    setShowPicker(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month - ensure they're created in local timezone
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateSelected = (date: Date) => {
    if (!value) return false;
    // Compare dates by year, month, day only to avoid timezone issues
    const selectedDate = new Date(value);
    return selectedDate.getFullYear() === date.getFullYear() &&
           selectedDate.getMonth() === date.getMonth() &&
           selectedDate.getDate() === date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return today.getFullYear() === date.getFullYear() &&
           today.getMonth() === date.getMonth() &&
           today.getDate() === date.getDate();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Only call onChange if we have a complete valid date
    const isoValue = parseDateFromDisplay(inputValue);
    if (isoValue && onChange) {
      onChange(isoValue);
    }
  };

  const handleBlur = () => {
    // On blur, try to parse and reformat the date
    const isoValue = parseDateFromDisplay(displayValue);
    if (isoValue) {
      setDisplayValue(formatDateForDisplay(isoValue));
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={handleCalendarClick}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-ring focus:outline-none focus:text-ring"
      >
        <Calendar className="h-4 w-4" />
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full mb-1 z-50 w-64 bg-card border border-border rounded-md shadow-lg p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-accent rounded-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-sm">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-accent rounded-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => date && handleDateSelect(date)}
                disabled={!date}
                className={cn(
                  'h-8 w-8 text-sm rounded-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors',
                  date && isDateSelected(date) && 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)] ring-2 ring-[var(--primary)]/50',
                  date && isToday(date) && !isDateSelected(date) && 'bg-[var(--accent)] font-semibold ring-2 ring-[var(--accent-foreground)]/30',
                  !date && 'invisible'
                )}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateInput;