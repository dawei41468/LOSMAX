import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  size = 'md'
}) => {
  const sizes = {
    sm: {
      switch: 'h-5 w-8',
      thumb: 'h-3.5 w-3.5',
      thumbOffset: checked ? 'translate-x-3.5' : 'translate-x-0.5'
    },
    md: {
      switch: 'h-6 w-10',
      thumb: 'h-4.5 w-4.5',
      thumbOffset: checked ? 'translate-x-4.5' : 'translate-x-0.5'
    },
    lg: {
      switch: 'h-7 w-12',
      thumb: 'h-5.5 w-5.5',
      thumbOffset: checked ? 'translate-x-5.5' : 'translate-x-0.5'
    }
  };

  const currentSize = sizes[size];

  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none',
        currentSize.switch,
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--switch-off-bg)] border-[var(--switch-off-border)]',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-[var(--switch-thumb-bg)] shadow-lg ring-0 transition-transform duration-200 ease-in-out border border-[var(--switch-thumb-border)] self-center',
          currentSize.thumb,
          currentSize.thumbOffset
        )}
      />
    </button>
  );
};

export default Switch;
