import { useState } from 'react'
import Button from '../common/Button'

function Coupon({ onApply }) {
  const [code, setCode] = useState('')

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim())
      setCode('')
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleApply() }}
        className="flex-1 h-11 px-4 rounded-[var(--radius-sm)] border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
      />
      <Button variant="outline" onClick={handleApply}>Apply</Button>
    </div>
  )
}

export default Coupon
