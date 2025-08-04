# Card Component Documentation

## Overview

The Card component system provides a flexible, highly customizable way to create consistent card layouts throughout your application. Built with TypeScript and Tailwind CSS, it offers multiple variants, sizes, and configuration options.

## Installation

The Card component is already included in your project. No additional installation required.

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
```

## Basic Usage

### Simple Card
```jsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This is the main content of the card.</p>
  </CardContent>
  <CardFooter>
    <button>Action</button>
  </CardFooter>
</Card>
```

## Component Structure

### Card
The main container component that wraps all card content.

**Props:**
- `variant`: Card style variant
- `size`: Padding and spacing size
- `interactive`: Enable hover effects
- `border`: Border style and color
- `className`: Additional CSS classes

### CardHeader
Container for card header content, typically containing title and description.

**Props:**
- `size`: Header padding size
- `align`: Text alignment
- `spacing`: Vertical spacing between elements

### CardTitle
The main title of the card.

**Props:**
- `size`: Font size
- `weight`: Font weight
- `color`: Text color variant
- `as`: HTML heading tag (h1-h6)

### CardDescription
Secondary text that provides additional context.

**Props:**
- `size`: Font size

### CardContent
Main content area of the card.

**Props:**
- `size`: Content padding size
- `spacing`: Vertical spacing between content elements

### CardFooter
Bottom section of the card, typically for actions.

**Props:**
- `size`: Footer padding size
- `align`: Horizontal alignment
- `spacing`: Horizontal spacing between elements

## Variants

### Card Variants

| Variant | Description | Example |
|---------|-------------|---------|
| `default` | Standard shadow and border | `<Card variant="default">` |
| `elevated` | Enhanced shadow with hover effect | `<Card variant="elevated">` |
| `outline` | Thicker border, no shadow | `<Card variant="outline">` |
| `ghost` | No border or shadow | `<Card variant="ghost">` |
| `subtle` | Light shadow | `<Card variant="subtle">` |

### Border Variants

| Border | Description | Example |
|--------|-------------|---------|
| `default` | Standard border color | `<Card border="default">` |
| `accent` | Primary color border | `<Card border="accent">` |
| `success` | Green border | `<Card border="success">` |
| `warning` | Yellow border | `<Card border="warning">` |
| `error` | Red border | `<Card border="error">` |
| `none` | No border | `<Card border="none">` |

## Sizes

### Card Sizes

| Size | Padding | Usage |
|------|---------|--------|
| `sm` | 1rem (16px) | Compact cards |
| `default` | 1.5rem (24px) | Standard cards |
| `lg` | 2rem (32px) | Spacious cards |
| `xl` | 2.5rem (40px) | Large cards |
| `none` | 0px | Custom padding |

## Interactive Cards

Add hover effects and cursor pointer for clickable cards:

```jsx
<Card interactive onClick={handleClick}>
  <CardContent>
    <h3>Clickable Card</h3>
    <p>This card has hover effects</p>
  </CardContent>
</Card>
```

## Advanced Usage

### Custom Styled Card
```jsx
<Card 
  variant="elevated" 
  size="lg" 
  border="accent"
  interactive
  className="max-w-md"
>
  <CardHeader align="center">
    <CardTitle size="xl" color="primary">Premium Feature</CardTitle>
    <CardDescription>Unlock advanced capabilities</CardDescription>
  </CardHeader>
  <CardContent spacing="loose">
    <ul className="space-y-2">
      <li>✓ Advanced analytics</li>
      <li>✓ Priority support</li>
      <li>✓ Unlimited projects</li>
    </ul>
  </CardContent>
  <CardFooter align="center">
    <button className="btn btn-primary">Upgrade Now</button>
  </CardFooter>
</Card>
```

### Compact Card
```jsx
<Card variant="outline" size="sm">
  <CardHeader spacing="tight">
    <CardTitle size="sm">Quick Action</CardTitle>
  </CardHeader>
  <CardContent size="sm" spacing="tight">
    <p className="text-sm">Brief description</p>
  </CardContent>
</Card>
```

### Card with Actions
```jsx
<Card interactive>
  <CardHeader>
    <CardTitle>Task Details</CardTitle>
    <CardDescription>Due tomorrow at 2:00 PM</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Complete the quarterly report and submit for review.</p>
  </CardContent>
  <CardFooter align="between">
    <span className="text-sm text-muted-foreground">Marketing</span>
    <div className="space-x-2">
      <button className="btn btn-ghost btn-sm">Edit</button>
      <button className="btn btn-primary btn-sm">Complete</button>
    </div>
  </CardFooter>
</Card>
```

## Responsive Design

Cards automatically adapt to different screen sizes. Use responsive classes for specific adjustments:

```jsx
<Card className="w-full md:w-1/2 lg:w-1/3">
  <CardContent>
    <h3>Responsive Card</h3>
    <p>Adapts to screen size</p>
  </CardContent>
</Card>
```

## Dark Mode Support

All card variants support dark mode automatically through CSS variables. No additional configuration needed.

## Customization

### Adding Custom Variants

To add custom variants, extend the `cardVariants` configuration in the component file:

```typescript
// In card.tsx, add to cardVariants variants
variant: {
  // ... existing variants
  custom: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
}
```

### Custom Styling

Use the `className` prop for one-off customizations:

```jsx
<Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
  <CardContent>
    <h3>Custom Styled Card</h3>
  </CardContent>
</Card>
```

## Accessibility

- All components use semantic HTML elements
- Proper heading hierarchy maintained
- Keyboard navigation supported for interactive cards
- Screen reader friendly

## Migration from CSS Classes

To migrate from CSS `.card` classes to React Card components:

### Before
```jsx
<div className="card border-l-primary">
  <div className="card-content">
    <h3 className="card-title">Title</h3>
    <p>Content</p>
  </div>
</div>
```

### After
```jsx
<Card border="accent">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

## Examples Gallery

### Goal Card
```jsx
<Card variant="elevated" interactive>
  <CardHeader>
    <CardTitle size="lg">Launch Marketing Campaign</CardTitle>
    <CardDescription>Due in 5 days • Marketing Team</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Create and launch comprehensive marketing campaign for Q2 product release.</p>
  </CardContent>
  <CardFooter align="between">
    <span className="badge badge-warning">In Progress</span>
    <div className="space-x-2">
      <button className="btn btn-ghost btn-sm">Edit</button>
      <button className="btn btn-success btn-sm">Complete</button>
    </div>
  </CardFooter>
</Card>
```

### Task Card (Compact)
```jsx
<Card variant="outline" size="sm">
  <CardContent size="sm" spacing="tight">
    <div className="flex items-center justify-between">
      <CardTitle size="sm">Review PR #123</CardTitle>
      <span className="badge badge-sm badge-info">Code Review</span>
    </div>
    <CardDescription size="sm">Review changes to authentication flow</CardDescription>
  </CardContent>
</Card>
```

### Dashboard Card
```jsx
<Card variant="ghost" border="none">
  <CardHeader align="center">
    <CardTitle size="2xl" color="primary">1,234</CardTitle>
    <CardDescription>Active Users Today</CardDescription>
  </CardHeader>
</Card>
```
