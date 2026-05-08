import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Home, Zap, Package, Activity, Bot, UserCircle,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import logoH from '../../assets/logo-horizontal.png'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/workflows', icon: Zap, label: 'Workflows' },
  { to: '/catalog', icon: Package, label: 'Catalog' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/ai', icon: Bot, label: 'AI Assistant' },
]

export function Sidebar() {
  const { user } = useAuthStore()

  return (
    <aside className="sidebar fixed left-0 top-0 h-full w-60 flex flex-col z-40 py-5 px-3">
      {/* Logo */}
      <div className="px-2 mb-6">
        <img src={logoH} alt="Houseleek" className="h-12 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Profile */}
      <div className="border-t border-border/40 pt-3 mt-3">
        <NavLink
          to="/profile"
          className={({ isActive }) => clsx('nav-item', isActive && 'active')}
        >
          <UserCircle size={18} />
          <div className="flex flex-col min-w-0">
            <span className="truncate leading-tight">{user?.name ?? 'Profile'}</span>
            <span className="text-[10px] text-text-muted capitalize leading-tight">{user?.role}</span>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
