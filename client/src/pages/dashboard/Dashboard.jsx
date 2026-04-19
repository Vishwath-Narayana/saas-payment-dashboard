import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../api/analytics.api'
import StatCard, { StatCardSkeleton } from '../../components/ui/StatCard'
import RevenueChart from '../../components/charts/RevenueChart'
import MethodPieChart from '../../components/charts/MethodPieChart'
import MonthlyChart from '../../components/charts/MonthlyChart'
import { formatCurrency } from '../../utils/formatCurrency'
import {
  DollarSign, ArrowLeftRight,
  CheckCircle2, XCircle
} from 'lucide-react'

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn:  () => analyticsAPI.summary().then(r => r.data.data),
  })

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ['analytics-daily'],
    queryFn:  () => analyticsAPI.daily(30).then(r => r.data.data.daily),
  })

  const { data: methods, isLoading: loadingMethods } = useQuery({
    queryKey: ['analytics-methods'],
    queryFn:  () => analyticsAPI.methods().then(r => r.data.data.methods),
  })

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['analytics-monthly'],
    queryFn:  () => analyticsAPI.monthly().then(r => r.data.data.monthly),
  })

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loadingSummary ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary?.totalRevenue || 0)}
              subtitle="Successful payments only"
              icon={DollarSign}
              iconColor="text-indigo-400"
              iconBg="bg-indigo-400/10"
            />
            <StatCard
              title="Total Transactions"
              value={summary?.totalTransactions || 0}
              subtitle="All time"
              icon={ArrowLeftRight}
              iconColor="text-blue-400"
              iconBg="bg-blue-400/10"
            />
            <StatCard
              title="Success Rate"
              value={`${summary?.successRate || 0}%`}
              subtitle={`${summary?.successCount || 0} successful`}
              icon={CheckCircle2}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-400/10"
            />
            <StatCard
              title="Failed"
              value={summary?.failedCount || 0}
              subtitle={`${summary?.pendingCount || 0} pending`}
              icon={XCircle}
              iconColor="text-red-400"
              iconBg="bg-red-400/10"
            />
          </>
        )}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          {loadingDaily
            ? <ChartSkeleton />
            : <RevenueChart data={daily || []} />
          }
        </div>
        <div>
          {loadingMethods
            ? <ChartSkeleton />
            : <MethodPieChart data={methods || []} />
          }
        </div>
      </div>

      {/* Charts row 2 */}
      {loadingMonthly
        ? <ChartSkeleton />
        : <MonthlyChart data={monthly || []} />
      }
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
      <div className="h-4 w-32 bg-zinc-800 rounded mb-1" />
      <div className="h-3 w-20 bg-zinc-800 rounded mb-6" />
      <div className="h-64 bg-zinc-800 rounded" />
    </div>
  )
}
