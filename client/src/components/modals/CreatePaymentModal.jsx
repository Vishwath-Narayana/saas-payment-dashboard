import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionAPI } from '../../api/transaction.api'
import { toast } from 'sonner'
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
import { Loader2 } from 'lucide-react'

export default function CreatePaymentModal({ open, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ amount: '', method: '', description: '' })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => transactionAPI.create(data),
    onSuccess: (res) => {
      const t = res.data.data.transaction
      toast.success(`Payment ${t.status}!`, {
        description: `₹${t.amount} via ${t.method}`
      })
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
      <DialogContent className="!bg-white border-hairline shadow-2xl text-ink sm:max-w-md rounded-lg overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-ink font-bold text-2xl tracking-tight">Create Payment</DialogTitle>
          <DialogDescription className="text-slate text-[15px]">
            Simulate a new payment transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
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
                <SelectItem value="card"   className="text-ink focus:bg-surface-soft font-sans cursor-pointer">💳 Card</SelectItem>
                <SelectItem value="upi"    className="text-ink focus:bg-surface-soft font-sans cursor-pointer">📱 UPI</SelectItem>
                <SelectItem value="wallet" className="text-ink focus:bg-surface-soft font-sans cursor-pointer">👛 Wallet</SelectItem>
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-surface border border-hairline-strong text-ink h-[44px] rounded-md font-bold text-[15px] transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-white hover:bg-surface border border-hairline-strong text-ink h-[44px] rounded-md font-bold text-[15px] transition-all"
            >
              {isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                : 'Create Payment'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
