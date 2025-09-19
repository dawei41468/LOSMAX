import React from 'react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/dashboard/BottomNav'

export type AppShellProps = {
  title?: string
  subtitle?: string
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
  children: React.ReactNode
  className?: string
  showBottomNav?: boolean
  headerSticky?: boolean
}

// Mobile-first AppShell: fixed header, content with top/bottom padding, and bottom navigation.
// This component is UI-only and does not change routes or business logic.
export function AppShell({
  title,
  subtitle,
  headerLeft,
  headerRight,
  children,
  className,
  showBottomNav = true,
  headerSticky = true,
}: AppShellProps) {
  // Header height (including subtitle) driven by CSS var
  const header = (
    <div className="bg-surface h-[var(--app-header-h)]">
      <div className="flex flex-col h-full">
        {/* Top row: 2/3 height */}
        <div className="flex items-center justify-between px-app-header" style={{ height: 'calc(var(--app-header-h) * 2 / 3)' }}>
          <div className="min-w-6 flex items-center gap-2">{headerLeft ?? null}</div>
          {title && (
            <h1 className="text-xl font-semibold absolute left-1/2 -translate-x-1/2 truncate max-w-[60%] text-center">
              {title}
            </h1>
          )}
          <div className="flex items-center gap-2 ml-auto">{headerRight ?? null}</div>
        </div>
        {/* Bottom row (subtitle): 1/3 height */}
        {subtitle && (
          <div className="flex items-start justify-center" style={{ height: 'calc(var(--app-header-h) * 1 / 3)' }}>
            <p className="text-sm text-muted whitespace-nowrap">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col relative">
      {headerSticky ? (
        <header className="fixed top-0 left-0 right-0 z-50">{header}</header>
      ) : (
        <header className="z-50">{header}</header>
      )}

      {/* Content padding via global spacing utilities (ultra-compact mobile-first) */}
      <main className={cn('app-main px-app pt-header', showBottomNav && 'pb-nav', className)}>{children}</main>

      {showBottomNav && <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />}

      {/* Safe area inset for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}

export default AppShell
