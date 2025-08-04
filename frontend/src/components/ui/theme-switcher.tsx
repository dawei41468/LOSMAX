import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ThemeSwitcherProps {
  className?: string
  variant?: 'button' | 'segmented' | 'icon-only'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ThemeSwitcher({ 
  className, 
  variant = 'button', 
  showLabel = false,
  size = 'md'
}: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsAnimating(true)
    toggleTheme(event)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 600)
  }



  if (variant === 'segmented') {
    return (
      <div className={cn("flex rounded-lg border border-input bg-background p-1", className)}>
        {[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={(e) => handleClick(e)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              theme === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`Switch to ${label} theme`}
          >
            <Icon className="h-4 w-4" />
            {showLabel && <span>{label}</span>}
          </button>
        ))}
      </div>
    )
  }

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        variant === 'icon-only' ? 'h-10 w-10 px-0' : 'px-3',
        className
      )}
      onClick={handleClick}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <Sun className={cn(
            iconSize[size],
            "transition-all duration-300",
            theme === 'light' ? "rotate-0 scale-100" : "rotate-90 scale-0"
          )} />
          <Moon className={cn(
            iconSize[size],
            "absolute inset-0 transition-all duration-300",
            theme === 'dark' ? "rotate-0 scale-100" : "-rotate-90 scale-0"
          )} />
        </div>
        {showLabel && variant !== 'icon-only' && (
          <span className="text-sm font-medium">
            {theme === 'light' ? 'Light' : 'Dark'}
          </span>
        )}
      </div>
      
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-current opacity-10 animate-pulse" />
      )}
    </Button>
  )
}