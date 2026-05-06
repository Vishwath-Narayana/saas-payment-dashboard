import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, Shield,
  Users, FileText, CreditCard, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    role: 'user' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions', role: 'user' },
]

const adminItems = [
  { to: '/admin',        icon: Shield,    label: 'Overview' },
  { to: '/admin/users',  icon: Users,     label: 'Users' },
  { to: '/admin/logs',   icon: FileText,  label: 'Activity Logs' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-canvas border-r border-hairline flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="p-4 border-b border-hairline-soft">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-canvas border border-hairline-strong text-ink rounded-md shadow-sm">
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-ink font-semibold text-base tracking-tight">PayDash</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

        {/* User nav */}
        <p className="text-stone text-[11px] font-semibold uppercase tracking-widest px-3 mb-1 mt-2">
          MAIN
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-[transform,colors] duration-200 ease-[var(--ease-out)] active:scale-[0.98]',
              isActive
                ? 'bg-surface-soft text-ink font-semibold'
                : 'text-slate hover:bg-surface-soft hover:text-ink'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {/* Admin nav */}
        {user?.role === 'admin' && (
          <>
            <p className="text-stone text-[11px] font-semibold uppercase tracking-widest px-3 mb-1 mt-6">
              Admin
            </p>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-[transform,colors] duration-200 ease-[var(--ease-out)] active:scale-[0.98]',
                  isActive
                    ? 'bg-surface-soft text-ink font-semibold'
                    : 'text-slate hover:bg-surface-soft hover:text-ink'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-hairline-soft">
        <div className="flex items-center gap-3 px-3 py-2 mb-1 hover:bg-surface-soft rounded-md cursor-pointer transition-colors">
          <div className="h-7 w-7 rounded-md bg-[#f0eeec] border border-hairline-strong flex items-center justify-center shrink-0">
            <span className="text-[#37352f] text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-ink text-sm font-medium truncate">{user?.name}</p>
            <p className="text-stone text-xs truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                     text-slate hover:text-ink hover:bg-surface-soft transition-[transform,colors] duration-200 ease-[var(--ease-out)] active:scale-[0.98] w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
