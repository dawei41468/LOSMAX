import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button variant="ghost" size="sm" className="h-10 w-10 px-0" onClick={toggleTheme}>
        {theme === 'light' ? (
            <Moon className="h-[2rem] w-[2rem] rotate-0 scale-100 transition-all" />
        ) : (
            <Sun className="h-[2rem] w-[2rem] rotate-0 scale-100 transition-all" />
        )}
        <span className="sr-only">Toggle theme</span>
    </Button>
  )
}