import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/toast'
import Button from '../common/Button'
import Input from '../common/Input'
import { User, Envelope, Phone } from '../../utils/icons'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

function EditProfile() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // In real app: api.put('/auth/profile', data)
      await new Promise((r) => setTimeout(r, 500))
      notify.success('Profile updated successfully')
    } catch {
      notify.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
      <h3 className="font-semibold text-lg mb-4">Edit Profile</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          icon={User}
          error={errors.name?.message}
          disabled={saving}
          register={register('name')}
        />
        <Input
          label="Email"
          type="email"
          icon={Envelope}
          error={errors.email?.message}
          disabled={saving}
          register={register('email')}
        />
        <Input
          label="Phone"
          type="tel"
          icon={Phone}
          error={errors.phone?.message}
          disabled={saving}
          register={register('phone')}
        />
        <Button type="submit" loading={saving}>Save Changes</Button>
      </form>
    </div>
  )
}

export default EditProfile
