# Phase 4 — Ticket Detail Page (Agent-Ready Spec)

> **Status:** Pending
> **Scope:** Separate ticket detail into its own page with shareable URL
> **Pages:** 1 new | **Files:** 1 new | 2 modified

---

## Background

The current `SupportPage.jsx` handles everything inline — ticket list, create form, AND ticket conversation thread — all at `/support`. Clicking a ticket shows its detail on the right side without changing the URL.

This means:
- Cannot bookmark or share a ticket link (e.g. `foodhub.com/support/abc123`)
- Browser back/forward doesn't work between tickets
- Page reload loses your place (shows empty state again)

**Goal:** Extract the ticket conversation view into a standalone `TicketDetailPage.jsx` at `/support/:id`. Keep the `SupportPage.jsx` list + create form at `/support`.

---

## Prerequisites

- Phase 1 complete (auth, Redux, common components, API layer)
- Phase 3 support components already exist: `TicketCard`, `TicketForm`, `TicketReply`
- `supportService` already exists
- `SupportPage.jsx` at `/support` works

---

## Build Order

```
Step 1: Create TicketDetailPage    (1 new file)   → depends on Phase 1, Phase 3 support components
Step 2: Update SupportPage          (1 modified)   → depends on Step 1 (routing exists)
Step 3: Update Routes               (1 modified)   → depends on Step 1
```

---

## UX Design Rationale

The ticket detail page is a **conversation thread** — user messages and support staff replies in chronological order. Key UX decisions from the FoodHub design system:

| Decision | Rationale |
|----------|-----------|
| Chat-bubble layout | Phase 3 spec already defines this via `TicketReply`. User messages right-aligned in primary color, admin messages left-aligned in muted surface. |
| Sticky reply bar at bottom | Keeps the reply input always accessible while scrolling through the thread. Uses `sticky bottom-0` with background to prevent bleed-through. |
| Back navigation in header | `ArrowLeft` icon + ticket subject. Tapping returns to `/support`. No browser-chrome-only reliance. |
| Status badge + ticket ID visible | User knows which ticket they're viewing. Status badge uses existing `TicketCard` color mapping (open = success-green, in-progress = accent-blue, resolved = muted-gray). |
| Auto-scroll to latest reply | On page load and after sending a reply, scroll to the newest message. Uses `useRef` + `scrollIntoView({ behavior: 'smooth' })`. |
| Empty state for no replies | If the ticket description exists but no replies yet, show a gentle prompt: "Waiting for a response from our team." |
| Disable reply if resolved/closed | When status is `resolved` or `closed`, hide the reply bar and show a banner: "This ticket has been resolved. Create a new ticket if you need further help." |

---

## Step 1: TicketDetailPage

### File 1.1: CREATE `src/pages/TicketDetailPage.jsx`

```
Route: /support/:id  (protected)
URL param: :id — ticket ID

States:
  loading   → Loader variant="page"
  not-found → EmptyState with "Ticket not found" + link back to /support
  error     → toast + retry button
  data      → conversation thread with reply bar

Behavior:
  - On mount: fetch ticket by ID from supportService.getTicketById(id)
  - On send reply: POST supportService.addReply(id, { message }), append reply to local state
  - Auto-scroll to bottom on new messages
  - Back button in header returns to /support
  - Disable reply input when ticket is resolved or closed
```

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { supportService } from '../services/supportService'
import { notify } from '../utils/toast'
import TicketReply from '../components/support/TicketReply'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import {
  ArrowLeft, ChatCircle, CheckCircle,
} from '../utils/icons'

const statusBadge = {
  open: 'text-success bg-success-light border-success/20',
  'in-progress': 'text-accent bg-accent-50 border-accent/20',
  resolved: 'text-muted-foreground bg-surface-muted border-border',
  closed: 'text-muted-foreground bg-surface-muted border-border',
}

/**
 * TicketDetailPage — Full conversation thread for a single support ticket.
 * Route: /support/:id (protected)
 *
 * States: loading | not-found | error | data (thread) | resolved (read-only)
 */
function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadTicket = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await supportService.getTicketById(id)
      setTicket(data.ticket)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket')
      notify.error('Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  useEffect(() => {
    if (ticket) scrollToBottom()
  }, [ticket?.replies?.length, scrollToBottom])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setSendingReply(true)
    try {
      const { data } = await supportService.addReply(id, { message: replyText.trim() })
      setTicket((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), data.reply],
      }))
      setReplyText('')
      inputRef.current?.focus()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  if (loading) return <Loader variant="page" />
  if (error) {
    return (
      <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <EmptyState
          icon={ChatCircle}
          title="Could not load ticket"
          description={error}
          action={{ label: 'Try Again', onClick: loadTicket }}
        />
      </motion.div>
    )
  }
  if (!ticket) {
    return (
      <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <EmptyState
          icon={ChatCircle}
          title="Ticket not found"
          description="This ticket may have been removed or the link is incorrect."
          action={{ label: 'Back to Support', onClick: () => navigate('/support') }}
        />
      </motion.div>
    )
  }

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          to="/support"
          className="shrink-0 p-2 rounded-full hover:bg-surface-muted transition-colors mt-0.5"
          aria-label="Back to support"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl md:text-3xl truncate">{ticket.subject}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground font-mono">
              #{ticket._id?.slice(-8).toUpperCase()}
            </span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge[ticket.status] || statusBadge.open}`}>
              {ticket.status?.replace('-', ' ') || 'Open'}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Resolved banner */}
      {isResolved && (
        <div className="flex items-center gap-2 bg-success-light text-success px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm font-medium">
          <CheckCircle className="w-5 h-5 shrink-0" weight="fill" />
          This ticket has been resolved. If you need further help, please create a new ticket.
        </div>
      )}

      {/* Conversation thread */}
      <div className="bg-white border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="p-4 md:p-6 space-y-4 max-h-[55vh] overflow-y-auto" id="ticket-thread">
          {/* Original ticket message */}
          <TicketReply
            reply={{
              user: ticket.user || { name: 'You' },
              message: ticket.description,
              createdAt: ticket.createdAt,
              isStaff: false,
            }}
          />

          {/* Replies */}
          {(ticket.replies || []).map((reply) => (
            <TicketReply key={reply._id} reply={reply} />
          ))}

          {/* Empty replies prompt */}
          {(!ticket.replies || ticket.replies.length === 0) && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <ChatCircle className="w-10 h-10 text-border" weight="duotone" />
              <p className="text-sm text-muted-foreground">
                Waiting for a response from our support team.
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Reply bar */}
        {!isResolved && (
          <div className="border-t border-border p-4 bg-surface-bg/50 sticky bottom-0">
            <form onSubmit={handleReply} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 h-11 px-4 rounded-full border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-60"
                disabled={sendingReply}
                autoComplete="off"
              />
              <Button
                type="submit"
                loading={sendingReply}
                disabled={!replyText.trim()}
              >
                Send
              </Button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default TicketDetailPage
```

---

## Step 2: Update SupportPage

### File 2.1: MODIFY `src/pages/SupportPage.jsx`

The current `SupportPage.jsx` has a two-column layout: ticket list on the left, ticket detail on the right (when a ticket is selected). The ticket detail column (selectedTicket state + the chat thread JSX) needs to be redirected to the separate page.

**Key changes:**
1. Remove the `selectedTicket`, `replyText`, `sendingReply` local states
2. Remove the `loadTicket` and `handleReply` functions
3. Remove the entire right-column JSX block that renders the ticket detail (lines 107–169 in the current file, roughly the `{selectedTicket ? (...conversation thread...) : (...empty prompt...)}` block)
4. Change the TicketCard click handler to navigate to `/support/${id}` instead of calling `loadTicket`
5. Add `useNavigate` import

**Replace the `onClick` handler on TicketCard:**

Before:
```jsx
<TicketCard key={ticket._id} ticket={ticket} onClick={() => loadTicket(ticket._id)} />
```

After:
```jsx
<TicketCard key={ticket._id} ticket={ticket} onClick={() => navigate(`/support/${ticket._id}`)} />
```

**Remove the right column entirely.** The layout changes from `lg:grid-cols-3` (two-column split) to a simpler single-column focused layout:

```jsx
<motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
  <h1 className="font-display text-3xl md:text-4xl mb-8">Help & Support</h1>

  <div className="space-y-6">
    <TicketForm onSubmit={handleCreate} loading={submitting} />

    <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
      <h3 className="font-semibold text-lg mb-4">My Tickets ({tickets.length})</h3>
      {loading ? (
        <Loader variant="text" count={3} />
      ) : !tickets.length ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ChatCircle className="w-10 h-10 text-border" weight="duotone" />
          <p className="text-sm text-muted-foreground">No tickets yet. Create your first ticket above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onClick={() => navigate(`/support/${ticket._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  </div>
</motion.div>
```

**Removed imports** (no longer needed in SupportPage):
- `TicketReply` (moved to TicketDetailPage)
- `ArrowLeft` (back navigation now in TicketDetailPage)

**Added import:**
- `useNavigate` from `react-router-dom`

---

## Step 3: Update Routes

### File 3.1: MODIFY `src/routes/AppRoutes.jsx`

Add the TicketDetailPage import and route. The route is protected (user must be logged in to view support tickets).

**Add import** (alphabetically near other page imports):

```js
import TicketDetailPage from '../pages/TicketDetailPage'
```

**Add route** inside the `<Route element={<MainLayout />}>` block, next to the existing support route:

```jsx
<Route path="/support" element={
  <ProtectedRoute><SupportPage /></ProtectedRoute>
} />
<Route path="/support/:id" element={
  <ProtectedRoute><TicketDetailPage /></ProtectedRoute>
} />
```

The current AppRoutes already has `/support` at line 67–68. Add the new route immediately below it.

---

## File Dependency Map

```
pages/TicketDetailPage.jsx
├── services/supportService.js          → api.js
├── utils/toast.js
├── utils/motion.js
├── components/support/TicketReply.jsx  → utils/icons.js
├── components/common/Loader.jsx
├── components/common/Button.jsx
├── components/common/EmptyState.jsx    → components/common/Button.jsx
└── utils/icons.js

pages/SupportPage.jsx (modified)
├── TicketCard (existing)
├── TicketForm (existing)
├── REMOVED: TicketReply import
├── REMOVED: ArrowLeft import
├── ADDED: useNavigate

routes/AppRoutes.jsx (modified)
└── ADDED: TicketDetailPage import + /support/:id route
```

---

## UX Patterns Applied (from ui-ux-pro-max)

| Pattern | Implementation |
|---------|---------------|
| **Chat-bubble layout** | `TicketReply` component already handles left/right alignment based on `isStaff`. User messages = right-aligned, `bg-primary text-white`. Admin messages = left-aligned, `bg-surface-muted`. |
| **Sticky reply bar** | `sticky bottom-0 bg-surface-bg/50` on the form container with `backdrop-blur` effect via the surface color. Input uses `rounded-full` pill shape consistent with all other inputs in the app. |
| **Back navigation** | `ArrowLeft` icon button + ticket subject in header. Tapping returns to `/support`. No reliance on browser back alone. |
| **Auto-scroll** | `scrollIntoView({ behavior: 'smooth' })` triggered on reply list length change and on initial load. Smooth animation, no jarring jump. |
| **Touch feedback** | `Button` component already has `active:scale-95`. Ticket cards have `hover:shadow-[var(--shadow-card)] hover:border-primary/30` via `TicketCard`. |
| **Resolved state** | Green banner with `CheckCircle` icon (fill weight) + `bg-success-light text-success`. Reply bar hidden. Clear visual signal that interaction is complete. |
| **Loading state** | Full-page `Loader variant="page"` with spinner + "Loading..." text. |
| **Error state** | `EmptyState` with `ChatCircle` duotone icon, error message as description, "Try Again" action button calling `loadTicket`. |
| **Not-found state** | `EmptyState` with "Ticket not found" heading and "Back to Support" action button navigating to `/support`. |
| **Keyboard accessible** | `aria-label` on back button. Reply input has `autoComplete="off"` (no sensitive data in support chat). Form element with proper `onSubmit`. |
| **4-states coverage** | loading → spinner, error → EmptyState + retry, not-found → EmptyState + back link, data → thread with reply bar (or resolved banner if closed) |

---

## Acceptance Checklist

- [ ] `/support/:id` route exists and is protected (redirects to login if not authenticated)
- [ ] Ticket subject, status badge, ticket ID, and creation date visible in header
- [ ] Conversation thread shows original message + all replies in chat-bubble layout
- [ ] User can type and send a reply; reply appears in thread immediately
- [ ] Auto-scroll to latest message on page load and after sending reply
- [ ] Back button in header returns to `/support`
- [ ] Resolved/closed tickets show green banner and hide reply input
- [ ] Empty replies show "Waiting for a response" prompt
- [ ] Browser back/forward works between `/support` and `/support/:id`
- [ ] Page reload on `/support/:id` correctly loads the ticket
- [ ] Ticket not found (invalid ID) shows empty state with back link
- [ ] Error state (network failure) shows retry button
- [ ] Loading state shows full-page spinner while fetching
- [ ] `SupportPage` no longer renders ticket detail inline
- [ ] Clicking a ticket in `SupportPage` navigates to `/support/:id`
- [ ] `npm run build` succeeds with no import errors
- [ ] Mobile responsive: conversation thread and reply bar adapt to narrow screens
