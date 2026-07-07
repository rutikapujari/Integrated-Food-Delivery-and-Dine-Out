import { User } from '../../utils/icons'

function TicketReply({ reply }) {
  const isAdmin = reply.user?.role === 'admin' || reply.user?.role === 'restaurant_admin'
  const isStaff = isAdmin || reply.isStaff

  return (
    <div className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] ${isStaff ? '' : 'order-1'}`}>
        <div className={`flex items-center gap-2 mb-1 ${isStaff ? '' : 'justify-end'}`}>
          <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold">{reply.user?.name || 'User'}</span>
          {isAdmin && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white uppercase">Staff</span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {new Date(reply.createdAt).toLocaleDateString()} {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={`p-4 rounded-2xl text-sm ${
          isStaff
            ? 'bg-surface-muted text-foreground rounded-tl-sm'
            : 'bg-primary text-white rounded-tr-sm'
        }`}>
          {reply.message}
        </div>
      </div>
    </div>
  )
}

export default TicketReply
