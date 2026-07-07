import { Spinner } from '../../utils/icons'

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  className = '',
  ...rest
}) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-[var(--shadow-button)]',
    secondary: 'bg-surface-muted text-foreground hover:bg-border',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light',
    ghost: 'text-foreground hover:bg-surface-muted',
    destructive: 'bg-destructive text-white hover:bg-destructive-hover',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  }

  const isDisabled = disabled || loading

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <Spinner className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="w-5 h-5" />}
    </button>
  )
}

export default Button
