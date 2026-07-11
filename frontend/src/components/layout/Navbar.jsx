import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import NotificationBell from '../notification/NotificationBell'
import NotificationDropdown from '../notification/NotificationDropdown'
import {
  ShoppingCart, MagnifyingGlass, User, House,
  Storefront, ForkKnife, ClipboardText, SignOut, List,
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
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/90 shadow-sm shadow-slate-200/60 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <button className="rounded-lg p-2 transition hover:bg-primary-light md:hidden" onClick={onMenuOpen} aria-label="Open menu">
          <List className="w-6 h-6" />
        </button>

        <Link to="/" className="shrink-0 font-display text-3xl tracking-wider text-slate-950">
          FoodHub
          <span className="text-primary">.</span>
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
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-primary-light hover:text-primary"
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
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-foreground shadow-inner shadow-slate-200/40 placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="rounded-lg p-2 transition hover:bg-primary-light sm:hidden"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search"
          >
            <MagnifyingGlass className="w-5 h-5" />
          </button>

          <Link to="/cart" className="relative rounded-lg p-2 transition hover:bg-primary-light" aria-label="Cart">
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
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-primary/30 hover:bg-primary-light"
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifDropdown(false) }}
            >
              <User className="w-5 h-5" />
              <span className="hidden max-w-[100px] truncate text-sm font-bold md:inline">
                {isAuthenticated ? user?.name : 'Login'}
              </span>
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-52 rounded-lg border border-slate-100 bg-white py-2 shadow-modal"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-border">
                        <p className="truncate text-sm font-semibold">{user?.name}</p>
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
