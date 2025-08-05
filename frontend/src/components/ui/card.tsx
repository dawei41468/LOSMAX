import { cn } from '../../lib/utils';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Card variants configuration
const cardVariants = cva(
  'rounded-lg border text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'shadow-md bg-card',
        elevated: 'shadow-lg hover:shadow-xl bg-card',
        outline: 'border-2 bg-card',
        ghost: 'border-0 shadow-none bg-card',
        subtle: 'shadow-sm bg-card',
        quoteOD: 'shadow-md bg-[var(--quote-bg)] border-[var(--quote-border)] text-[var(--quote-text)]',
        taskST: 'shadow-md bg-[var(--task-bg)] border-[var(--task-border)] text-[var(--foreground)]',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        xl: 'p-10',
        none: 'p-0',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5',
        false: '',
      },
      border: {
        default: 'border-border',
        accent: 'border-primary',
        success: 'border-success',
        warning: 'border-warning',
        error: 'border-destructive',
        family: 'border-[var(--category-family)]',
        work: 'border-[var(--category-work)]',
        personal: 'border-[var(--category-personal)]',
        health: 'border-[var(--category-health)]',
        none: 'border-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
      border: 'default',
    },
  }
);

// Card component
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, border, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, size, interactive, border }),
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// Card header variants
const cardHeaderVariants = cva(
  'flex flex-col space-y-1.5',
  {
    variants: {
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        xl: 'p-10',
        none: 'p-0',
      },
      align: {
        left: 'items-start text-left',
        center: 'items-center text-center',
        right: 'items-end text-right',
      },
      spacing: {
        default: 'space-y-1.5',
        tight: 'space-y-1',
        loose: 'space-y-3',
      },
    },
    defaultVariants: {
      size: 'default',
      align: 'left',
      spacing: 'default',
    },
  }
);

export interface CardHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, align, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardHeaderVariants({ size, align, spacing }),
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

// Card title variants
const cardTitleVariants = cva(
  'font-semibold leading-none tracking-tight',
  {
    variants: {
      size: {
        default: 'text-2xl',
        sm: 'text-lg',
        lg: 'text-3xl',
        xl: 'text-4xl',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      color: {
        default: 'text-card-foreground',
        muted: 'text-muted-foreground',
        primary: 'text-primary',
        secondary: 'text-secondary-foreground',
        none: '',
      },
    },
    defaultVariants: {
      size: 'default',
      weight: 'semibold',
      color: 'default',
    },
  }
);

export interface CardTitleProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof cardTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, weight, color, as = 'h3', ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref}
        className={cn(
          cardTitleVariants({ size, weight, color }),
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

// Card description
const cardDescriptionVariants = cva(
  'text-sm text-muted-foreground',
  {
    variants: {
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescriptionVariants> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        cardDescriptionVariants({ size }),
        className
      )}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

// Card content variants
const cardContentVariants = cva(
  '',
  {
    variants: {
      size: {
        default: 'p-6 pt-0',
        sm: 'p-4 pt-0',
        lg: 'p-8 pt-0',
        xl: 'p-10 pt-0',
        none: 'p-0',
      },
      spacing: {
        default: 'space-y-4',
        tight: 'space-y-2',
        loose: 'space-y-6',
        none: 'space-y-0',
      },
    },
    defaultVariants: {
      size: 'default',
      spacing: 'default',
    },
  }
);

export interface CardContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardContentVariants({ size, spacing }),
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

// Card footer
const cardFooterVariants = cva(
  'flex items-center',
  {
    variants: {
      size: {
        default: 'p-6 pt-0',
        sm: 'p-4 pt-0',
        lg: 'p-8 pt-0',
        xl: 'p-10 pt-0',
        none: 'p-0',
      },
      align: {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
        between: 'justify-between',
      },
      spacing: {
        default: 'space-x-2',
        tight: 'space-x-1',
        loose: 'space-x-4',
      },
    },
    defaultVariants: {
      size: 'default',
      align: 'left',
      spacing: 'default',
    },
  }
);

export interface CardFooterProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, align, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardFooterVariants({ size, align, spacing }),
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';