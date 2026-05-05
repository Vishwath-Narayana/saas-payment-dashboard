import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../api/admin.api'
import EmptyState from '../../components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { formatDate } from '../../utils/formatDate'
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react'

const ACTION_COLORS = {
  PAYMENT_CREATED: 'bg-cardTint-lavender text-brand-purple',
  USER_LOGIN:      'bg-cardTint-sky text-brand-teal',
  USER_SIGNUP:     'bg-cardTint-mint text-semantic-success',
  PAYMENT_VIEWED:  'bg-surface border border-hairline-strong text-charcoal',
}

const ACTION_LABELS = {
  PAYMENT_CREATED: 'Payment Created',
  USER_LOGIN:      'User Login',
  USER_SIGNUP:     'User Signup',
  PAYMENT_VIEWED:  'Payment Viewed',
}

export default function AdminLogs() {
  const [action, setAction] = useState('all')
  const [page,   setPage]   = useState(1)

  const params = {
    page, limit: 15,
    ...(action !== 'all' && { action })
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', params],
    queryFn:  () => adminAPI.logs(params).then(r => r.data.data),
    refetchInterval: 30_000,  // auto-refresh every 30s
  })

  const logs       = data?.logs       || []
  const pagination = data?.pagination || {}

  return (
    <div className="space-y-4">

      {/* Header Actions */}
      <div className="flex items-center justify-end">
        <Select value={action} onValueChange={v => { setAction(v); setPage(1) }}>
          <SelectTrigger className="w-44 h-10 bg-canvas border-hairline-strong text-ink rounded-md">
            <SelectValue placeholder="Filter action" />
          </SelectTrigger>
          <SelectContent className="bg-canvas border-hairline rounded-md shadow-md">
            <SelectItem value="all"             className="text-ink focus:bg-surface-soft">All Actions</SelectItem>
            <SelectItem value="PAYMENT_CREATED" className="text-ink focus:bg-surface-soft">Payment Created</SelectItem>
            <SelectItem value="USER_LOGIN"      className="text-ink focus:bg-surface-soft">User Login</SelectItem>
            <SelectItem value="USER_SIGNUP"     className="text-ink focus:bg-surface-soft">User Signup</SelectItem>
            <SelectItem value="PAYMENT_VIEWED"  className="text-ink focus:bg-surface-soft">Payment Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log list */}
      <div className="bg-canvas border border-hairline rounded-[12px] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-surface-soft rounded-md">
                <div className="h-8 w-8 bg-hairline rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-56 bg-hairline rounded-sm" />
                  <div className="h-3 w-32 bg-hairline rounded-sm" />
                </div>
                <div className="h-6 w-28 bg-hairline rounded-full" />
                <div className="h-3 w-24 bg-hairline rounded-sm" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No logs found"
            description="Activity will appear here as users interact with the platform"
          />
        ) : (
          <div className="divide-y divide-hairline">
            {logs.map(log => (
              <div key={log._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-soft transition-colors cursor-pointer"
              >
                {/* Avatar */}
                <div className="h-8 w-8 rounded-full bg-brand-lavender border border-hairline-strong flex items-center
                                justify-center shrink-0">
                  <span className="text-brand-purple800 text-xs font-semibold">
                    {log.userName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal text-sm truncate">
                    <span className="text-ink font-medium tracking-tight">{log.userName}</span>
                    {log.metadata?.amount && (
                      <span className="text-slate"> — ₹{log.metadata.amount} via {log.metadata.method}</span>
                    )}
                  </p>
                  <p className="text-slate text-[13px] mt-0.5">{log.userEmail}</p>
                </div>

                {/* Action badge */}
                <span className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold tracking-widest uppercase shrink-0
                                  ${ACTION_COLORS[log.action] || 'bg-surface border border-hairline-strong text-charcoal'}`}>
                  {ACTION_LABELS[log.action] || log.action}
                </span>

                {/* Date */}
                <span className="text-stone text-[13px] shrink-0 hidden sm:block">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate text-[13px] font-medium">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="border-hairline text-charcoal hover:bg-surface-soft disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.pages}
              className="border-hairline text-charcoal hover:bg-surface-soft disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
