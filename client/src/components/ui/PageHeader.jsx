import { Button } from '@/components/ui/button'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-zinc-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
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
