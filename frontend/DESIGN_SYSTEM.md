# LOSMAX Design System

## Overview
This document outlines the comprehensive design system for refactoring the LOSMAX application to use global CSS classes, variables, and predefined colors.

## Architecture

### 1. CSS Custom Properties (Variables)
The system uses CSS custom properties for consistent theming across light and dark modes.

#### Color System
```css
/* Primary Colors */
--primary: #2563eb (light) / #3b82f6 (dark)
--primary-foreground: #fafafa
--primary-hover: #1d4ed8 (light) / #2563eb (dark)

/* Secondary Colors */
--secondary: #f5f5f5 (light) / #262626 (dark)
--secondary-foreground: #171717 (light) / #fafafa (dark)

/* Semantic Colors */
--success: #10b981 (light) / #34d399 (dark)
--warning: #f59e0b (light) / #fbbf24 (dark)
--error: #ef4444 (light) / #f87171 (dark)
--info: #3b82f6 (light) / #60a5fa (dark)

/* Neutral Colors */
--background: #ffffff (light) / #0a0a0a (dark)
--foreground: #0a0a0a (light) / #fafafa (dark)
--muted: #f5f5f5 (light) / #262626 (dark)
--muted-foreground: #a3a3a3

/* Border & Surface Colors */
--border: #e5e5e5 (light) / #404040 (dark)
--card: #ffffff (light) / #1f2937 (dark)
--popover: #ffffff (light) / #1f2937 (dark)
```

### 2. Global Utility Classes

#### Layout Classes
```css
/* Container */
.container-sm { max-width: 640px; margin: 0 auto; }
.container-md { max-width: 768px; margin: 0 auto; }
.container-lg { max-width: 1024px; margin: 0 auto; }
.container-xl { max-width: 1280px; margin: 0 auto; }

/* Spacing */
.section-spacing { padding: 2rem 0; }
.card-spacing { padding: 1.5rem; }
.element-spacing { margin-bottom: 1rem; }
```

#### Typography Classes
```css
/* Headings */
.heading-xl { font-size: 2rem; font-weight: 700; line-height: 1.2; }
.heading-lg { font-size: 1.5rem; font-weight: 600; line-height: 1.3; }
.heading-md { font-size: 1.25rem; font-weight: 600; line-height: 1.4; }
.heading-sm { font-size: 1.125rem; font-weight: 500; line-height: 1.4; }

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.6; }
.text-base { font-size: 1rem; line-height: 1.6; }
.text-sm { font-size: 0.875rem; line-height: 1.5; }
.text-xs { font-size: 0.75rem; line-height: 1.4; }

/* Text Colors */
.text-primary { color: var(--primary); }
.text-secondary { color: var(--secondary-foreground); }
.text-muted { color: var(--muted-foreground); }
.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-error { color: var(--error); }
```

#### Component Classes

##### Cards
```css
.card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.card-content {
  padding: 1.5rem;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}
```

##### Buttons
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: var(--secondary);
  color: var(--secondary-foreground);
  border-color: var(--border);
}

.btn-ghost {
  background-color: transparent;
  color: var(--foreground);
}

.btn-ghost:hover {
  background-color: var(--accent);
}
```

##### Forms
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--foreground);
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: var(--background);
  color: var(--foreground);
  transition: border-color 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
```

##### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.badge-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}
```

### 3. Category-Specific Styles

```css
/* Goal Categories */
.category-family {
  --category-color: #8b5cf6;
  --category-bg: rgba(139, 92, 246, 0.1);
}

.category-work {
  --category-color: #3b82f6;
  --category-bg: rgba(59, 130, 246, 0.1);
}

.category-personal {
  --category-color: #f59e0b;
  --category-bg: rgba(245, 158, 11, 0.1);
}

.category-health {
  --category-color: #10b981;
  --category-bg: rgba(16, 185, 129, 0.1);
}
```

### 4. Responsive Design Classes

```css
/* Responsive utilities */
@media (max-width: 640px) {
  .mobile-stack { flex-direction: column; }
  .mobile-full-width { width: 100%; }
  .mobile-hide { display: none; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .tablet-grid-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1025px) {
  .desktop-grid-3 { grid-template-columns: repeat(3, 1fr); }
}
```

### 5. Dark Mode Utilities

```css
/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  .dark\:bg-card { background-color: var(--card); }
  .dark\:text-foreground { color: var(--foreground); }
  .dark\:border-border { border-color: var(--border); }
}
```

## Implementation Strategy

### Phase 1: Foundation Setup
1. Update CSS variables in `index.css`
2. Create global utility classes
3. Establish color system

### Phase 2: Component Refactoring
1. Refactor card components
2. Refactor button components
3. Refactor form components
4. Refactor badge/status components

### Phase 3: Page-Level Refactoring
1. Refactor dashboard layout
2. Refactor task pages
3. Refactor goal pages
4. Refactor settings pages

### Phase 4: Testing & Validation
1. Test responsive design
2. Test dark mode
3. Validate accessibility
4. Performance testing

## Migration Checklist

- [ ] Create CSS custom properties for all colors
- [ ] Replace hard-coded colors with CSS variables
- [ ] Create global utility classes
- [ ] Refactor card components to use card classes
- [ ] Refactor buttons to use button classes
- [ ] Refactor forms to use form classes
- [ ] Refactor status badges to use badge classes
- [ ] Update responsive classes
- [ ] Test dark mode compatibility
- [ ] Validate accessibility
- [ ] Update documentation