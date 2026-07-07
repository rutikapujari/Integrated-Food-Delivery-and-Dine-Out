function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}

const typeIcons = {
  order: { color: 'bg-primary-light text-primary', label: 'Order' },
  payment: { color: 'bg-success-light text-success', label: 'Payment' },
  system: { color: 'bg-accent-50 text-accent', label: 'System' },
  promotion: { color: 'bg-warning-light text-warning', label: 'Promo' },
}

export { timeAgo, typeIcons }
