import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { User, Envelope, Phone, Lock } from '../utils/icons'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
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

function RegisterPage() {
  const { register: signup, verify, loading } = useAuth()
  const [step, setStep] = useState(1)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
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
    const result = await signup(data)
    if (result) {
      setRegisteredEmail(data.email)
      setStep(2)
      startCooldown()
    }
  }

  const onVerify = async (data) => {
    await verify(registeredEmail, data.otp)
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-bg to-primary-light px-4">
        <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-primary text-4xl tracking-wider">FoodHub</h1>
          </div>
          <h2 className="font-display text-3xl text-center mb-2">Verify Email</h2>
          <p className="text-muted-foreground text-center mb-2">
            Enter the 6-digit code sent to
          </p>
          <p className="text-foreground font-semibold text-center mb-8">{registeredEmail}</p>

          <form onSubmit={hs2(onVerify)} className="space-y-4">
            <Input
              label="OTP Code"
              placeholder="Enter 6-digit OTP"
              error={e2.otp?.message}
              disabled={loading}
              register={reg2('otp')}
              maxLength={6}
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Verify & Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { startCooldown(); /* resend OTP */ }}
              disabled={cooldown > 0}
              className="text-sm text-primary font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-bg to-primary-light px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] p-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-primary text-4xl tracking-wider">FoodHub</h1>
        </div>
        <h2 className="font-display text-3xl text-center mb-2">Create Account</h2>
        <p className="text-muted-foreground text-center mb-8">Join FoodHub for delicious meals delivered fast</p>

        <form onSubmit={hs1(onRegister)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            icon={User}
            error={e1.name?.message}
            disabled={loading}
            register={reg1('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={Envelope}
            error={e1.email?.message}
            disabled={loading}
            register={reg1('email')}
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            icon={Phone}
            error={e1.phone?.message}
            disabled={loading}
            register={reg1('phone')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            icon={Lock}
            error={e1.password?.message}
            disabled={loading}
            register={reg1('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            icon={Lock}
            error={e1.confirmPassword?.message}
            disabled={loading}
            register={reg1('confirmPassword')}
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
