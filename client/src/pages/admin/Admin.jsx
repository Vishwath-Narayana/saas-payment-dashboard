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
              iconColor="text-brand-purple"
              iconBg="bg-cardTint-lavender"
            />
            <StatCard
              title="Total Transactions"
              value={overview?.totalTransactions || 0}
              subtitle="All time"
              icon={ArrowLeftRight}
              iconColor="text-brand-teal"
              iconBg="bg-cardTint-sky"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary?.totalRevenue || 0)}
              subtitle="Successful payments"
              icon={DollarSign}
              iconColor="text-semantic-success"
              iconBg="bg-cardTint-mint"
            />
            <StatCard
              title="Success Rate"
              value={`${summary?.successRate || 0}%`}
              subtitle={`${summary?.failedCount || 0} failed`}
              icon={Activity}
              iconColor="text-brand-orange"
              iconBg="bg-cardTint-yellow"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-canvas border border-hairline rounded-[12px] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
          <div>
            <h3 className="text-ink font-semibold tracking-tight">Recent Activity</h3>
            <p className="text-slate text-[13px] mt-0.5">Latest system events</p>
          </div>
          <button
            onClick={() => navigate('/admin/logs')}
            className="text-link hover:text-link-pressed text-sm font-medium transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="divide-y divide-hairline">
          {loadingOverview ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-8 w-8 bg-surface-soft rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-48 bg-surface-soft rounded" />
                  <div className="h-3 w-24 bg-surface-soft rounded" />
                </div>
                <div className="h-3 w-20 bg-surface-soft rounded" />
              </div>
            ))
          ) : overview?.recentLogs?.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate text-sm">
              No activity yet
            </div>
          ) : (
            overview?.recentLogs?.map((log) => (
              <div key={log._id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface-soft transition-colors cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-brand-lavender border border-hairline-strong flex items-center justify-center shrink-0">
                  <span className="text-brand-purple800 text-xs font-bold">
                    {log.userName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal text-sm truncate">
                    <span className="text-ink font-semibold">{log.userName}</span>
                    {' '}{actionLabel(log.action)}
                    {log.metadata?.amount && (
                      <span className="text-brand-purple font-medium"> ₹{log.metadata.amount}</span>
                    )}
                  </p>
                  <p className="text-slate text-[13px] mt-0.5">{log.userEmail}</p>
                </div>
                <span className="text-stone text-[13px] shrink-0">
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
