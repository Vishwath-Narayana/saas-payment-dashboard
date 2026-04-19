import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useSocket } from '../../hooks/useSocket'
import { toast } from 'sonner'

export function DashboardLayout() {
  const [notifCount, setNotifCount] = useState(0)

  useSocket((transaction) => {
    setNotifCount(prev => prev + 1)
    toast.success(`New payment: ₹${transaction.amount}`, {
      description: `${transaction.status} via ${transaction.method}`,
    })
  })

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar notifCount={notifCount} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
