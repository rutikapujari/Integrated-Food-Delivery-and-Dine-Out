import { Link } from 'react-router-dom'
import {
  Envelope, Phone, InstagramLogo, FacebookLogo, TwitterLogo,
} from '@phosphor-icons/react'

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h4 className="mb-1 font-semibold">About Us</h4>
            <Link to="/about" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Our Story</Link>
            <Link to="/careers" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Careers</Link>
            <Link to="/blog" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Blog</Link>
            <Link to="/press" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Press</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="mb-1 font-semibold">Customer Service</h4>
            <Link to="/help" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Help Center</Link>
            <Link to="/faqs" className="text-sm text-slate-400 transition-colors hover:text-primary-300">FAQs</Link>
            <Link to="/privacy" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Terms of Service</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="mb-1 font-semibold">Quick Links</h4>
            <Link to="/" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Home</Link>
            <Link to="/restaurants" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Restaurants</Link>
            <Link to="/menu" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Menu</Link>
            <Link to="/orders" className="text-sm text-slate-400 transition-colors hover:text-primary-300">Orders</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="mb-1 font-semibold">Contact</h4>
            <a href="mailto:support@foodhub.com" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-primary-300">
              <Envelope className="w-4 h-4" /> support@foodhub.com
            </a>
            <a href="tel:1800123456" className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-primary-300">
              <Phone className="w-4 h-4" /> 1800-123-456
            </a>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="text-slate-400 transition-colors hover:text-primary-300"><InstagramLogo className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 transition-colors hover:text-primary-300"><FacebookLogo className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 transition-colors hover:text-primary-300"><TwitterLogo className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-sm text-slate-400">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          &copy; {new Date().getFullYear()} FoodHub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
