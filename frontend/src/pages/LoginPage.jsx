import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Envelope, Lock } from '../utils/icons'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function LoginPage() {
  const { login, loading, error } = useAuth()
  const [serverError, setServerError] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setServerError(null)
    const result = await login(data.email, data.password)
    if (!result) {
      setServerError(error || 'Login failed. Please try again.')
      return
    }

    const params = new URLSearchParams(location.search)
    const redirectTo = params.get('redirect')
    const isAdmin = result.user?.role === 'admin' || result.user?.role === 'restaurant_admin'

    navigate(redirectTo || (isAdmin ? '/admin' : '/dashboard'), { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-bg to-primary-light px-4">
      <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] p-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-primary text-4xl tracking-wider">FoodHub</h1>
        </div>
        <h2 className="font-display text-3xl text-center mb-2">Welcome Back</h2>
        <p className="text-muted-foreground text-center mb-8">Sign in to your FoodHub account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-[var(--radius-sm)] p-3">{serverError}</div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={Envelope}
            error={errors.email?.message}
            disabled={loading}
            register={register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            error={errors.password?.message}
            disabled={loading}
            register={register('password')}
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>
          <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary block">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
