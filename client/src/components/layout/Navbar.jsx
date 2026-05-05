import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Bell } from 'lucide-react'

const pageTitles = {
  '/dashboard':    { title: 'Dashboard',     subtitle: 'Overview of your payments' },
  '/transactions': { title: 'Transactions',  subtitle: 'Your payment history' },
  '/admin':        { title: 'Admin Overview',subtitle: 'System-wide analytics' },
  '/admin/users':  { title: 'Users',         subtitle: 'Manage all users' },
  '/admin/logs':   { title: 'Activity Logs', subtitle: 'System activity' },
}

export default function Navbar({ notifCount = 0 }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const page = pageTitles[pathname] || { title: 'PayDash', subtitle: '' }

  return (
    <header className="h-[64px] border-b border-hairline bg-canvas px-6
                       flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-ink font-semibold text-lg leading-tight tracking-tight">{page.title}</h1>
        {page.subtitle && (
          <p className="text-slate text-[13px] mt-0.5">{page.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative">
          <button className="p-2 rounded-md text-slate hover:text-ink hover:bg-surface-soft transition-colors border border-transparent hover:border-hairline">
            <Bell className="h-5 w-5" />
          </button>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 h-[18px] w-[18px] bg-primary rounded-full
                             flex items-center justify-center text-onPrimary text-[10px] font-bold ring-2 ring-canvas">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </div>

        {/* User chip */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-soft border border-hairline rounded-md hover:bg-surface transition-colors cursor-pointer">
          <div className="h-5 w-5 rounded-sm bg-brand-pink border border-hairline flex items-center justify-center">
            <span className="text-onPrimary text-[10px] font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-charcoal text-sm font-medium">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  )
}
