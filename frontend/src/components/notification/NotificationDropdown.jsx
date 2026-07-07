import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { markAllRead } from '../../redux/notificationSlice'
import NotificationItem from './NotificationItem'

function NotificationDropdown({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { list, unread } = useSelector((state) => state.notification)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-[var(--shadow-modal)] border border-border max-h-96 overflow-y-auto z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white rounded-t-xl">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {unread > 0 && (
          <button
            onClick={() => dispatch(markAllRead())}
            className="text-xs text-accent font-semibold hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="divide-y divide-border">
        {list.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground text-sm">No notifications yet</p>
        ) : (
          list.slice(0, 10).map((n) => (
            <NotificationItem key={n._id} notification={n} onClick={onClose} />
          ))
        )}
      </div>
      {list.length > 10 && (
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center p-3 text-accent text-sm font-semibold hover:bg-surface-muted rounded-b-xl border-t border-border"
        >
          View all notifications
        </Link>
      )}
    </div>
  )
}

export default NotificationDropdown
