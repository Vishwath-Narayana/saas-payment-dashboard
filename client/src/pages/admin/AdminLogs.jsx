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
  PAYMENT_CREATED: 'bg-indigo-500/10 text-indigo-400',
  USER_LOGIN:      'bg-blue-500/10 text-blue-400',
  USER_SIGNUP:     'bg-emerald-500/10 text-emerald-400',
  PAYMENT_VIEWED:  'bg-zinc-500/10 text-zinc-400',
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Activity Logs</h2>
          <p className="text-zinc-400 text-sm mt-0.5">
            {pagination.total ? `${pagination.total} total events` : 'System activity'}
          </p>
        </div>

        <Select value={action} onValueChange={v => { setAction(v); setPage(1) }}>
          <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectValue placeholder="Filter action" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all"             className="text-white focus:bg-zinc-700">All Actions</SelectItem>
            <SelectItem value="PAYMENT_CREATED" className="text-white focus:bg-zinc-700">Payment Created</SelectItem>
            <SelectItem value="USER_LOGIN"      className="text-white focus:bg-zinc-700">User Login</SelectItem>
            <SelectItem value="USER_SIGNUP"     className="text-white focus:bg-zinc-700">User Signup</SelectItem>
            <SelectItem value="PAYMENT_VIEWED"  className="text-white focus:bg-zinc-700">Payment Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="h-8 w-8 bg-zinc-800 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-56 bg-zinc-800 rounded" />
                  <div className="h-3 w-32 bg-zinc-800 rounded" />
                </div>
                <div className="h-6 w-28 bg-zinc-800 rounded-full" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
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
          <div className="divide-y divide-zinc-800">
            {logs.map(log => (
              <div key={log._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/40 transition-colors"
              >
                {/* Avatar */}
                <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center
                                justify-center shrink-0">
                  <span className="text-indigo-400 text-xs font-bold">
                    {log.userName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 text-sm truncate">
                    <span className="text-white font-medium">{log.userName}</span>
                    {log.metadata?.amount && (
                      <span className="text-zinc-400"> — ₹{log.metadata.amount} via {log.metadata.method}</span>
                    )}
                  </p>
                  <p className="text-zinc-500 text-xs">{log.userEmail}</p>
                </div>

                {/* Action badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0
                                  ${ACTION_COLORS[log.action] || 'bg-zinc-800 text-zinc-400'}`}>
                  {ACTION_LABELS[log.action] || log.action}
                </span>

                {/* Date */}
                <span className="text-zinc-500 text-xs shrink-0 hidden sm:block">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-zinc-400 text-sm">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.pages}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
