import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode/esm/index.js'
import { motion } from 'framer-motion'
import { X, Crosshair, Warning } from '../../utils/icons'
import Button from '../common/Button'

const SCAN_REGIONS = {
  qr: { width: 240, height: 240 },
  barcode: { width: 280, height: 160 },
}

function QrScanner({ isOpen, onClose, onScan, title = 'Scan to Pay', mode = 'qr' }) {
  const html5Ref = useRef(null)
  const [error, setError] = useState(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    const regionSize = SCAN_REGIONS[mode] || SCAN_REGIONS.qr

    const start = async () => {
      setError(null)
      setStarting(true)
      try {
        if (html5Ref.current) {
          await html5Ref.current.clear()
          html5Ref.current = null
        }

        const scanner = new Html5Qrcode('qr-scanner-region', false)
        html5Ref.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (vw, vh) => {
              const min = Math.min(vw, vh)
              return { width: Math.min(regionSize.width, min - 20), height: Math.min(regionSize.height, min - 20) }
            },
            aspectRatio: regionSize.width / regionSize.height,
          },
          (decodedText) => {
            if (cancelled) return
            onScan?.(decodedText)
          },
          (scanError) => {
            if (cancelled) return
            if (
              typeof scanError === 'string' &&
              !scanError.includes('NotFoundException') &&
              !scanError.includes('No MultiFormat')
            ) {
              setError(scanError)
            }
          }
        )
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access.'
              : 'Unable to access camera. Please check your device or use manual entry.'
          )
        }
      } finally {
        if (!cancelled) setStarting(false)
      }
    }

    start()

    return () => {
      cancelled = true
      const instance = html5Ref.current
      html5Ref.current = null
      if (instance) {
        instance
          .stop()
          .catch(() => {})
          .finally(() => instance.clear().catch(() => {}))
      }
    }
  }, [isOpen, mode, onScan])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm rounded-[var(--radius-xl)] bg-white shadow-[var(--shadow-modal)]"
      >
        <div className="flex items-center justify-between border-b border-border p-6">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-surface-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div
            id="qr-scanner-region"
            className="relative mx-auto overflow-hidden rounded-xl border border-border bg-black"
            style={{
              width: (SCAN_REGIONS[mode] || SCAN_REGIONS.qr).width,
              height: (SCAN_REGIONS[mode] || SCAN_REGIONS.qr).height,
            }}
          >
            {starting && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Crosshair className="h-8 w-8 animate-pulse" />
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-destructive">
              <Warning className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Point your camera at the {mode === 'barcode' ? 'barcode' : 'UPI QR code'} to capture payment details.
          </p>

          <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default QrScanner
