import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { transactionAPI } from '../../api/transaction.api'
import { useAuth } from '../../context/AuthContext'
import { useDebounce } from '../../hooks/useDebounce'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import CreatePaymentModal from '../../components/modals/CreatePaymentModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import {
  Plus, Search, ArrowLeftRight,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const METHOD_ICONS = { card: '💳', upi: '📱', wallet: '👛' }

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900 rounded-lg">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-32 bg-zinc-800 rounded flex-1" />
          <div className="h-4 w-16 bg-zinc-800 rounded" />
          <div className="h-6 w-20 bg-zinc-800 rounded-full" />
          <div className="h-4 w-28 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function Transactions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [modalOpen, setModalOpen] = useState(false)
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('all')
  const [method,    setMethod]    = useState('all')
  const [page,      setPage]      = useState(1)

  const debouncedSearch = useDebounce(search, 300)

  const params = {
    page,
    limit: 10,
    ...(status !== 'all' && { status }),
    ...(method !== 'all' && { method }),
    ...(debouncedSearch  && { search: debouncedSearch }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', params, isAdmin],
    queryFn:  () => isAdmin
      ? transactionAPI.adminAll(params).then(r => r.data.data)
      : transactionAPI.getAll(params).then(r => r.data.data),
  })

  const transactions = data?.transactions || []
  const pagination   = data?.pagination   || {}

  const resetFilters = () => {
    setSearch('')
    setStatus('all')
    setMethod('all')
    setPage(1)
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">Transactions</h2>
          <p className="text-zinc-400 text-sm mt-0.5">
            {pagination.total
              ? `${pagination.total} total transactions`
              : 'Your payment history'
            }
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by amount..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white
                       placeholder:text-zinc-500 focus:border-indigo-500"
          />
        </div>

        <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-36 bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all"     className="text-white focus:bg-zinc-700">All Status</SelectItem>
            <SelectItem value="success" className="text-white focus:bg-zinc-700">Success</SelectItem>
            <SelectItem value="failed"  className="text-white focus:bg-zinc-700">Failed</SelectItem>
            <SelectItem value="pending" className="text-white focus:bg-zinc-700">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={method} onValueChange={v => { setMethod(v); setPage(1) }}>
          <SelectTrigger className="w-36 bg-zinc-900 border-zinc-800 text-zinc-300">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all"    className="text-white focus:bg-zinc-700">All Methods</SelectItem>
            <SelectItem value="card"   className="text-white focus:bg-zinc-700">💳 Card</SelectItem>
            <SelectItem value="upi"    className="text-white focus:bg-zinc-700">📱 UPI</SelectItem>
            <SelectItem value="wallet" className="text-white focus:bg-zinc-700">👛 Wallet</SelectItem>
          </SelectContent>
        </Select>

        {(status !== 'all' || method !== 'all' || search) && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            description={
              search || status !== 'all' || method !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first payment to get started'
            }
            action={!isAdmin && !search ? {
              label: 'Create Payment',
              onClick: () => setModalOpen(true)
            } : undefined}
          />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3
                            border-b border-zinc-800 text-zinc-500 text-xs font-medium uppercase tracking-wider">
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Method</div>
              <div className="col-span-2">Status</div>
              {isAdmin && <div className="col-span-3">User</div>}
              <div className={isAdmin ? 'col-span-3' : 'col-span-4'}>Description</div>
              <div className="col-span-2 text-right">Date</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-800">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center
                             hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="col-span-2">
                    <span className="text-white font-semibold">
                      {formatCurrency(t.amount)}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-zinc-300 text-sm">
                      {METHOD_ICONS[t.method]} {t.method}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <StatusBadge status={t.status} />
                  </div>

                  {isAdmin && (
                    <div className="col-span-3">
                      <p className="text-zinc-300 text-sm truncate uppercase font-medium">
                        {t.userId?.name || '—'}
                      </p>
                      <p className="text-zinc-500 text-xs truncate">
                        {t.userId?.email}
                      </p>
                    </div>
                  )}

                  <div className={isAdmin ? 'col-span-3' : 'col-span-4'}>
                    <span className="text-zinc-400 text-sm truncate block">
                      {t.description || '—'}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-zinc-400 text-xs">
                      {formatDate(t.createdAt)}
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
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.pages}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CreatePaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
