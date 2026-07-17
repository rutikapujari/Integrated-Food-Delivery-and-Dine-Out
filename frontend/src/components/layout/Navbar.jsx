import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../notification/NotificationBell'
import NotificationDropdown from '../notification/NotificationDropdown'
import {
  ShoppingCart, MagnifyingGlass, User, House,
  Storefront, ForkKnife, ClipboardText, SignOut, List, Receipt,
} from '../../utils/icons'

function Navbar({ onMenuOpen }) {
  const { user, isAuthenticated, logout } = useAuth()
  const { items } = useSelector((state) => state.cart)
  const { unread } = useSelector((state) => state.notification)
  const [showSearch, setShowSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <button className="md:hidden p-2 hover:bg-surface-muted rounded-lg" onClick={onMenuOpen}>
          <List className="w-6 h-6" />
        </button>

        <Link to="/" className="font-display text-primary text-2xl tracking-wider shrink-0">
          FoodHub
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Home', icon: House },
            { to: '/restaurants', label: 'Restaurants', icon: Storefront },
            { to: '/menu', label: 'Menu', icon: ForkKnife },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-surface-muted"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden sm:flex items-center flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative w-full">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </form>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="sm:hidden p-2 hover:bg-surface-muted rounded-lg"
            onClick={() => setShowSearch(!showSearch)}
          >
            <MagnifyingGlass className="w-5 h-5" />
          </button>

          <Link to="/cart" className="relative p-2 hover:bg-surface-muted rounded-lg">
            <ShoppingCart className="w-5 h-5" />
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center">
                {items.length > 9 ? '9+' : items.length}
              </span>
            )}
          </Link>

          <div className="relative">
            <NotificationBell
              unread={unread}
              onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowUserMenu(false) }}
            />
            <NotificationDropdown
              isOpen={showNotifDropdown}
              onClose={() => setShowNotifDropdown(false)}
            />
          </div>

          <div className="relative">
            <button
              className="p-2 hover:bg-surface-muted rounded-lg flex items-center gap-2"
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifDropdown(false) }}
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium truncate max-w-[100px]">
                {isAuthenticated ? user?.name : ''}
              </span>
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] py-2"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-border">
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setShowUserMenu(false)}>
                        <House className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setShowUserMenu(false)}>
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setShowUserMenu(false)}>
                        <ClipboardText className="w-4 h-4" /> Orders
                      </Link>
                      <Link to="/payments" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setShowUserMenu(false)}>
                        <Receipt className="w-4 h-4" /> Payments
                      </Link>
                      <button onClick={() => { logout(); setShowUserMenu(false) }} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-muted w-full text-left text-destructive">
                        <SignOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="block px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted" onClick={() => setShowUserMenu(false)}>
                      Sign In
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden overflow-hidden border-t border-border"
          >
            <form onSubmit={handleSearch} className="px-4 py-3">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search restaurants or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-white text-sm"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
