import Button from './Button'

/**
 * ErrorState — Shown when a data fetch fails. Includes retry action.
 *
 * Props:
 *   message: string    — error description
 *   onRetry: () => void
 */
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      <Button variant="outline" onClick={onRetry}>Try Again</Button>
    </div>
  )
}

export default ErrorState