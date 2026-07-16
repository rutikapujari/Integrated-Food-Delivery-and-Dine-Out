import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Envelope, Phone, InstagramLogo, FacebookLogo, TwitterLogo, MapPin,
} from '@phosphor-icons/react'
import { menuService } from '../../services/menuService'

const footerGroups = [
  {
    title: 'FoodHub',
    links: [['About us', '/about'], ['Careers', '/careers'], ['Blog', '/blog'], ['Help & support', '/support']],
  },
  {
    title: 'For foodies',
    links: [['Restaurants', '/restaurants'], ['Browse menu', '/menu'], ['Track an order', '/orders'], ['Reservations', '/reservations']],
  },
  {
    title: 'For partners',
    links: [['Partner with FoodHub', '/admin/register'], ['Restaurant login', '/admin/login'], ['List your restaurant', '/admin/register'], ['Business support', '/support']],
  },
]

function Footer() {
  const [popularCategories, setPopularCategories] = useState([])

  useEffect(() => {
    let isMounted = true

    menuService.getAll()
      .then(({ data }) => {
        if (!isMounted) return
        const categories = [...new Set((data.menuItems || []).map((item) => item.category).filter(Boolean))].slice(0, 7)
        setPopularCategories(categories)
      })
      .catch(() => {
        if (isMounted) setPopularCategories([])
      })

    return () => { isMounted = false }
  }, [])

  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#f7f7f8] text-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-14">
        <div className="mb-10 flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="font-display text-4xl tracking-wide text-slate-950">FOOD<span className="text-primary">HUB</span></Link>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-primary" weight="fill" /> Pune, Maharashtra</span>
            <span className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">India ▾</span>
          </div>
        </div>

        {popularCategories.length > 0 && (
          <div className="mb-10 rounded-2xl border border-orange-100 bg-orange-50/60 px-5 py-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-slate-900">Popular on FoodHub</p>
              <p className="mt-1 text-xs text-slate-500">Fresh picks from restaurants currently on the platform</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
              {popularCategories.map((category) => (
                <Link key={category} to={`/menu?search=${encodeURIComponent(category)}`} className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-primary hover:bg-primary hover:text-white">
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(3,1fr)_1.15fr]">
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.13em] text-slate-900">Order with confidence</h4>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">From neighbourhood favourites to your doorstep—fresh, simple and trackable.</p>
            <div className="mt-5 flex gap-2">
              <a aria-label="Instagram" href="#" className="rounded-full border border-slate-300 bg-white p-2.5 transition-colors hover:border-primary hover:bg-primary hover:text-white"><InstagramLogo className="h-4 w-4" /></a>
              <a aria-label="Facebook" href="#" className="rounded-full border border-slate-300 bg-white p-2.5 transition-colors hover:border-primary hover:bg-primary hover:text-white"><FacebookLogo className="h-4 w-4" /></a>
              <a aria-label="Twitter" href="#" className="rounded-full border border-slate-300 bg-white p-2.5 transition-colors hover:border-primary hover:bg-primary hover:text-white"><TwitterLogo className="h-4 w-4" /></a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-extrabold uppercase tracking-[0.13em] text-slate-900">{group.title}</h4>
              <div className="mt-4 flex flex-col gap-3">
                {group.links.map(([label, to]) => <Link key={label} to={to} className="text-sm text-slate-500 transition-colors hover:text-primary hover:underline">{label}</Link>)}
              </div>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-[0.13em] text-slate-900">Contact us</h4>
            <a href="mailto:support@foodhub.com" className="mt-4 flex items-center gap-2 text-sm text-slate-500 hover:text-primary"><Envelope className="h-4 w-4" /> support@foodhub.com</a>
            <a href="tel:1800123456" className="mt-3 flex items-center gap-2 text-sm text-slate-500 hover:text-primary"><Phone className="h-4 w-4" /> 1800-123-456</a>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Coming soon on</p>
            <div className="mt-3 flex gap-2">
              <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"> App Store</span>
              <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">▶ Google Play</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>© {new Date().getFullYear()} FoodHub. All rights reserved.</span>
          <span>Privacy Policy &nbsp;•&nbsp; Terms of Service &nbsp;•&nbsp; Cookie Policy</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
