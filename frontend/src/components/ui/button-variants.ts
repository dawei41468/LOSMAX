import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--button-radius)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] text-[var(--primary)] border border-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_22%,transparent)] active:bg-[color-mix(in_srgb,var(--primary)_28%,transparent)] active:scale-95 motion-reduce:active:scale-100",
        destructive:
          "bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)] text-[var(--destructive)] border border-[var(--destructive)] hover:bg-[color-mix(in_srgb,var(--destructive)_22%,transparent)] active:bg-[color-mix(in_srgb,var(--destructive)_28%,transparent)] active:scale-95 motion-reduce:active:scale-100",
        outline:
          "border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] active:bg-[var(--accent-hover)] active:scale-95 motion-reduce:active:scale-100",
        secondary:
          "bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] text-[var(--secondary)] border border-[var(--secondary)] hover:bg-[color-mix(in_srgb,var(--secondary)_22%,transparent)] active:bg-[color-mix(in_srgb,var(--secondary)_28%,transparent)] active:scale-95 motion-reduce:active:scale-100",
        ghost: "text-foreground/80 hover:bg-[var(--accent-hover)] hover:text-[var(--foreground)] active:bg-[var(--accent)] active:scale-95 motion-reduce:active:scale-100",
        link: "underline-offset-4 hover:underline text-[var(--primary)]",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>