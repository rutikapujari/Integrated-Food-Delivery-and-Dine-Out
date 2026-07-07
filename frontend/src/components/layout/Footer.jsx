import { Link } from 'react-router-dom'
import {
  Envelope, Phone, InstagramLogo, FacebookLogo, TwitterLogo,
} from '@phosphor-icons/react'

function Footer() {
  return (
    <footer className="bg-surface-muted border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-1">About Us</h4>
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Story</Link>
            <Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors text-sm">Careers</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Blog</Link>
            <Link to="/press" className="text-muted-foreground hover:text-primary transition-colors text-sm">Press</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-1">Customer Service</h4>
            <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors text-sm">Help Center</Link>
            <Link to="/faqs" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQs</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-1">Quick Links</h4>
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Home</Link>
            <Link to="/restaurants" className="text-muted-foreground hover:text-primary transition-colors text-sm">Restaurants</Link>
            <Link to="/menu" className="text-muted-foreground hover:text-primary transition-colors text-sm">Menu</Link>
            <Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors text-sm">Orders</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-1">Contact</h4>
            <a href="mailto:support@foodhub.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
              <Envelope className="w-4 h-4" /> support@foodhub.com
            </a>
            <a href="tel:1800123456" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
              <Phone className="w-4 h-4" /> 1800-123-456
            </a>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><InstagramLogo className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><FacebookLogo className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><TwitterLogo className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          &copy; {new Date().getFullYear()} FoodHub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
