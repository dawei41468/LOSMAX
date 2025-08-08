import React, { useRef, useEffect, useState, forwardRef } from "react";
import { Clock } from 'lucide-react';
import '@/styles/timepicker.css';

// Generate arrays for hours, minutes, and periods
const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const periods = ["AM", "PM"];

export interface TimePickerProps {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (time: string) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  defaultOpen?: boolean;
  className?: string;
  use24HourFormat?: boolean;
  context?: 'morningDeadline' | 'eveningDeadline';
}

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  ({ label, defaultValue, value, onChange, onOpenChange, open, defaultOpen, className, use24HourFormat = false, context }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen || false);
    const [selectedHour, setSelectedHour] = useState("09");
    const [selectedMinute, setSelectedMinute] = useState("00");
    const [selectedPeriod, setSelectedPeriod] = useState("AM");
    
    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const periodsRef = useRef<HTMLDivElement>(null);
    
    // Parse initial value if provided or set based on context
    useEffect(() => {
      if (value || defaultValue) {
        const val = value || defaultValue || "09:00 AM";
        const match = val.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
        if (match) {
          setSelectedHour(match[1].padStart(2, '0'));
          setSelectedMinute(match[2]);
          setSelectedPeriod(match[3].toUpperCase());
        }
      } else if (context) {
        // Default based on context if no value is provided
        if (context === 'morningDeadline') {
          setSelectedHour("08");
          setSelectedMinute("00");
          setSelectedPeriod("AM");
        } else if (context === 'eveningDeadline') {
          setSelectedHour("08");
          setSelectedMinute("00");
          setSelectedPeriod("PM");
        }
      }
    }, [value, defaultValue, context]);

    // Handle controlled open state
    useEffect(() => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    }, [open]);

    // Handle open state change
    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    // Scroll to the correct position on initial render
    useEffect(() => {
      if (isOpen) {
        scrollToSelected();
      }
    }, [isOpen]);

    // Scroll each column to the selected value
    const scrollToSelected = () => {
      setTimeout(() => {
        if (hoursRef.current) {
          const hourIndex = hours.indexOf(selectedHour);
          if (hourIndex !== -1) {
            hoursRef.current.scrollTop = hourIndex * 40;
          }
        }
        
        if (minutesRef.current) {
          const minuteIndex = minutes.indexOf(selectedMinute);
          if (minuteIndex !== -1) {
            minutesRef.current.scrollTop = minuteIndex * 40;
          }
        }
        
        if (periodsRef.current) {
          const periodIndex = periods.indexOf(selectedPeriod);
          if (periodIndex !== -1) {
            periodsRef.current.scrollTop = periodIndex * 40;
          }
        }
      }, 50);
    };

    // Handle scroll end for each column
    const handleScrollEnd = (
      ref: React.RefObject<HTMLDivElement | null>, // Allow null for current
      values: string[],
      setter: (value: string) => void
    ) => {
      if (!ref.current) return;
      
      const scrollPosition = ref.current.scrollTop;
      const itemHeight = 40;
      const index = Math.round(scrollPosition / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      
      // Snap to the nearest item
      ref.current.scrollTo({
        top: clampedIndex * itemHeight,
        behavior: "smooth",
      });
      
      // Update the selected value
      setter(values[clampedIndex]);
    };

    // Add scroll event listeners with debounce
    useEffect(() => {
      const addScrollListener = (
        ref: React.RefObject<HTMLDivElement | null>, // Allow null for current
        values: string[],
        setter: (value: string) => void
      ) => {
        if (!ref.current) return;
        
        let scrollTimeout: NodeJS.Timeout;
        
        const handleScroll = () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            handleScrollEnd(ref, values, setter);
          }, 150);
        };
        
        ref.current.addEventListener("scroll", handleScroll);
        
        return () => {
          ref.current?.removeEventListener("scroll", handleScroll);
          clearTimeout(scrollTimeout);
        };
      };
      
      const removeHoursListener = addScrollListener(hoursRef, hours, setSelectedHour);
      const removeMinutesListener = addScrollListener(minutesRef, minutes, setSelectedMinute);
      const removePeriodsListener = addScrollListener(periodsRef, periods, setSelectedPeriod);
      
      return () => {
        removeHoursListener?.();
        removeMinutesListener?.();
        removePeriodsListener?.();
      };
    }, [isOpen]);

    // Handle touch events for better mobile experience
    const addTouchHandlers = (
      ref: React.RefObject<HTMLDivElement | null>, // Allow null for current
      values: string[],
      setter: (value: string) => void
    ) => {
      if (!ref.current) return;
      
      let startY = 0;
      let startScrollTop = 0;
      let momentum = 0;
      let animationFrame: number;
      
      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].clientY;
        startScrollTop = ref.current?.scrollTop || 0;
        momentum = 0;
        cancelAnimationFrame(animationFrame);
      };
      
      const handleTouchMove = (e: TouchEvent) => {
        if (!ref.current) return;
        const y = e.touches[0].clientY;
        const diff = startY - y;
        momentum = diff * 0.1;
        ref.current.scrollTop = startScrollTop + diff;
      };
      
      const handleTouchEnd = () => {
        if (!ref.current) return;
        
        const momentumScroll = () => {
          if (!ref.current || Math.abs(momentum) < 0.5) {
            handleScrollEnd(ref, values, setter);
            return;
          }
          
          momentum *= 0.95;
          if (ref.current) {
            ref.current.scrollTop += momentum;
          }
          
          animationFrame = requestAnimationFrame(momentumScroll);
        };
        
        animationFrame = requestAnimationFrame(momentumScroll);
      };
      
      ref.current.addEventListener("touchstart", handleTouchStart, { passive: true });
      ref.current.addEventListener("touchmove", handleTouchMove, { passive: true });
      ref.current.addEventListener("touchend", handleTouchEnd);
      
      return () => {
        ref.current?.removeEventListener("touchstart", handleTouchStart);
        ref.current?.removeEventListener("touchmove", handleTouchMove);
        ref.current?.removeEventListener("touchend", handleTouchEnd);
        cancelAnimationFrame(animationFrame);
      };
    };
    
    // Add touch handlers when modal is open
    useEffect(() => {
      if (!isOpen) return;
      
      const removeHoursTouchHandlers = addTouchHandlers(hoursRef, hours, setSelectedHour);
      const removeMinutesTouchHandlers = addTouchHandlers(minutesRef, minutes, setSelectedMinute);
      const removePeriodsTouchHandlers = addTouchHandlers(periodsRef, periods, setSelectedPeriod);
      
      return () => {
        removeHoursTouchHandlers?.();
        removeMinutesTouchHandlers?.();
        removePeriodsTouchHandlers?.();
      };
    }, [isOpen]);

    // Handle done button click
    const handleDone = () => {
      const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      onChange?.(formattedTime);
      handleOpenChange(false);
    };

    // highlightProps was unused and has been removed.

    return (
      <div className={`relative ${className || ''}`}> {/* Apply className prop */}
        <label className="block text-sm font-medium text-secondary mb-1">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center border rounded-md px-3 py-1 bg-card w-full">
            <input
              value={selectedHour}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                const maxHour = use24HourFormat ? 23 : 12;
                if (value.length > 2) value = value.slice(0, 2);
                if (Number(value) > maxHour) value = maxHour.toString();
                setSelectedHour(value.padStart(2, '0'));
              }}
              className="w-8 text-center outline-none bg-transparent"
              maxLength={2}
              inputMode="numeric"
            />
            <span className="text-gray-500">:</span>
            <input
              value={selectedMinute}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 2) value = value.slice(0, 2);
                if (Number(value) > 59) value = '59';
                setSelectedMinute(value.padStart(2, '0'));
              }}
              className="w-8 text-center outline-none bg-transparent"
              maxLength={2}
              inputMode="numeric"
            />
            {!use24HourFormat && (
              <span className="ml-2 px-2 py-1 text-sm bg-primary/10 text-primary rounded-md">
                {selectedPeriod}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleOpenChange(!isOpen)}
              className="ml-auto p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Clock className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            ref={ref}
            className="absolute z-10 mt-1 w-full max-w-full ios-picker shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <div className="relative py-2 px-0">
              {/* iOS-style blur overlays */}
              <div className="absolute top-0 left-0 right-0 h-[80px] ios-blur-top"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[80px] ios-blur-bottom"></div>
              
              <div className="flex items-center justify-center relative z-10 space-x-2 px-2">
                {/* Hours Column */}
                <div className="relative w-24 h-[120px] overflow-hidden">
                    <div
                      ref={hoursRef}
                      className="absolute inset-0 overflow-y-auto scroll-smooth scrollbar-hide"
                      style={{
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                        scrollSnapType: "y mandatory",
                        overscrollBehaviorY: "contain",
                        scrollBehavior: "smooth"
                      }}
                    >
                      <div className="h-[40px]" /> {/* Top spacing */}
                    
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[40px] flex items-center justify-center scroll-snap-align-center"
                        data-value={hour}
                      >
                        <div className={`text-2xl font-light transition-all duration-200 ${hour === selectedHour ? 'ios-text-accent font-medium scale-110' : 'ios-text-primary opacity-50'}`}>{hour.toString().padStart(2, '0')}</div>
                      </div>
                    ))}
                    
                    <div className="h-[40px]" /> {/* Bottom spacing */}
                  </div>
                </div>
                
                {/* Colon */}
                <div className="text-2xl font-medium text-gray-700">:</div>
                
                {/* Minutes Column */}
                <div className="relative w-16 h-[160px] overflow-hidden">
                  <div
                    ref={minutesRef}
                    className="absolute inset-0 overflow-y-auto scroll-smooth scrollbar-hide"
                    style={{
                      msOverflowStyle: "none",
                      scrollbarWidth: "none",
                      scrollSnapType: "y mandatory",
                      overscrollBehaviorY: "contain",
                      scrollBehavior: "smooth"
                    }}
                  >
                    <div className="h-[60px]"></div> {/* Top spacing */}
                    
                    {minutes.map((minute) => (
                      <div
                        key={minute}
                        className="h-[40px] flex items-center justify-center scroll-snap-align-center"
                        data-value={minute}
                      >
                        <div className={`text-2xl font-light transition-all duration-200 ${minute === selectedMinute ? 'ios-text-accent font-medium scale-110' : 'ios-text-primary opacity-50'}`}>{minute.toString().padStart(2, '0')}</div>
                      </div>
                    ))}
                    
                    <div className="h-[60px]"></div> {/* Bottom spacing */}
                  </div>
                </div>
                
                {/* AM/PM Column */}
                {!use24HourFormat && (
                  <div className="relative w-16 h-[160px] overflow-hidden">
                    <div
                      ref={periodsRef}
                      className="absolute inset-0 overflow-y-auto scroll-smooth scrollbar-hide"
                      style={{
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                        scrollSnapType: "y mandatory",
                        overscrollBehaviorY: "contain",
                        scrollBehavior: "smooth"
                      }}
                    >
                      <div className="h-[60px]"></div> {/* Top spacing */}
                      
                      {periods.map((period) => (
                        <div
                          key={period}
                          className="h-[40px] flex items-center justify-center scroll-snap-align-center"
                          data-value={period}
                        >
                          <div className={`text-xl font-light transition-all duration-200 ${period === selectedPeriod ? 'ios-text-accent font-medium scale-110' : 'ios-text-primary opacity-50'}`}>{period}</div>
                        </div>
                      ))}
                      
                      <div className="h-[60px]"></div> {/* Bottom spacing */}
                    </div>
                  </div>
                )}
              </div>
              
              {/* iOS-style selection highlight */}
              <div
                className="absolute left-3 right-3 top-1/2 transform -translate-y-1/2 h-[36px] ios-selection pointer-events-none z-5"
              />
            </div>
            
            <div className="flex justify-center space-x-2 w-full mt-3 px-4 pb-3">
              <button
                onClick={() => handleOpenChange(false)}
                className="ios-button ios-button-cancel flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleDone}
                className="ios-button ios-button-done flex-1"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";

export default TimePicker;