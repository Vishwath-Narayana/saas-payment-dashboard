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
          <h2 className="text-white text-xl font-semibold">Users</h2>
          <p className="text-zinc-400 text-sm mt-0.5">
            {pagination.total ? `${pagination.total} registered users` : 'All accounts'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="pl-9 bg-zinc-900 border-zinc-800 text-white
                     placeholder:text-zinc-500 focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="h-8 w-8 bg-zinc-800 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-zinc-800 rounded" />
                  <div className="h-3 w-48 bg-zinc-800 rounded" />
                </div>
                <div className="h-3 w-24 bg-zinc-800 rounded" />
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
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-800
                            text-zinc-500 text-xs font-medium uppercase tracking-wider">
              <div className="col-span-5">User</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-4 text-right">Joined</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-800">
              {users.map(user => (
                <div key={user._id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center
                             hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center
                                    justify-center shrink-0">
                      <span className="text-indigo-400 text-sm font-medium">
                        {user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{user.name}</p>
                      <p className="text-zinc-400 text-xs truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium
                                     bg-zinc-800 text-zinc-300 capitalize">
                      {user.role}
                    </span>
                  </div>

                  <div className="col-span-4 text-right">
                    <span className="text-zinc-400 text-xs">
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
