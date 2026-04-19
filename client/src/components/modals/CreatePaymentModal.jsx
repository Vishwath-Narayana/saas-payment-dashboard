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
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create Payment</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Simulate a new payment transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-zinc-300">Amount (₹)</Label>
            <Input
              type="number"
              placeholder="500"
              min={1}
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500
                         focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Payment Method</Label>
            <Select
              value={form.method}
              onValueChange={v => setForm(p => ({ ...p, method: v }))}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="card"   className="text-white focus:bg-zinc-700 font-sans cursor-pointer hover:bg-zinc-700 transition-colors">💳 Card</SelectItem>
                <SelectItem value="upi"    className="text-white focus:bg-zinc-700 font-sans cursor-pointer hover:bg-zinc-700 transition-colors">📱 UPI</SelectItem>
                <SelectItem value="wallet" className="text-white focus:bg-zinc-700 font-sans cursor-pointer hover:bg-zinc-700 transition-colors">👛 Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">
              Description
              <span className="text-zinc-500 font-normal ml-1">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. Monthly subscription"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              maxLength={200}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500
                         focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
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
