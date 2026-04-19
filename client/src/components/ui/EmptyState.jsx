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
        <div className="p-4 bg-zinc-800 rounded-full mb-4">
          <Icon className="h-8 w-8 text-zinc-500" />
        </div>
      )}
      <h3 className="text-white font-medium text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-zinc-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
