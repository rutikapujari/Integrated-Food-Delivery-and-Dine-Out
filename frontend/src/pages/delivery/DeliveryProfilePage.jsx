import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import { fetchMyDeliveries } from '../../redux/deliverySlice'
import { User, Motorcycle, Phone, Envelope, CheckCircle, Truck } from '../../utils/icons'

function DeliveryProfilePage() {
  const { user } = useSelector((state) => state.auth)
  const { myDeliveries } = useSelector((state) => state.delivery)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchMyDeliveries()).unwrap().catch(() => {})
  }, [dispatch])

  const completed = myDeliveries.filter((o) => o.status === 'delivered').length
  const total = myDeliveries
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)

  const rows = [
    { label: 'Full Name', value: user?.name, icon: User },
    { label: 'Email', value: user?.email, icon: Envelope },
    { label: 'Phone', value: user?.phone, icon: Phone },
    { label: 'Vehicle', value: user?.vehicleNumber || 'Not provided', icon: Motorcycle },
    { label: 'Status', value: user?.isActive === false ? 'Inactive' : 'Active', icon: CheckCircle },
  ]

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 md:px-8 py-8 text-white">
        <div className="relative mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary">
              <User className="h-8 w-8" weight="duotone" />
            </span>
            <div>
              <h1 className="font-display text-3xl">Partner Profile</h1>
              <p className="text-slate-300 text-sm">Your delivery partner details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-success/20 bg-gradient-to-br from-success/15 to-success/5 p-5">
            <p className="text-sm font-medium text-success opacity-80 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Delivered</p>
            <p className="mt-2 font-display text-3xl font-bold text-success">{completed}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 p-5">
            <p className="text-sm font-medium text-primary opacity-80 flex items-center gap-1"><Truck className="h-4 w-4" /> Lifetime Earnings</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-semibold text-lg mb-4">Account Details</h2>
          <div className="divide-y divide-border">
            {rows.map((r) => {
              const Icon = r.icon
              return (
                <div key={r.label} className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4" /> {r.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{r.value || '—'}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => notify.info('Profile editing will be available soon.')}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted"
        >
          Edit Profile
        </button>
      </div>
    </motion.div>
  )
}

export default DeliveryProfilePage
