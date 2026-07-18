import { NavLink, Outlet, Link } from 'react-router-dom'
import { Storefront, ClipboardText, List, ArrowLeft, ChartBar } from '../../utils/icons'

const NAV = [
  { to: '/partner', end: true, label: 'Dashboard', icon: ChartBar },
  { to: '/partner/menu', label: 'Menu', icon: List },
  { to: '/partner/orders', label: 'Orders', icon: ClipboardText },
]

function PartnerLayout() {
  return (
    <div className="min-h-screen bg-surface-bg md:flex">
      <aside className="md:w-64 md:shrink-0 md:border-r md:border-border bg-white md:min-h-screen">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Storefront className="h-6 w-6" weight="duotone" />
          </span>
          <div>
            <p className="font-display text-lg leading-none">FoodHub</p>
            <p className="text-xs text-muted-foreground">Partner</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-light text-primary' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" weight="duotone" />
                {n.label}
              </NavLink>
            )
          })}
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-surface-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Site
          </Link>
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

export default PartnerLayout
