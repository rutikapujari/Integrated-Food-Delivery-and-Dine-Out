import { useState } from 'react'
import { Eye, EyeSlash } from '../../utils/icons'

function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  iconRightOnClick,
  required = false,
  disabled = false,
  register,
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={resolvedType}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'w-full h-11 px-4 rounded-[var(--radius-sm)] border',
            'placeholder:text-muted-foreground/60',
            'transition-all duration-150',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
            'disabled:bg-surface-muted disabled:opacity-60',
            Icon ? 'pl-10' : '',
            (IconRight || isPassword) ? 'pr-10' : '',
            error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border',
            className,
          ].join(' ')}
          {...register}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {!isPassword && IconRight && (
          <button
            type="button"
            onClick={iconRightOnClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            <IconRight className="w-5 h-5" />
          </button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
    </div>
  )
}

export default Input
