import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../api/admin.api'
import { useDebounce } from '../../hooks/useDebounce'
import EmptyState from '../../components/ui/EmptyState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDate } from '../../utils/formatDate'
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const params = {
    page, limit: 10,
    ...(debouncedSearch && { search: debouncedSearch })
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', params],
    queryFn:  () => adminAPI.users(params).then(r => r.data.data),
  })

  const users      = data?.users      || []
  const pagination = data?.pagination || {}

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-ink text-2xl font-semibold tracking-tight">Users</h2>
          <p className="text-slate text-sm mt-0.5">
            {pagination.total ? `${pagination.total} registered users` : 'All accounts'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="pl-9 h-10 bg-canvas border-hairline-strong text-ink rounded-md
                     placeholder:text-stone focus-visible:ring-primary focus-visible:border-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-[12px] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-surface-soft rounded-md">
                <div className="h-8 w-8 bg-hairline rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-hairline rounded-sm" />
                  <div className="h-3 w-48 bg-hairline rounded-sm" />
                </div>
                <div className="h-3 w-24 bg-hairline rounded-sm" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={search ? 'Try a different search term' : 'No registered users yet'}
          />
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-hairline bg-surface-soft
                            text-slate text-[11px] font-semibold uppercase tracking-widest">
              <div className="col-span-5">User</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-4 text-right">Joined</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-hairline">
              {users.map(user => (
                <div key={user._id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center
                             hover:bg-surface-soft transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-lavender border border-hairline-strong flex items-center
                                    justify-center shrink-0">
                      <span className="text-brand-purple800 text-sm font-semibold">
                        {user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-ink text-sm font-medium truncate tracking-tight">{user.name}</p>
                      <p className="text-slate text-[13px] truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <span className="px-2.5 py-1 rounded-sm text-xs font-semibold
                                     bg-surface border border-hairline-strong text-charcoal capitalize tracking-tight">
                      {user.role}
                    </span>
                  </div>

                  <div className="col-span-4 text-right">
                    <span className="text-slate text-[13px]">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
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
