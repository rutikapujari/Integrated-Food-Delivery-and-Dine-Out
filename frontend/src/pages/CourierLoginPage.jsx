import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { courierLogin } from '../redux/courierAuthSlice'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Envelope, Lock, Motorcycle } from '../utils/icons'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function CourierLoginPage() {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.courierAuth)
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
    const result = await dispatch(courierLogin(data))
    if (!courierLogin.fulfilled.match(result)) {
      setServerError(result.payload || 'Login failed. Please try again.')
      return
    }

    const isCourier = result.payload.user?.role === 'courier'
    if (!isCourier) {
      setServerError('This account is not registered as a delivery partner.')
      return
    }

    const params = new URLSearchParams(location.search)
    const redirectTo = params.get('redirect')
    navigate(redirectTo || '/delivery', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-primary-dark px-4">
      <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] p-8">
        <div className="text-center mb-6">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Motorcycle className="h-7 w-7" weight="fill" />
          </span>
          <h1 className="font-display text-primary text-3xl tracking-wide mt-3">FoodHub Courier</h1>
        </div>
        <h2 className="font-display text-2xl text-center mb-2">Delivery Partner Sign In</h2>
        <p className="text-muted-foreground text-center mb-8">Log in to manage and deliver your orders</p>

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
            Sign In as Courier
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Not a delivery partner yet?{' '}
            <Link to="/courier/register" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary block">
            Customer sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CourierLoginPage
