import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react'
import { pageTransition } from '../utils/motion'

function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    const timer = setTimeout(() => {}, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div {...pageTransition} className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Your order has been placed and payment received.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground mt-2">
              Order ID: <span className="font-mono font-semibold text-foreground">{orderId}</span>
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-4"
        >
          <p className="text-sm text-green-800">
            You will receive an email confirmation shortly. Your order is being prepared.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate(orderId ? `/orders/${orderId}` : '/orders')}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-colors"
          >
            <Package className="w-5 h-5" />
            Track Order
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary-light transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PaymentSuccessPage
