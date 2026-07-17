import { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Banknote, Smartphone, Building2, Wallet, Shield, ChevronRight } from 'lucide-react'
import { pageTransition } from '../utils/motion'
import { clearCart } from '../redux/cartSlice'
import { createOrder } from '../redux/orderSlice'
import { createRazorpayOrder, verifyRazorpayPayment, generateUpiQr, confirmUpiPayment, updateOrderPaymentStatus } from '../redux/paymentSlice'
import { formatCurrency } from '../utils/formatCurrency'
import { notify } from '../utils/toast'
import DeliveryAddress from '../components/cart/DeliveryAddress'
import CartSummary from '../components/cart/CartSummary'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import QrScanner from '../components/payment/QrScanner'

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when your food arrives' },
  { value: 'upi', label: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm & more' },
  { value: 'card', label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Rupay' },
  { value: 'netbanking', label: 'Net Banking', icon: Building2, description: 'All major banks' },
  { value: 'wallet', label: 'Wallets', icon: Wallet, description: 'Paytm, Mobikwik, Freecharge' },
]

function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const cart = useSelector((state) => state.cart)
  const { loading: orderLoading } = useSelector((state) => state.order)
  const { loading: paymentLoading } = useSelector((state) => state.payment)

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [paymentError, setPaymentError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [upiQr, setUpiQr] = useState(null)
  const [upiOrderId, setUpiOrderId] = useState(null)
  const [confirmingUpi, setConfirmingUpi] = useState(false)
  const [upiTransactionId, setUpiTransactionId] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  const addresses = user?.addresses || []

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }, [])

  const handleOnlinePayment = useCallback(async () => {
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      notify.error('Failed to load payment gateway. Please check your internet.')
      setIsProcessing(false)
      return
    }

    try {
      const orderResult = await dispatch(createOrder({
        items: cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        restaurantId: cart.restaurantId,
        deliveryAddress: selectedAddress,
        paymentMethod,
        totalAmount: cart.total,
      }))

      if (!createOrder.fulfilled.match(orderResult)) {
        notify.error(orderResult.payload || 'Failed to create order')
        setIsProcessing(false)
        return
      }

      const createdOrder = orderResult.payload.order

      const razorpayResult = await dispatch(createRazorpayOrder(createdOrder._id))

      if (!createRazorpayOrder.fulfilled.match(razorpayResult)) {
        notify.error(razorpayResult.payload || 'Failed to initiate payment')
        setIsProcessing(false)
        return
      }

      const razorpayData = razorpayResult.payload

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'Food Delivery',
        description: `Order #${createdOrder._id}`,
        order_id: razorpayData.razorpayOrderId,
        prefill: {
          name: razorpayData.customerName || user?.name || '',
          email: razorpayData.customerEmail || user?.email || '',
          contact: razorpayData.customerPhone || user?.phone || '',
        },
        theme: {
          color: '#e11d48',
        },
        modal: {
          confirm_close: true,
          ondismiss: async () => {
            setPaymentError('Payment was cancelled. Your order is saved but not paid.')
            notify.error('Payment cancelled')
            setIsProcessing(false)
            try {
              if (createdOrder?._id) {
                await dispatch(updateOrderPaymentStatus({ orderId: createdOrder._id, paymentStatus: 'Pending' }))
              }
            } catch {
              // non-blocking reconciliation
            }
          },
        },
        handler: async (response) => {
          try {
            const verifyResult = await dispatch(verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }))

            if (verifyRazorpayPayment.fulfilled.match(verifyResult)) {
              dispatch(clearCart())
              notify.success('Payment successful!')
              navigate(`/payment-success?orderId=${createdOrder._id}`)
            } else {
              notify.error(verifyResult.payload || 'Payment verification failed')
              navigate(`/payment-failed?orderId=${createdOrder._id}`)
            }
          } catch {
            navigate(`/payment-failed?orderId=${createdOrder._id}`)
          } finally {
            setIsProcessing(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', async (response) => {
        setPaymentError('Payment failed. Please try again.')
        notify.error('Payment failed')
        setIsProcessing(false)

        if (response.error?.metadata?.order_id) {
          navigate(`/payment-failed?orderId=${createdOrder._id}`)
        }
      })

      rzp.open()
    } catch (err) {
      setPaymentError(err.message || 'Payment failed. Please try again.')
      notify.error('Payment failed')
      setIsProcessing(false)
    }
  }, [dispatch, cart, selectedAddress, paymentMethod, user, navigate, loadRazorpayScript])

  const handleUpiQrPayment = useCallback(async () => {
    try {
      const orderResult = await dispatch(createOrder({
        items: cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        restaurantId: cart.restaurantId,
        deliveryAddress: selectedAddress,
        paymentMethod: 'upi',
        totalAmount: cart.total,
      }))

      if (!createOrder.fulfilled.match(orderResult)) {
        notify.error(orderResult.payload || 'Failed to create order')
        setIsProcessing(false)
        return
      }

      const createdOrder = orderResult.payload.order
      const qrResult = await dispatch(generateUpiQr(createdOrder._id))

      if (!generateUpiQr.fulfilled.match(qrResult)) {
        notify.error(qrResult.payload || 'Failed to generate UPI QR')
        setIsProcessing(false)
        return
      }

      setUpiQr(qrResult.payload)
      setUpiOrderId(createdOrder._id)
    } catch (err) {
      setPaymentError(err.message || 'Failed to start UPI payment')
      notify.error('Failed to start UPI payment')
    } finally {
      setIsProcessing(false)
    }
  }, [dispatch, cart, selectedAddress])

  const handleConfirmUpiPaid = async () => {
    if (!upiOrderId) return
    setConfirmingUpi(true)
    try {
      const result = await dispatch(confirmUpiPayment({
        orderId: upiOrderId,
        upiTransactionId: upiTransactionId.trim() || undefined,
      }))
      if (confirmUpiPayment.fulfilled.match(result)) {
        dispatch(clearCart())
        notify.success('UPI payment confirmed!')
        setUpiQr(null)
        setUpiTransactionId('')
        navigate(`/payment-success?orderId=${upiOrderId}`)
      } else {
        notify.error(result.payload || 'Failed to confirm payment')
      }
    } finally {
      setConfirmingUpi(false)
    }
  }

  const handleScanUpi = (decoded) => {
    setShowScanner(false)
    try {
      const url = new URL(decoded)
      const txn = url.searchParams.get('tn') || url.searchParams.get('tr') || ''
      if (txn) setUpiTransactionId(txn)
    } catch {
      const match = decoded.match(/(?:tr|tn)=([^&]+)/i)
      if (match) setUpiTransactionId(match[1])
    }
    notify.success('Scanned. Enter the UPI transaction ID if not detected.')
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      notify.error('Please select a delivery address')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    if (paymentMethod === 'cod') {
      try {
        const result = await dispatch(createOrder({
          items: cart.items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          restaurantId: cart.restaurantId,
          deliveryAddress: selectedAddress,
          paymentMethod: 'cod',
          totalAmount: cart.total,
        }))

        if (createOrder.fulfilled.match(result)) {
          dispatch(clearCart())
          notify.success('Order placed successfully!')
          navigate(`/payment-success?orderId=${result.payload.order._id}`)
        } else {
          notify.error(result.payload || 'Failed to place order')
        }
      } catch {
        notify.error('Failed to place order. Please try again.')
      } finally {
        setIsProcessing(false)
      }
    } else if (paymentMethod === 'upi') {
      handleUpiQrPayment()
    } else {
      handleOnlinePayment()
    }
  }

  if (!cart.items.length) {
    navigate('/cart', { replace: true })
    return null
  }

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-8">{cart.items.length} item{cart.items.length > 1 ? 's' : ''} in your order</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
              <DeliveryAddress
                selectedAddress={selectedAddress}
                addresses={addresses}
                onSelect={setSelectedAddress}
                onAddAddress={setSelectedAddress}
              />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="border border-border rounded-[var(--radius-lg)] overflow-hidden">
              {PAYMENT_METHODS.map((method, index) => {
                const Icon = method.icon
                const isSelected = paymentMethod === method.value
                return (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/5 border-l-4 border-l-primary'
                        : 'hover:bg-surface-muted border-l-4 border-l-transparent'
                    } ${index !== PAYMENT_METHODS.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(method.value)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary text-white' : 'bg-surface-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{method.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary' : 'border-border'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </label>
                )
              })}
            </div>

            {paymentError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-destructive text-sm">{paymentError}</p>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Scan the QR with any UPI app (GPay, PhonePe, Paytm) to pay.</span>
              </div>
            )}

            {paymentMethod !== 'cod' && paymentMethod !== 'upi' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secured by Razorpay. Your payment info is encrypted.</span>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <CartSummary />

          <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>Payment via</span>
              <span className="font-medium text-foreground capitalize">
                {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
              </span>
            </div>
            {paymentMethod !== 'cod' && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Processing</span>
                <span className="font-medium text-green-600">Instant</span>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            loading={isProcessing || orderLoading || paymentLoading}
            onClick={handlePlaceOrder}
          >
            {paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatCurrency(cart.total)}`}
            <ChevronRight className="w-5 h-5" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By placing this order, you agree to our Terms & Conditions
          </p>
        </div>
      </div>

      <Modal
        isOpen={Boolean(upiQr)}
        onClose={() => setUpiQr(null)}
        title="Scan to Pay via UPI"
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          {upiQr?.qrCode && (
            <img
              src={upiQr.qrCode}
              alt="UPI QR Code"
              className="w-56 h-56 rounded-xl border border-border"
            />
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Scan this QR with any UPI app to pay
          </p>
          <p className="mt-1 font-semibold text-lg">
            {formatCurrency(upiQr?.amount || cart.total)}
          </p>
          {upiQr?.upiId && (
            <p className="mt-1 text-xs text-muted-foreground">
              UPI ID: {upiQr.upiId}
            </p>
          )}

          <div className="mt-4 w-full text-left">
            <label className="text-xs font-medium text-muted-foreground">
              UPI Transaction ID (optional, auto-filled by scanning)
            </label>
            <input
              type="text"
              value={upiTransactionId}
              onChange={(e) => setUpiTransactionId(e.target.value)}
              placeholder="e.g. 1234567890"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => setShowScanner(true)}
          >
            Scan QR to capture
          </Button>

          <Button
            className="w-full mt-3"
            loading={confirmingUpi}
            onClick={handleConfirmUpiPaid}
          >
            I have completed the payment
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Click the button above only after your UPI app shows payment success.
          </p>
        </div>
      </Modal>

      <QrScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanUpi}
        title="Scan UPI QR"
        mode="qr"
      />
    </motion.div>
  )
}

export default CheckoutPage
