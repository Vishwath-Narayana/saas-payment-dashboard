import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-400',
  iconBg   = 'bg-indigo-400/10',
  trend,      // { value: 12.5, label: 'vs last month' }
  loading = false
}) {
  if (loading) return <StatCardSkeleton />

  const trendPositive = trend?.value > 0
  const trendNeutral  = trend?.value === 0

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-sm font-medium">{title}</p>
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-zinc-500 text-xs">{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1.5">
          {trendNeutral ? (
            <Minus className="h-3.5 w-3.5 text-zinc-400" />
          ) : trendPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          )}
          <span className={cn(
            'text-xs font-medium',
            trendNeutral  ? 'text-zinc-400' :
            trendPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {trendPositive && '+'}{trend.value}%
          </span>
          <span className="text-zinc-500 text-xs">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-zinc-800 rounded" />
        <div className="h-9 w-9 bg-zinc-800 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-32 bg-zinc-800 rounded" />
        <div className="h-3 w-20 bg-zinc-800 rounded" />
      </div>
      <div className="h-3 w-28 bg-zinc-800 rounded" />
    </div>
  )
}
