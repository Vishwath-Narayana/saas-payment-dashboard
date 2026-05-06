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
  loading = false,
  className,
  style
}) {
  if (loading) return <StatCardSkeleton />

  const trendPositive = trend?.value > 0
  const trendNeutral  = trend?.value === 0

  return (
    <div
      className={cn(
        "bg-canvas border border-hairline p-6 rounded-[var(--radius-card)] shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-slate text-[14px] font-medium tracking-tight">{title}</p>
          <h3 className="text-ink font-bold text-2xl tracking-tight leading-none">{value}</h3>
          {subtitle && (
            <p className="text-stone text-[13px] mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-md", iconColor)}>
          <Icon className="h-5 w-5 opacity-80" />
        </div>
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1.5 mt-4">
          {trendNeutral ? (
            <Minus className="h-3.5 w-3.5 text-stone" />
          ) : trendPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-semantic-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-semantic-error" />
          )}
          <span className={cn(
            'text-xs font-semibold',
            trendNeutral  ? 'text-stone' :
            trendPositive ? 'text-semantic-success' : 'text-semantic-error'
          )}>
            {trendPositive && '+'}{trend.value}%
          </span>
          <span className="text-stone text-xs">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-canvas border border-hairline rounded-[12px] p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-surface-soft rounded-md" />
        <div className="h-9 w-9 bg-surface-soft rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-32 bg-surface-soft rounded-md" />
        <div className="h-3 w-20 bg-surface-soft rounded-md" />
      </div>
      <div className="h-3 w-28 bg-surface-soft rounded-md" />
    </div>
  )
}
