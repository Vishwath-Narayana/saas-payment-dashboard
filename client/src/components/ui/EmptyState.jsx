import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,        // { label: 'Create Payment', onClick: fn }
  className
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      {Icon && (
        <div className="p-4 bg-surface-soft border border-hairline rounded-full mb-4">
          <Icon className="h-8 w-8 text-stone" />
        </div>
      )}
      <h3 className="text-ink font-semibold tracking-tight text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-slate text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-primary hover:bg-primary-pressed text-onPrimary font-medium rounded-md px-4 h-[36px]"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
