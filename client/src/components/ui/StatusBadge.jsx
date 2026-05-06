import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

const config = {
  success: {
    label: 'Success',
    icon:  CheckCircle2,
    class: 'bg-[#d9f3e1] text-[#1aae39] border-[#1aae39]/20'
  },
  failed: {
    label: 'Failed',
    icon:  XCircle,
    class: 'bg-[#fde0ec] text-[#e03131] border-[#e03131]/20'
  },
  pending: {
    label: 'Pending',
    icon:  Clock,
    class: 'bg-[#fef7d6] text-[#dd5b00] border-[#dd5b00]/20'
  }
}

export default function StatusBadge({ status }) {
  const cfg  = config[status] || config.pending
  const Icon = cfg.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      cfg.class
    )}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}
