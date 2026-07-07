import { Bell } from '../../utils/icons'

function NotificationBell({ onClick, unread = 0 }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-surface-muted transition-colors"
      aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}

export default NotificationBell
