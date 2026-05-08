import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Home, Zap, Activity, Plus, Package, Bot, UserCircle } from 'lucide-react'
import { clsx } from 'clsx'

const MAIN_TABS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/workflows', icon: Zap, label: 'Workflows' },
  { to: '/activity', icon: Activity, label: 'Activity' },
]

const EXTRA_ITEMS = [
  { to: '/profile', icon: UserCircle, label: 'Profile' },
  { to: '/catalog', icon: Package, label: 'Catalog' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
]

const glass = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.55)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
} as React.CSSProperties

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
        {/* Extended panel */}
        <div
          className={clsx(
            'mb-3 rounded-full overflow-hidden transition-all duration-300 ease-out origin-bottom',
            open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3 pointer-events-none',
          )}
          style={glass}
        >
          <div className="grid grid-cols-3">
            {EXTRA_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => clsx(
                  'flex flex-col items-center gap-2 py-5 px-2 transition-colors',
                  isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <Icon size={24} strokeWidth={1.8} />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Tab bar + X blob */}
        <div className="flex items-center gap-3">
          {/* Main tab bar */}
          <div className="flex-1 flex items-center rounded-full px-1.5 py-1.5 gap-1" style={glass}>
            {MAIN_TABS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                {({ isActive }) => (
                  <div className={clsx(
                    'flex flex-col items-center gap-0.5 py-2 px-1 rounded-full transition-all duration-200',
                    isActive ? 'bg-accent text-white' : 'text-text-muted',
                  )}>
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className={clsx('text-[10px] font-semibold', isActive ? 'text-white' : 'text-text-muted')}>
                      {label}
                    </span>
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* X / + blob — separate */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95"
            style={glass}
          >
            <Plus
              size={22}
              strokeWidth={2}
              className={clsx(
                'transition-all duration-300',
                open ? 'rotate-45 text-accent' : 'text-text-secondary',
              )}
            />
          </button>
        </div>
      </div>
    </>
  )
}
