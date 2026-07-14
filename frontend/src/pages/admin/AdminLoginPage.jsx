import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { Envelope, Lock, ArrowLeft } from '../../utils/icons'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function AdminLoginPage() {
  const { login, loading } = useAuth()
  const { error: reduxError } = useSelector((state) => state.auth)
  const [serverError, setServerError] = useState(null)
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
      setServerError(reduxError || 'Login failed. Please try again.')
      return
    }

    if (result.user?.role !== 'admin') {
      setServerError('Access denied. This portal is for administrators only.')
      return
    }

    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-wider text-white mb-2">
            FoodHub<span className="text-primary">Admin</span>
          </h1>
          <p className="text-slate-400">Administrator Portal</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-semibold text-white">Admin Sign In</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                {serverError}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="admin@foodhub.com"
              icon={Envelope}
              error={errors.email?.message}
              disabled={loading}
              register={register('email')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password?.message}
              disabled={loading}
              register={register('password')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Sign In to Admin
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 text-center">
              Need an admin account?{' '}
              <Link to="/admin/register" className="text-primary font-semibold hover:underline">
                Register as Admin
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
            Back to FoodHub Website
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
