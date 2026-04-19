import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../api/admin.api'
import { analyticsAPI } from '../../api/analytics.api'
import StatCard, { StatCardSkeleton } from '../../components/ui/StatCard'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { Users, ArrowLeftRight, DollarSign, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const navigate = useNavigate()

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn:  () => adminAPI.overview().then(r => r.data.data),
  })

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn:  () => analyticsAPI.summary().then(r => r.data.data),
  })

  const loading = loadingOverview || loadingSummary

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />) : (
          <>
            <StatCard
              title="Total Users"
              value={overview?.totalUsers || 0}
              subtitle="Registered accounts"
              icon={Users}
              iconColor="text-indigo-400"
              iconBg="bg-indigo-400/10"
            />
            <StatCard
              title="Total Transactions"
              value={overview?.totalTransactions || 0}
              subtitle="All time"
              icon={ArrowLeftRight}
              iconColor="text-blue-400"
              iconBg="bg-blue-400/10"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary?.totalRevenue || 0)}
              subtitle="Successful payments"
              icon={DollarSign}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-400/10"
            />
            <StatCard
              title="Success Rate"
              value={`${summary?.successRate || 0}%`}
              subtitle={`${summary?.failedCount || 0} failed`}
              icon={Activity}
              iconColor="text-yellow-400"
              iconBg="bg-yellow-400/10"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Recent Activity</h3>
            <p className="text-zinc-400 text-xs mt-0.5">Latest system events</p>
          </div>
          <button
            onClick={() => navigate('/admin/logs')}
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="divide-y divide-zinc-800">
          {loadingOverview ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-8 w-8 bg-zinc-800 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-48 bg-zinc-800 rounded" />
                  <div className="h-3 w-24 bg-zinc-800 rounded" />
                </div>
                <div className="h-3 w-20 bg-zinc-800 rounded" />
              </div>
            ))
          ) : overview?.recentLogs?.length === 0 ? (
            <div className="px-6 py-8 text-center text-zinc-500 text-sm">
              No activity yet
            </div>
          ) : (
            overview?.recentLogs?.map((log) => (
              <div key={log._id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-800/40 transition-colors">
                <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0">
                  <span className="text-indigo-400 text-xs font-bold">
                    {log.userName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 text-sm truncate">
                    <span className="text-white font-medium">{log.userName}</span>
                    {' '}{actionLabel(log.action)}
                    {log.metadata?.amount && (
                      <span className="text-indigo-400"> ₹{log.metadata.amount}</span>
                    )}
                  </p>
                  <p className="text-zinc-500 text-xs">{log.userEmail}</p>
                </div>
                <span className="text-zinc-500 text-xs shrink-0">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const actionLabel = (action) => {
  const map = {
    PAYMENT_CREATED: 'created a payment of',
    USER_LOGIN:      'logged in',
    USER_SIGNUP:     'signed up',
    PAYMENT_VIEWED:  'viewed a payment',
  }
  return map[action] || action
}
