import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { supportService } from '../services/supportService'
import { notify } from '../utils/toast'
import TicketCard from '../components/support/TicketCard'
import TicketForm from '../components/support/TicketForm'
import TicketReply from '../components/support/TicketReply'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import { ChatCircle, ArrowLeft } from '../utils/icons'

function SupportPage() {
  const { user } = useSelector((state) => state.auth)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const { data } = await supportService.getTickets()
      setTickets(data.tickets || [])
    } catch {
      notify.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const loadTicket = async (id) => {
    try {
      const { data } = await supportService.getTicketById(id)
      setSelectedTicket(data.ticket)
    } catch {
      notify.error('Failed to load ticket details')
    }
  }

  const handleCreate = async (formData) => {
    setSubmitting(true)
    try {
      const { data } = await supportService.createTicket(formData)
      notify.success('Ticket created')
      setTickets((prev) => [data.ticket, ...prev])
      setSelectedTicket(data.ticket)
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedTicket) return
    setSendingReply(true)
    try {
      const { data } = await supportService.addReply(selectedTicket._id, { message: replyText.trim() })
      setSelectedTicket((prev) => ({ ...prev, replies: [...(prev.replies || []), data.reply] }))
      setReplyText('')
      notify.success('Reply sent')
    } catch {
      notify.error('Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-8">Help & Support</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <TicketForm onSubmit={handleCreate} loading={submitting} />

          <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4">
            <h3 className="font-semibold text-sm mb-3">My Tickets ({tickets.length})</h3>
            {loading ? (
              <Loader variant="text" count={3} />
            ) : !tickets.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tickets yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onClick={() => loadTicket(ticket._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white border border-border rounded-[var(--radius-lg)]">
              <div className="p-4 border-b border-border">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="font-semibold text-lg">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    #{selectedTicket._id?.slice(-8).toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedTicket.status === 'open' ? 'text-success bg-success-light' :
                    selectedTicket.status === 'in-progress' ? 'text-accent bg-accent-50' :
                    'text-muted-foreground bg-surface-muted'
                  }`}>
                    {selectedTicket.status?.replace('-', ' ') || 'Open'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                <TicketReply reply={{
                  user: selectedTicket.user || { name: 'You' },
                  message: selectedTicket.description,
                  createdAt: selectedTicket.createdAt,
                  isStaff: false,
                }} />
                {(selectedTicket.replies || []).map((reply) => (
                  <TicketReply key={reply._id} reply={reply} />
                ))}
              </div>

              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div className="p-4 border-t border-border">
                  <form onSubmit={handleReply} className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 h-11 px-4 rounded-full border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      disabled={sendingReply}
                    />
                    <Button type="submit" loading={sendingReply} disabled={!replyText.trim()}>
                      Send
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-border rounded-[var(--radius-lg)]">
              <ChatCircle className="w-16 h-16 text-border mb-4" weight="duotone" />
              <h3 className="text-lg font-semibold mb-1">Need Help?</h3>
              <p className="text-muted-foreground max-w-sm">
                Select a ticket to view the conversation, or create a new ticket to get help from our support team.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default SupportPage
