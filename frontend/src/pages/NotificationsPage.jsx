import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchNotifications, markAllRead } from '../redux/notificationSlice'
import NotificationItem from '../components/notification/NotificationItem'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import { Bell } from '../utils/icons'

function NotificationsPage() {
  const dispatch = useDispatch()
  const { list, loading, unread } = useSelector((state) => state.notification)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  return (
    <motion.div {...pageTransition} className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Notifications</h1>
        {unread > 0 && (
          <Button variant="ghost" onClick={() => dispatch(markAllRead())}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <Loader variant="text" count={5} />
      ) : !list.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="w-16 h-16 text-border mb-4" weight="duotone" />
          <h3 className="text-lg font-semibold mb-1">No notifications</h3>
          <p className="text-muted-foreground text-sm">
            You&apos;ll see order updates, promotions, and more here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border overflow-hidden shadow-sm">
          {list.map((n) => (
            <NotificationItem key={n._id} notification={n} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default NotificationsPage
