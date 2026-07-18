import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSelector, useDispatch } from 'react-redux'
import { registerUser, verifyOTP } from '../redux/authSlice'
import { notify } from '../utils/toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { User, Envelope, Phone, Lock, Motorcycle, ArrowLeft, Truck } from '../utils/icons'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  vehicleNumber: z.string().min(4, 'Enter a valid vehicle number').max(15, 'Vehicle number too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least 1 special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP is required').max(6, 'OTP must be 6 digits'),
})

function CourierRegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const [step, setStep] = useState(1)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [serverError, setServerError] = useState(null)
  const timerRef = useRef(null)

  const step1Form = useForm({ resolver: zodResolver(registerSchema) })
  const step2Form = useForm({ resolver: zodResolver(otpSchema) })

  const { register: reg1, handleSubmit: hs1, formState: { errors: e1 } } = step1Form
  const { register: reg2, handleSubmit: hs2, formState: { errors: e2 } } = step2Form

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const startCooldown = () => {
    setCooldown(30)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const onRegister = async (data) => {
    setServerError(null)
    const { confirmPassword, ...userData } = data
    const result = await dispatch(registerUser({ ...userData, role: 'courier' }))
    if (registerUser.fulfilled.match(result)) {
      setRegisteredEmail(data.email)
      setStep(2)
      startCooldown()
      notify.success('Verification code sent. Check your email.')
    } else {
      setServerError(result.payload || 'Registration failed')
    }
  }

  const onVerify = async (data) => {
    setServerError(null)
    const result = await dispatch(verifyOTP({ email: registeredEmail, otp: data.otp }))
    if (verifyOTP.fulfilled.match(result)) {
      notify.success('Partner account verified! Sign in to start delivering.')
      navigate('/courier/login', { replace: true })
    } else {
      setServerError(result.payload || 'Invalid OTP')
    }
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Truck className="w-9 h-9" weight="duotone" />
            </div>
            <h1 className="font-display text-3xl tracking-wider text-white mb-1">
              FoodHub<span className="text-primary">Courier</span>
            </h1>
            <p className="text-slate-400">Delivery Partner Portal</p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white">Verify Email</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Enter the 6-digit code sent to{' '}
              <span className="text-white font-semibold">{registeredEmail}</span>
            </p>

            <form onSubmit={hs2(onVerify)} className="space-y-4">
              {serverError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                  {serverError}
                </div>
              )}

              <Input
                label="OTP Code"
                placeholder="Enter 6-digit OTP"
                error={e2.otp?.message}
                disabled={loading}
                register={reg2('otp')}
                maxLength={6}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
              />

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Verify & Complete Registration
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={startCooldown}
                disabled={cooldown > 0}
                className="text-sm text-primary font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Truck className="w-9 h-9" weight="duotone" />
          </div>
          <h1 className="font-display text-3xl tracking-wider text-white mb-1">
            FoodHub<span className="text-primary">Courier</span>
          </h1>
          <p className="text-slate-400">Delivery Partner Portal</p>
        </div>

        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Link to="/courier/login" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-semibold text-white">Become a Partner</h2>
          </div>

          <form onSubmit={hs1(onRegister)} className="space-y-4">
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
                {serverError}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              icon={User}
              error={e1.name?.message}
              disabled={loading}
              register={reg1('name')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={Envelope}
              error={e1.email?.message}
              disabled={loading}
              register={reg1('email')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              icon={Phone}
              error={e1.phone?.message}
              disabled={loading}
              register={reg1('phone')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Input
              label="Vehicle Number"
              placeholder="e.g. MH01AB1234"
              icon={Motorcycle}
              error={e1.vehicleNumber?.message}
              disabled={loading}
              register={reg1('vehicleNumber')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              icon={Lock}
              error={e1.password?.message}
              disabled={loading}
              register={reg1('password')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              icon={Lock}
              error={e1.confirmPassword?.message}
              disabled={loading}
              register={reg1('confirmPassword')}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Create Partner Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-sm text-slate-400 text-center">
              Already a partner?{' '}
              <Link to="/courier/login" className="text-primary font-semibold hover:underline">
                Sign In
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

export default CourierRegisterPage
