import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Check, Trash2 } from 'lucide-react'
// Use custom SelectMenu (token-themed, non-native) for consistent dropdown styling
import SelectMenu from '@/components/ui/select-menu'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/ui/BadgeUI'
import { CategoryHeader } from '@/components/ui/CategoryUI'
import { DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useTheme } from '@/contexts/ThemeContext'

// Developer-only showcase for primitives. Not routed; import this into any page temporarily during development to preview.
export default function UIKitDemo() {
  const [open, setOpen] = React.useState(false)
  const [progress, setProgress] = React.useState(42)
  const [filter, setFilter] = React.useState<'active' | 'completed' | 'all'>('active')
  const { theme, toggleTheme } = useTheme()
  const [debugBorders, setDebugBorders] = React.useState(false)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : Math.min(p + 7, 100)))
    }, 1200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="py-1 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">UI Kit Demo</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => toggleTheme()}>
            Toggle {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDebugBorders((d) => !d)}>
            {debugBorders ? 'Hide' : 'Show'} Borders
          </Button>
        </div>
      </div>

      {/* Buttons */}
      <Card variant="flat" size="none" className={debugBorders ? 'border-red-500 border-dotted' : ''}>
        <CardHeader size="sm" spacing="tight" className="px-1">
          <CardTitle size="sm">Buttons</CardTitle>
          <CardDescription>Primary actions and variants</CardDescription>
        </CardHeader>
        <CardContent size="sm" className="px-1">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Select + Badges */}
      <Card variant="flat" size="none">
        <CardHeader size="sm" spacing="tight" className="px-1">
          <CardTitle size="sm">Filters & Status</CardTitle>
          <CardDescription>Compact inputs with tokens</CardDescription>
        </CardHeader>
        <CardContent size="sm" className="px-1">
          <div className="flex items-center justify-between gap-3">
            <SelectMenu
              variant="default"
              size="sm"
              value={filter}
              onChange={(v) => setFilter(v as typeof filter)}
              items={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'all', label: 'All' },
              ]}
              placeholder="Filter"
              className="min-w-[140px]"
            />
            <div className="flex items-center gap-2">
              <StatusBadge status="active" />
              <StatusBadge status="completed" />
              <StatusBadge status="incomplete" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card variant="flat" size="none">
        <CardHeader size="sm" spacing="tight" className="px-1">
          <CardTitle size="sm">Progress</CardTitle>
          <CardDescription>Animated example</CardDescription>
        </CardHeader>
        <CardContent size="sm" spacing="tight" className="px-1">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-medium w-10 text-right">{progress}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Category header + Card variants */}
      <Card variant="flat" size="none">
        <CardHeader size="sm" spacing="tight" className="px-1">
          <CardTitle size="sm">Cards</CardTitle>
          <CardDescription>Variants and borders</CardDescription>
        </CardHeader>
        <CardContent size="sm" spacing="loose" className="px-1">
          <CategoryHeader category="Work" />

          <Card variant="elevated" border="work" interactive className={debugBorders ? 'border-red-500 border-dotted' : ''}>
            <CardHeader size="sm">
              <CardTitle size="sm">Elevated Card</CardTitle>
              <CardDescription>Hover to see elevation</CardDescription>
            </CardHeader>
            <CardContent size="sm">
              <p className="text-sm text-muted-foreground">Content area with standard spacing.</p>
            </CardContent>
            <CardFooter align="right" size="sm" className="px-1">
              <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Open Dialog</Button>
            </CardFooter>
          </Card>

          <Card variant="outline" border="accent" className={debugBorders ? 'border-red-500 border-dotted' : ''}>
            <CardHeader size="sm">
              <CardTitle size="sm">Outline Card</CardTitle>
            </CardHeader>
            <CardContent size="sm">
              <p className="text-sm">Border-emphasis visual for sections.</p>
            </CardContent>
          </Card>

          {/* Variant gallery */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Variant Gallery</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card variant="default" className={debugBorders ? 'border-red-500 border-dotted' : ''}>
                <CardHeader size="sm">
                  <CardTitle size="sm">Default</CardTitle>
                  <CardDescription>Shadowed base card</CardDescription>
                </CardHeader>
                <CardContent size="sm">
                  <p className="text-sm text-muted-foreground">Good for primary content areas.</p>
                </CardContent>
              </Card>

              <Card variant="flat" className={debugBorders ? 'border-red-500 border-dotted' : ''}>
                <CardHeader size="sm">
                  <CardTitle size="sm">Flat</CardTitle>
                  <CardDescription>Thin border, minimal elevation</CardDescription>
                </CardHeader>
                <CardContent size="sm">
                  <p className="text-sm text-muted-foreground">Great for dense layouts.</p>
                </CardContent>
              </Card>

              <Card variant="ghost" className={debugBorders ? 'border-red-500 border-dotted' : ''}>
                <CardHeader size="sm">
                  <CardTitle size="sm">Ghost</CardTitle>
                  <CardDescription>No border, no shadow</CardDescription>
                </CardHeader>
                <CardContent size="sm">
                  <p className="text-sm text-muted-foreground">Use for very subtle grouping.</p>
                </CardContent>
              </Card>

              <Card variant="subtle" className={debugBorders ? 'border-red-500 border-dotted' : ''}>
                <CardHeader size="sm">
                  <CardTitle size="sm">Subtle</CardTitle>
                  <CardDescription>Light shadow, calm presence</CardDescription>
                </CardHeader>
                <CardContent size="sm">
                  <p className="text-sm text-muted-foreground">Use where a soft emphasis is needed.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Goal Card (mock) */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Goal Card (Original)</div>
            <Card variant="elevated" border="work" interactive>
              <CardHeader>
                <div className="flex items-start justify-between w-full">
                  <CardTitle size="sm" color="primary">Ship UI Kit Enhancements</CardTitle>
                  <StatusBadge status="active" />
                </div>
              </CardHeader>
              <CardContent spacing="tight">
                <p className="text-sm text-muted-foreground">Details: refine buttons, selects, and card system.</p>
              </CardContent>
              <CardContent spacing="tight">
                <p className="text-sm">Target Date: 2025-09-30</p>
                <p className="text-sm">Days Left: <span className="font-medium">11</span></p>
              </CardContent>
              <CardFooter align="right" spacing="loose">
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">Edit</Button>
                  <Button size="sm" variant="secondary">Complete</Button>
                  <Button size="sm" variant="destructive">Delete</Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Goal Card (redesigned) */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Goal Card (Redesigned)</div>
            <Card variant="elevated" border="none" interactive className="relative overflow-hidden">
              {/* Category accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--category-work)]"></div>
              
              <CardHeader size="sm" spacing="tight">
                <div className="flex items-start justify-between w-full mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle size="sm" color="none" className="text-[var(--category-work)] font-semibold mb-1 leading-tight">
                      Ship UI Kit Enhancements
                    </CardTitle>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Details: refine buttons, selects, and card system.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <StatusBadge status="active" />
                  </div>
                </div>
              </CardHeader>

              <CardContent size="sm" spacing="none">
                {/* Timeline info with modern layout */}
                <div className="bg-muted/30 rounded-md p-3 mb-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Target Date</div>
                      <div className="text-sm font-medium">2025-09-30</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Days Left</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--category-work)]">11</span>
                        <div className="flex-1 bg-border rounded-full h-1.5">
                          <div className="bg-[var(--category-work)] h-1.5 rounded-full" style={{width: '65%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter size="sm" align="between" spacing="tight">
                <div className="text-xs px-2 py-1 rounded-full bg-[var(--category-work)]/15 text-[var(--category-work)] font-medium">
                  Work
                </div>
                <div className="flex gap-3">
                  <button aria-label="Edit" className="btn btn-ghost btn-sm">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button aria-label="Complete" className="btn btn-ghost btn-sm">
                    <Check className="w-4 h-4 text-success" />
                  </button>
                  <button aria-label="Delete" className="btn btn-ghost btn-sm">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Goal Card (creative) */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Goal Card (Creative)</div>
            <Card variant="ghost" interactive className="relative overflow-hidden bg-gradient-to-br from-[var(--category-work)]/5 via-transparent to-[var(--category-work)]/10 border-l-4 border-l-[var(--category-work)] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              
              <CardContent size="sm" spacing="none" className="p-4">
                {/* Header with floating elements */}
                <div className="relative mb-4">
                  <div className="absolute -top-1 -right-1">
                    <div className="w-8 h-8 rounded-full bg-[var(--category-work)]/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--category-work)]"></div>
                    </div>
                  </div>
                  
                  <CardTitle size="sm" color="none" className="text-foreground font-bold mb-2 pr-10">
                    Ship UI Kit Enhancements
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status="active" />
                    <div className="text-xs px-2 py-1 rounded-full bg-[var(--category-work)]/15 text-[var(--category-work)] font-medium">
                      Work
                    </div>
                  </div>
                </div>

                {/* Description with icon */}
                <div className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-card/50 border border-border/50">
                  <div className="w-5 h-5 rounded bg-[var(--category-work)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-sm bg-[var(--category-work)]"></div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Details: refine buttons, selects, and card system.
                  </p>
                </div>

                {/* Circular progress with timeline */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="4"/>
                      <circle 
                        cx="32" cy="32" r="28" 
                        fill="none" 
                        stroke="var(--category-work)" 
                        strokeWidth="4"
                        strokeDasharray="175.9"
                        strokeDashoffset="61.6"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-[var(--category-work)]">11</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">TARGET</span>
                      <span className="text-sm font-semibold">Sep 30</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">PROGRESS</span>
                      <span className="text-sm font-semibold text-[var(--category-work)]">65%</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons with modern styling */}
                <div className="flex justify-center gap-4 pt-3 border-t border-border/30">
                  <button aria-label="Edit" className="btn btn-ghost btn-md">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button aria-label="Complete" className="btn btn-ghost btn-md">
                    <Check className="w-5 h-5 text-success" />
                  </button>
                  <button aria-label="Delete" className="btn btn-ghost btn-md">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Border gallery */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Borders</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card variant="flat" border="default"><CardHeader size="sm"><CardTitle size="sm">Default</CardTitle></CardHeader></Card>
              <Card variant="flat" border="accent"><CardHeader size="sm"><CardTitle size="sm">Accent</CardTitle></CardHeader></Card>
              <Card variant="flat" border="success"><CardHeader size="sm"><CardTitle size="sm">Success</CardTitle></CardHeader></Card>
              <Card variant="flat" border="warning"><CardHeader size="sm"><CardTitle size="sm">Warning</CardTitle></CardHeader></Card>
              <Card variant="flat" border="error"><CardHeader size="sm"><CardTitle size="sm">Error</CardTitle></CardHeader></Card>
              <Card variant="flat" border="work"><CardHeader size="sm"><CardTitle size="sm">Work</CardTitle></CardHeader></Card>
              <Card variant="flat" border="family"><CardHeader size="sm"><CardTitle size="sm">Family</CardTitle></CardHeader></Card>
              <Card variant="flat" border="personal"><CardHeader size="sm"><CardTitle size="sm">Personal</CardTitle></CardHeader></Card>
              <Card variant="flat" border="health"><CardHeader size="sm"><CardTitle size="sm">Health</CardTitle></CardHeader></Card>
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Sizes</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card size="sm"><CardHeader size="sm"><CardTitle size="sm">Small</CardTitle></CardHeader><CardContent size="sm"><p className="text-sm">Compact spacing</p></CardContent></Card>
              <Card size="default"><CardHeader size="default"><CardTitle>Default</CardTitle></CardHeader><CardContent size="default"><p className="text-sm">Standard spacing</p></CardContent></Card>
              <Card size="lg"><CardHeader size="lg"><CardTitle size="lg">Large</CardTitle></CardHeader><CardContent size="lg"><p className="text-sm">Spacious content</p></CardContent></Card>
            </div>
          </div>

          {/* Special styles */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Special Styles</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card variant="quoteOD">
                <CardHeader size="sm" align="center" spacing="tight">
                  <CardTitle size="sm" color="secondary">Quote of the Day</CardTitle>
                  <CardDescription>Example of theme-specific variant</CardDescription>
                </CardHeader>
                <CardContent size="sm">
                  <p className="italic">“Simplicity is the soul of efficiency.”</p>
                </CardContent>
              </Card>

              <Card variant="taskST">
                <CardHeader size="sm">
                  <CardTitle size="sm">Task Style</CardTitle>
                  <CardDescription>Emphasizes foreground contrast</CardDescription>
                </CardHeader>
                <CardContent size="sm">
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Checklist appearance</li>
                    <li>High contrast for readability</li>
                  </ul>
                </CardContent>
                <CardFooter align="right" size="sm">
                  <Button size="sm" variant="outline">Action</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      {open && (
        <DialogOverlay onClick={() => setOpen(false)}>
          <DialogContent onClick={(e) => e.stopPropagation()} onClose={() => setOpen(false)}>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>Are you sure you want to proceed?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </DialogOverlay>
      )}
    </div>
  )
}
