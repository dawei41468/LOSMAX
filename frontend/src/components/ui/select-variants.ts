import { cva, type VariantProps } from 'class-variance-authority'

const selectVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        subtle: 'border-transparent bg-muted/50 text-muted-foreground',
        ghost: 'border-transparent',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
      hasError: {
        true: 'border-destructive text-destructive placeholder-destructive/50 focus:ring-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export { selectVariants, type VariantProps }