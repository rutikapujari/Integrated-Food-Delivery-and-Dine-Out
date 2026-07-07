import { Spinner } from '../../utils/icons'

function Loader({ variant = 'spinner', count = 3, className = '' }) {
  if (variant === 'page') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-[var(--radius-lg)] overflow-hidden animate-pulse">
            <div className="h-48 bg-border" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded" />
              <div className="h-4 w-full bg-border rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'text') {
    return <div className={`h-4 w-full rounded bg-border animate-pulse ${className}`} />
  }

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <Spinner className="w-8 h-8 text-primary animate-spin" />
    </div>
  )
}

export default Loader
