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
    <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-6
                       flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-white font-semibold text-lg leading-none">{page.title}</h1>
        {page.subtitle && (
          <p className="text-zinc-400 text-xs mt-0.5">{page.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative">
          <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-600 rounded-full
                             flex items-center justify-center text-white text-xs">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </div>

        {/* User chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
          <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-zinc-300 text-sm">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  )
}
