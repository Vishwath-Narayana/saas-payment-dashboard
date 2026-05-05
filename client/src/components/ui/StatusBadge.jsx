import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

const config = {
  success: {
    label: 'Success',
    icon:  CheckCircle2,
    class: 'bg-cardTint-mint text-semantic-success border-semantic-success/20'
  },
  failed: {
    label: 'Failed',
    icon:  XCircle,
    class: 'bg-cardTint-rose text-semantic-error border-semantic-error/20'
  },
  pending: {
    label: 'Pending',
    icon:  Clock,
    class: 'bg-cardTint-yellow text-brand-orange border-brand-orange/20'
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
