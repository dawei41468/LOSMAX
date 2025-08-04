# Select Component System

A comprehensive, accessible select component system that wraps native `<select>` elements with consistent styling, variants, and accessibility features.

## Overview

The Select component system provides a consistent way to implement select dropdowns across the application while maintaining native accessibility and mobile UX benefits.

## Components

### Core Components

- **Select** - The main select component with variants and sizes
- **SelectField** - Complete select field with label, error handling, and placeholder
- **SelectGroup** - Wrapper for grouping select elements with labels
- **SelectLabel** - Consistent label styling
- **SelectItem** - Wrapper for option elements
- **SelectSeparator** - For grouping options with optgroups

## Usage Examples

### Basic Select

```tsx
import { Select, SelectItem } from '@/components/ui/select'

function BasicSelect() {
  return (
    <Select>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
      <SelectItem value="option3">Option 3</SelectItem>
    </Select>
  )
}
```

### Select with Label and Error

```tsx
import { SelectField, SelectItem } from '@/components/ui/select'

function FormSelect() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  return (
    <SelectField
      label="Choose a category"
      placeholder="Select a category..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      error={error}
      required
    >
      <SelectItem value="work">Work</SelectItem>
      <SelectItem value="personal">Personal</SelectItem>
      <SelectItem value="health">Health</SelectItem>
    </SelectField>
  )
}
```

### Select with Variants and Sizes

```tsx
import { Select, SelectItem } from '@/components/ui/select'

function SelectVariants() {
  return (
    <div className="space-y-4">
      <Select variant="default" size="sm">
        <SelectItem value="1">Small Select</SelectItem>
      </Select>
      
      <Select variant="outline" size="default">
        <SelectItem value="1">Outline Select</SelectItem>
      </Select>
      
      <Select variant="ghost" size="lg">
        <SelectItem value="1">Large Ghost Select</SelectItem>
      </Select>
    </div>
  )
}
```

### Grouped Select with Optgroups

```tsx
import { Select, SelectItem, SelectSeparator } from '@/components/ui/select'

function GroupedSelect() {
  return (
    <Select>
      <SelectItem value="">Choose an option</SelectItem>
      
      <SelectSeparator label="Fruits">
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectSeparator>
      
      <SelectSeparator label="Vegetables">
        <SelectItem value="carrot">Carrot</SelectItem>
        <SelectItem value="broccoli">Broccoli</SelectItem>
      </SelectSeparator>
    </Select>
  )
}
```

## Props

### Select Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outline' \| 'ghost' \| 'subtle'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'default' \| 'lg' \| 'xl'` | `'default'` | Size of the select |
| `error` | `boolean` | `false` | Whether to show error styling |
| `className` | `string` | - | Additional CSS classes |

### SelectField Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text |
| `placeholder` | `string` | - | Placeholder option text |
| `error` | `string` | - | Error message to display |
| `required` | `boolean` | `false` | Whether the field is required |
| `containerClassName` | `string` | - | Additional classes for container |

## Migration Guide

### From Native Select

**Before:**
```tsx
<select
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="border border-gray-300 rounded-md px-3 py-2"
>
  <option value="">Choose...</option>
  <option value="option1">Option 1</option>
</select>
```

**After:**
```tsx
<SelectField
  label="Choose option"
  placeholder="Choose..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
>
  <SelectItem value="option1">Option 1</SelectItem>
</SelectField>
```

### From Simple Select

**Before:**
```tsx
<select className="border rounded p-2">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**After:**
```tsx
<Select>
  <SelectItem value="option1">Option 1</SelectItem>
  <SelectItem value="option2">Option 2</SelectItem>
</Select>
```

## Styling

### CSS Variables Used

The component uses CSS variables for consistent theming:

- `--background` - Background color
- `--foreground` - Text color
- `--border` - Border color
- `--primary` - Primary accent color
- `--destructive` - Error color
- `--muted` - Muted/disabled color

### Custom Styling

You can customize the appearance using Tailwind classes:

```tsx
<Select className="w-full max-w-xs bg-blue-50 border-blue-300">
  <SelectItem value="custom">Custom styled</SelectItem>
</Select>
```

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- Proper ARIA attributes
- Focus management
- Error announcement for screen readers

## Responsive Design

The component is fully responsive and works well on all screen sizes:
- Mobile: Uses native select picker
- Tablet/Desktop: Styled dropdown
- Touch-friendly sizing

## Examples by Use Case

### Filter Selects
```tsx
<Select variant="subtle" size="sm">
  <SelectItem value="all">All items</SelectItem>
  <SelectItem value="active">Active</SelectItem>
  <SelectItem value="completed">Completed</SelectItem>
</Select>
```

### Form Selects
```tsx
<SelectField
  label="Country"
  placeholder="Select your country"
  required
  error={errors.country}
>
  {countries.map(country => (
    <SelectItem key={country.code} value={country.code}>
      {country.name}
    </SelectItem>
  ))}
</SelectField>
```

### Settings Selects
```tsx
<Select variant="ghost" size="lg">
  <SelectItem value="light">Light mode</SelectItem>
  <SelectItem value="dark">Dark mode</SelectItem>
  <SelectItem value="system">System</SelectItem>
</Select>
```
