# Theme System Guidelines & Documentation

## Overview
Your theme system uses CSS custom properties (CSS variables) with a React context provider for light/dark mode switching. This document outlines improvements and best practices.

## Current Architecture

### ✅ Existing System
- **CSS Variables**: Defined in `index.css` for both light/dark themes
- **ThemeProvider**: React context with localStorage persistence
- **ThemeSwitcher**: Button component for manual theme switching
- **Tailwind Integration**: Uses `dark:` variants for conditional styling

### 🎯 Recommended Improvements

## 1. Enhanced Theme Variables

### Color System Structure
```css
:root {
  /* Brand colors */
  --brand-primary: #2563eb;
  --brand-secondary: #8b5cf6;
  --brand-accent: #f59e0b;
  
  /* Semantic colors */
  --color-background: var(--theme-light-background);
  --color-foreground: var(--theme-light-foreground);
  --color-surface: var(--theme-light-card);
  --color-border: var(--theme-light-border);
  
  /* State colors */
  --color-success: var(--theme-light-success);
  --color-warning: var(--theme-light-warning);
  --color-error: var(--theme-light-destructive);
  --color-info: var(--theme-light-info);
}

.dark {
  --color-background: var(--theme-dark-background);
  --color-foreground: var(--theme-dark-foreground);
  /* ... etc */
}
```

## 2. Usage Patterns

### In CSS
```css
.my-component {
  background-color: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}
```

### In React Components
```tsx
// Using CSS variables
<div className="bg-[var(--color-background)] text-[var(--color-foreground)]">
  Content
</div>

// Using Tailwind dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

## 3. Theme Switching Best Practices

### Component Integration
```tsx
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext'

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useEnhancedTheme()
  
  return (
    <div className={`theme-${resolvedTheme}`}>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
    </div>
  )
}
```

### Animation Considerations
```css
/* Disable transitions during theme change */
.theme-changing * {
  transition: none !important;
}

/* Smooth theme transitions */
* {
  transition: background-color 300ms ease-in-out,
              color 300ms ease-in-out,
              border-color 300ms ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

## 4. Accessibility Guidelines

### Color Contrast
- Ensure WCAG 2.1 AA compliance (4.5:1 for normal text)
- Test both light and dark themes
- Use tools like WebAIM Color Contrast Checker

### Focus Management
```css
:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .theme-transition {
    transition: none !important;
  }
}
```

## 5. Testing Themes

### Manual Testing Checklist
- [ ] Toggle between light/dark modes
- [ ] Test system preference detection
- [ ] Verify localStorage persistence
- [ ] Check color contrast ratios
- [ ] Test with screen readers
- [ ] Verify keyboard navigation

### Automated Testing
```tsx
// Example test for theme switching
describe('Theme System', () => {
  it('should toggle between light and dark themes', () => {
    cy.visit('/')
    cy.get('[data-testid="theme-switcher"]').click()
    cy.get('html').should('have.class', 'dark')
  })
})
```

## 6. Common Patterns

### Theme-Aware Components
```tsx
// Create theme-aware variants
const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
}

// Use in components
<button className={cn(buttonVariants[variant], 'dark:opacity-90')}>
  Button
</button>
```

### Theme-Specific Styles
```css
/* Light theme specific */
@media (prefers-color-scheme: light) {
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

/* Dark theme specific */
@media (prefers-color-scheme: dark) {
  .gradient-bg {
    background: linear-gradient(135deg, #434343 0%, #000000 100%);
  }
}
```

## 7. Migration Guide

### From Current System to Enhanced System
1. **Update ThemeProvider**: Replace with `EnhancedThemeProvider`
2. **Update ThemeSwitcher**: Use `EnhancedThemeSwitcher` component
3. **Add CSS**: Include `theme-improvements.css`
4. **Test**: Verify all components work correctly

### Backward Compatibility
- Existing CSS variables remain functional
- Theme context API is extended, not changed
- All existing components continue to work

## 8. Performance Considerations

### CSS Variables Performance
- CSS variables are computed at runtime
- Changes propagate instantly without re-rendering
- Minimal impact on performance

### Bundle Size
- Theme system adds ~2KB to bundle size
- CSS variables are native browser features
- No additional dependencies required

## 9. Troubleshooting

### Common Issues
- **Flash of unstyled content (FOUC)**: Ensure ThemeProvider wraps entire app
- **Theme not persisting**: Check localStorage permissions
- **CSS variables not working**: Verify CSS file is loaded
- **Tailwind dark mode not working**: Ensure `dark:` variants are used correctly

### Debug Mode
```tsx
// Enable debug mode
const { resolvedTheme } = useEnhancedTheme()
console.log('Current theme:', resolvedTheme)
```
