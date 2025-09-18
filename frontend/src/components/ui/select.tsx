import * as React from 'react'
import {
  selectVariants,
  type VariantProps,
} from '@/components/ui/select-variants'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  error?: boolean
  variant?: 'default' | 'subtle' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, error, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          selectVariants({ variant, size, hasError: error, className })
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

// Helper components for consistent structure
interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        {children}
      </div>
    )
  }
)
SelectGroup.displayName = 'SelectGroup'

interface SelectLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const SelectLabel = React.forwardRef<HTMLLabelElement, SelectLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    )
  }
)
SelectLabel.displayName = 'SelectLabel'

interface SelectItemProps extends React.HTMLAttributes<HTMLOptionElement> {
  value: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option ref={ref} className={cn('', className)} {...props}>
        {children}
      </option>
    )
  }
)
SelectItem.displayName = 'SelectItem'

const SelectSeparator = React.forwardRef<HTMLOptGroupElement, React.HTMLAttributes<HTMLOptGroupElement>>(
  ({ className, ...props }, ref) => {
    return (
      <optgroup ref={ref} className={cn('', className)} {...props} />
    )
  }
)
SelectSeparator.displayName = 'SelectSeparator'

// Helper component for select with label and error handling
interface SelectFieldProps extends Omit<SelectProps, 'error'> {
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  containerClassName?: string
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, placeholder, error, required, containerClassName, children, ...props }, ref) => {
    const selectId = React.useId()
    
    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <SelectLabel htmlFor={selectId} required={required}>
            {label}
          </SelectLabel>
        )}
        <Select
          ref={ref}
          id={selectId}
          error={!!error}
          {...props}
        >
          {placeholder && (
            <SelectItem value="" disabled>
              {placeholder}
            </SelectItem>
          )}
          {children}
        </Select>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
SelectField.displayName = 'SelectField'

export {
  Select,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectField,
}

export type { SelectProps as SelectComponentProps, SelectFieldProps, VariantProps }
