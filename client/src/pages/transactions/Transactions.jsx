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
  ChevronLeft, ChevronRight, Download,
  CreditCard, Smartphone, Wallet as WalletIcon
} from 'lucide-react'
import { exportAPI } from '../../api/analytics.api'

const METHOD_MAP = {
  card:   { label: 'Card',   icon: CreditCard },
  upi:    { label: 'UPI',    icon: Smartphone },
  wallet: { label: 'Wallet', icon: WalletIcon },
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-surface-soft rounded-md">
          <div className="h-4 w-24 bg-hairline rounded-sm" />
          <div className="h-4 w-32 bg-hairline rounded-sm flex-1" />
          <div className="h-4 w-16 bg-hairline rounded-sm" />
          <div className="h-6 w-20 bg-hairline rounded-full" />
          <div className="h-4 w-28 bg-hairline rounded-sm" />
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

      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => exportAPI.transactionsCSV({
            ...(status !== 'all' && { status }),
            ...(method !== 'all' && { method }),
          })}
          className="bg-canvas hover:bg-surface border border-hairline-strong text-ink h-[36px] rounded-md px-4 font-medium shadow-sm transition-all"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>

        {!isAdmin && (
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-canvas hover:bg-surface border border-hairline-strong text-ink h-[36px] rounded-md px-4 font-medium shadow-sm transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
          <Input
            placeholder="Search by amount..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 h-10 bg-canvas border-hairline-strong text-ink rounded-md
                       placeholder:text-stone focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-36 h-10 bg-canvas border-hairline-strong text-ink rounded-md">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-canvas border-hairline rounded-md shadow-md">
            <SelectItem value="all"     className="text-ink focus:bg-surface-soft">All Status</SelectItem>
            <SelectItem value="success" className="text-ink focus:bg-surface-soft">Success</SelectItem>
            <SelectItem value="failed"  className="text-ink focus:bg-surface-soft">Failed</SelectItem>
            <SelectItem value="pending" className="text-ink focus:bg-surface-soft">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={method} onValueChange={v => { setMethod(v); setPage(1) }}>
          <SelectTrigger className="w-36 h-10 bg-canvas border-hairline-strong text-ink rounded-md">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent className="bg-canvas border-hairline rounded-md shadow-md">
            <SelectItem value="all"    className="text-ink focus:bg-surface-soft">All Methods</SelectItem>
            <SelectItem value="card"   className="text-ink focus:bg-surface-soft">Card</SelectItem>
            <SelectItem value="upi"    className="text-ink focus:bg-surface-soft">UPI</SelectItem>
            <SelectItem value="wallet" className="text-ink focus:bg-surface-soft">Wallet</SelectItem>
          </SelectContent>
        </Select>

        {(status !== 'all' || method !== 'all' || search) && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-slate hover:text-ink hover:bg-surface-soft h-10 rounded-md px-3"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-[12px] overflow-hidden shadow-sm">
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
            <div className="grid grid-cols-12 gap-4 px-6 py-3
                            border-b border-hairline bg-surface-soft text-slate text-[11px] font-semibold uppercase tracking-widest">
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Method</div>
              <div className="col-span-2">Status</div>
              {isAdmin && <div className="col-span-2">User</div>}
              <div className={isAdmin ? 'col-span-2' : 'col-span-4'}>Description</div>
              <div className="col-span-2 text-right">Date</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-hairline">
              {transactions.map((t, index) => (
                <div
                  key={t._id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center
                             hover:bg-surface-soft transition-colors animate-slide-up-fade opacity-0"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="col-span-2">
                    <span className="text-ink font-semibold tracking-tight">
                      {formatCurrency(t.amount)}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-charcoal text-sm">
                      {(() => {
                        const m = METHOD_MAP[t.method]
                        if (!m) return <span>{t.method}</span>
                        const Icon = m.icon
                        return (
                          <>
                            <Icon className="h-3.5 w-3.5 text-slate" />
                            <span className="capitalize">{m.label}</span>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <StatusBadge status={t.status} />
                  </div>

                  {isAdmin && (
                    <div className="col-span-2 overflow-hidden">
                      <p className="text-ink text-[13px] truncate capitalize font-medium">
                        {t.userId?.name || '—'}
                      </p>
                      <p className="text-stone text-[11px] truncate">
                        {t.userId?.email}
                      </p>
                    </div>
                  )}

                  <div className={isAdmin ? 'col-span-2' : 'col-span-4'}>
                    <span className="text-charcoal text-[13px] truncate block">
                      {t.description || '—'}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-slate text-[13px]">
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate text-[13px] font-medium">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="border-hairline text-charcoal hover:bg-surface-soft disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.pages}
              className="border-hairline text-charcoal hover:bg-surface-soft disabled:opacity-40"
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
