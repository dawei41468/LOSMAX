import * as React from 'react'
import { cn } from '@/lib/utils'
import { selectVariants, type VariantProps } from '@/components/ui/select-variants'

export type SelectMenuItem = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectVariants> {
  value?: string
  items: SelectMenuItem[]
  placeholder?: string
  onChange?: (value: string) => void
}

export const SelectMenu = React.forwardRef<HTMLDivElement, SelectMenuProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      value,
      items,
      placeholder,
      onChange,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const listRef = React.useRef<HTMLUListElement>(null)
    const [activeIndex, setActiveIndex] = React.useState<number>(() => {
      const idx = items.findIndex((i) => i.value === value)
      return idx >= 0 ? idx : 0
    })

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    React.useEffect(() => {
      function onDocMouseDown(e: MouseEvent) {
        if (!containerRef.current) return
        if (!containerRef.current.contains(e.target as Node)) setOpen(false)
      }
      if (open) document.addEventListener('mousedown', onDocMouseDown)
      return () => document.removeEventListener('mousedown', onDocMouseDown)
    }, [open])

    React.useEffect(() => {
      if (open) {
        // Focus selected item if possible
        const idx = Math.max(0, items.findIndex((i) => i.value === value))
        setActiveIndex(idx)
        setTimeout(() => {
          const li = listRef.current?.querySelector<HTMLLIElement>(`[data-index="${idx}"]`)
          li?.focus()
        }, 0)
      }
    }, [open, items, value])

    const selected = items.find((i) => i.value === value)

    function commitValue(v: string) {
      onChange?.(v)
      setOpen(false)
      // return focus back to trigger for accessibility
      buttonRef.current?.focus()
    }

    function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
      }
    }

    function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => {
          let next = i + 1
          while (next < items.length && items[next]?.disabled) next++
          return Math.min(next, items.length - 1)
        })
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => {
          let prev = i - 1
          while (prev >= 0 && items[prev]?.disabled) prev--
          return Math.max(prev, 0)
        })
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const item = items[activeIndex]
        if (item && !item.disabled) commitValue(item.value)
      }
    }

    return (
      <div ref={containerRef} className={cn('relative z-0 w-full', open && 'z-[1000]', className)} {...props}>
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(selectVariants({ variant, size }), 'text-left w-full flex items-center justify-between gap-2')}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={cn(!selected && 'text-muted-foreground')}>{selected ? selected.label : placeholder ?? 'Select...'}</span>
          <svg
            className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
          </svg>
        </button>

        {open && (
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`sm-item-${activeIndex}`}
            onKeyDown={onListKeyDown}
            className={cn(
              'absolute z-[1000] mt-1 w-full overflow-auto rounded-md border border-input bg-card text-foreground shadow-lg focus:outline-none max-h-60 py-1'
            )}
          >
            {items.map((item, idx) => (
              <li
                key={item.value}
                id={`sm-item-${idx}`}
                data-index={idx}
                role="option"
                aria-selected={value === item.value}
                tabIndex={0}
                onClick={() => !item.disabled && commitValue(item.value)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={cn(
                  'cursor-pointer select-none px-3 py-2 text-sm outline-none',
                  value === item.value && 'bg-accent text-accent-foreground',
                  idx === activeIndex && 'bg-accent',
                  item.disabled && 'opacity-50 pointer-events-none'
                )}
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)

SelectMenu.displayName = 'SelectMenu'

export default SelectMenu
