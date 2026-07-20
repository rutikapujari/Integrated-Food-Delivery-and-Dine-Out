import { Link } from 'react-router-dom'
import { Package, CreditCard, Info, Tag } from '@phosphor-icons/react'
import { timeAgo } from '../../utils/timeAgo'

const notificationTypeMeta = {
  order: { icon: Package, className: 'bg-primary-light text-primary' },
  payment: { icon: CreditCard, className: 'bg-success-light text-success' },
  system: { icon: Info, className: 'bg-accent-50 text-accent' },
  promotion: { icon: Tag, className: 'bg-warning-light text-warning' },
}

function getNotificationLink(notification) {
  if (notification.type === 'order' && notification.data?.orderId) {
    return `/orders/${notification.data.orderId}`
  }
  return '/notifications'
}

function NotificationItem({ notification, onClick }) {
  const meta = notificationTypeMeta[notification.type] || notificationTypeMeta.system
  const Icon = meta.icon

  return (
    <Link
      to={getNotificationLink(notification)}
      onClick={onClick}
      className={`flex gap-3 p-4 hover:bg-surface-muted cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-primary-light/30' : ''
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.className}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
      )}
    </Link>
  )
}

export default NotificationItem
