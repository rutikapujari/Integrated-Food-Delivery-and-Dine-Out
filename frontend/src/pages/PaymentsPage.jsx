import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchPayments } from '../redux/paymentSlice'
import { formatCurrency } from '../utils/formatCurrency'
import { notify } from '../utils/toast'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import { Receipt, CheckCircle, WarningCircle, Clock } from '../utils/icons'

const STATUS_STYLES = {
  Paid: 'text-success bg-success-light',
  Pending: 'text-warning bg-warning-light',
  Failed: 'text-destructive bg-destructive/10',
  Refunded: 'text-accent bg-accent-50',
}

function PaymentsPage() {
  const dispatch = useDispatch()
  const { payments, loading, error } = useSelector((state) => state.payment)

  useEffect(() => {
    dispatch(fetchPayments()).unwrap().catch((err) => notify.error(err || 'Failed to load payments'))
  }, [dispatch])

  const totalCollected = payments
    .filter((p) => p.paymentStatus === 'Paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  if (loading) return <Loader variant="page" />

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl">Payments</h1>
          <p className="text-muted-foreground text-sm">Track all your payment transactions</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-[var(--radius-lg)] p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Total Collected</p>
          <p className="text-primary font-bold text-xl">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Transactions</p>
          <p className="text-foreground font-semibold text-xl">{payments.length}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-red-50 p-3 text-destructive">
          <span className="text-sm">{error}</span>
          <Button variant="outline" onClick={() => dispatch(fetchPayments())}>Retry</Button>
        </div>
      )}

      {!loading && !error && !payments.length && (
        <div className="grid min-h-60 place-items-center rounded-lg border border-border bg-white px-5 py-10 text-center">
          <div>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
              <Receipt className="h-7 w-7" weight="duotone" />
            </span>
            <h3 className="mt-5 text-xl font-bold">No payments yet</h3>
            <p className="mt-2 text-muted-foreground">Your payment history will appear here.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {payments.map((p) => {
          const status = p.paymentStatus || 'Pending'
          const StatusIcon =
            status === 'Paid' ? CheckCircle : status === 'Failed' ? WarningCircle : Clock
          return (
            <div
              key={p._id}
              className="bg-white border border-border rounded-[var(--radius-lg)] p-4 flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold capitalize text-sm">{p.paymentMethod}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Order #{(p.orderId?._id || p.orderId)?.toString().slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-primary">{formatCurrency(p.amount)}</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>
                  <StatusIcon className="h-3.5 w-3.5" /> {status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default PaymentsPage
