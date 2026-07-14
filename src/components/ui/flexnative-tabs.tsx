'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

type Orientation = 'horizontal' | 'vertical'

type TabsContextValue = {
  value: string | undefined
  setValue: (value: string) => void
  orientation: Orientation
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be rendered inside <Tabs>.')
  }
  return context
}

function Tabs({
  className,
  orientation = 'horizontal',
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: Orientation
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = valueProp ?? uncontrolled
  const setValue = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange],
  )

  return (
    <TabsContext.Provider value={{ value, setValue, orientation }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          'group/tabs flex gap-2 data-[orientation=horizontal]:flex-col',
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-8 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  onKeyDown,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof tabsListVariants>) {
  const { orientation } = useTabsContext()

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    if (event.key !== nextKey && event.key !== prevKey) return
    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[data-slot="tabs-trigger"]:not([disabled])',
      ),
    )
    const current = triggers.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    if (current === -1) return
    event.preventDefault()
    const delta = event.key === nextKey ? 1 : -1
    const next = triggers[(current + delta + triggers.length) % triggers.length]
    next?.focus()
    next?.click()
  }

  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      data-variant={variant}
      aria-orientation={orientation}
      className={cn(tabsListVariants({ variant }), className)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  value,
  disabled,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { value: string }) {
  const { value: selected, setValue } = useTabsContext()
  const isActive = selected === value

  return (
    <button
      type="button"
      role="tab"
      data-slot="tabs-trigger"
      data-state={isActive ? 'active' : 'inactive'}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event)
        if (!disabled) setValue(value)
      }}
      className={cn(
        'relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all',
        'text-slate-500 hover:text-slate-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  ...props
}: React.ComponentProps<'div'> & { value: string }) {
  const { value: selected, orientation } = useTabsContext()
  if (selected !== value) return null

  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      data-state="active"
      data-orientation={orientation}
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger }

export default Tabs
