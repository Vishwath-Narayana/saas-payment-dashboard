import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionAPI } from '../../api/transaction.api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2, ShieldCheck, CreditCard, Smartphone, Wallet as WalletIcon } from 'lucide-react'

export default function CreatePaymentModal({ open, onClose }) {
  const queryClient     = useQueryClient()
  const idempotencyKey  = useRef(uuidv4())
  const [form, setForm] = useState({ amount: '', method: '', description: '' })

  // New key every time modal opens to allow retrying if modal was closed/reopened
  useEffect(() => {
    if (open) idempotencyKey.current = uuidv4()
  }, [open])

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => transactionAPI.create(data, idempotencyKey.current),
    onSuccess: (res) => {
      const t          = res.data.data.transaction
      const idempotent = res.data.idempotent

      if (idempotent) {
        toast.info('Duplicate request detected', {
          description: 'This payment was already processed.'
        })
      } else {
        toast.success(`Payment ${t.status}!`, {
          description: `₹${t.amount} via ${t.method}`
        })
      }

      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-daily'] })
      onClose()
      setForm({ amount: '', method: '', description: '' })
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Payment failed')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.method) return toast.error('Select a payment method')
    mutate({ ...form, amount: Number(form.amount) })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!bg-white border-hairline shadow-[var(--shadow-modal)] text-ink sm:max-w-md rounded-[var(--radius-card)] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-8 pb-4 space-y-1">
          <DialogTitle className="text-ink font-semibold text-[28px] leading-[1.2] tracking-tight">Create Payment</DialogTitle>
          <DialogDescription className="text-slate text-[16px] leading-[1.5]">
            Simulate a new payment transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
          <div className="space-y-2">
            <Label className="text-ink font-medium text-[14px]">Amount (₹)</Label>
            <Input
              type="number"
              placeholder="500"
              min={1}
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              required
              className="bg-white border-hairline-strong text-ink placeholder:text-stone/60
                         focus-visible:border-primary focus-visible:ring-0 rounded-md h-[44px] transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-ink font-medium text-[14px]">Payment Method</Label>
            <Select
              value={form.method}
              onValueChange={v => setForm(p => ({ ...p, method: v }))}
            >
              <SelectTrigger className="bg-white border-hairline-strong text-ink rounded-md h-[44px] focus:ring-0 focus:border-primary transition-all">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="bg-white border-hairline rounded-md shadow-md">
                <SelectItem value="card"   className="text-ink focus:bg-surface-soft font-sans cursor-pointer py-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate" />
                    <span>Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="upi"    className="text-ink focus:bg-surface-soft font-sans cursor-pointer py-2.5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-slate" />
                    <span>UPI</span>
                  </div>
                </SelectItem>
                <SelectItem value="wallet" className="text-ink focus:bg-surface-soft font-sans cursor-pointer py-2.5">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="h-4 w-4 text-slate" />
                    <span>Wallet</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-ink font-medium text-[14px]">
              Description
              <span className="text-stone font-normal ml-1">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. Monthly subscription"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              maxLength={200}
              className="bg-white border-hairline-strong text-ink placeholder:text-stone/60
                         focus-visible:border-primary focus-visible:ring-0 rounded-md h-[44px] transition-all"
            />
          </div>

          {/* Idempotency indicator */}
          <div className="flex items-center gap-3 p-4 bg-[#d9f3e1] border border-[#1aae39]/20 rounded-[8px]">
            <ShieldCheck className="h-4 w-4 text-[#1aae39] shrink-0" />
            <p className="text-[#1aae39] text-[13px] font-semibold tracking-tight">
              Protected against duplicate payments
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-[44px] text-[14px] font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-[44px] text-[14px] font-semibold bg-white !bg-white text-[#1a1a1a] !text-[#1a1a1a] border border-[#e5e3df] shadow-sm hover:bg-[#f6f5f4] transition-all"
            >
              <div className={cn("flex items-center justify-center blur-sm-transition", isPending && "transitioning")}>
                {isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                  : 'Confirm Payment'
                }
              </div>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

  )
}
