import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, RefreshCw, ShoppingCart, Home } from 'lucide-react'
import { pageTransition } from '../utils/motion'

function PaymentFailedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <motion.div {...pageTransition} className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-14 h-14 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Something went wrong with your payment. Don't worry, you haven't been charged.
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
          className="bg-red-50 border border-red-200 rounded-2xl p-4"
        >
          <p className="text-sm text-red-800">
            Common reasons: insufficient funds, card expired, network timeout, or payment cancelled.
            Please try again or use a different payment method.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate('/checkout')}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary-light transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Go to Cart
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 inline-flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PaymentFailedPage
