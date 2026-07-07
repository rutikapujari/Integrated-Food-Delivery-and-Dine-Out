# Design System — FoodHub

> **Source:** ui-ux-pro-max skill database
> **Product:** Food Delivery / On-Demand (`products.csv` row 95, `colors.csv` row 96)
> **Style:** Vibrant & Block-based + Motion-Driven (`styles.csv` row 7)
> **Typography:** Bold Statement (`typography.csv` row 8)

---

## Tailwind CSS Setup

### Install

```bash
cd frontend && npm install tailwindcss @tailwindcss/vite
```

### vite.config.js (add plugin)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### src/index.css (replace entire file)

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

@import "tailwindcss";

@theme {
  /* Primary - Appetizing Orange */
  --color-primary: #EA580C;
  --color-primary-hover: #C2410C;
  --color-primary-light: #FFF7ED;
  --color-primary-dark: #9A3412;
  --color-primary-50: #FFF7ED;
  --color-primary-100: #FFEDD5;
  --color-primary-200: #FED7AA;
  --color-primary-300: #FDBA74;
  --color-primary-400: #FB923C;
  --color-primary-500: #F97316;
  --color-primary-600: #EA580C;
  --color-primary-700: #C2410C;
  --color-primary-800: #9A3412;
  --color-primary-900: #7C2D12;

  /* Accent - Trust Blue */
  --color-accent: #2563EB;
  --color-accent-hover: #1D4ED8;
  --color-accent-50: #EFF6FF;
  --color-accent-100: #DBEAFE;
  --color-accent-500: #3B82F6;
  --color-accent-600: #2563EB;
  --color-accent-700: #1D4ED8;

  /* Surfaces */
  --color-surface-bg: #FFF7ED;
  --color-surface-card: #FFFFFF;
  --color-surface-muted: #FDF4F0;
  --color-surface-alt: #FEF2E8;

  /* Text */
  --color-foreground: #0F172A;
  --color-muted-foreground: #64748B;

  /* Borders */
  --color-border: #FCEAE1;
  --color-border-hover: #F5D5B8;

  /* Semantic */
  --color-destructive: #DC2626;
  --color-destructive-hover: #B91C1C;
  --color-success: #16A34A;
  --color-success-light: #DCFCE7;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;

  /* Typography */
  --font-display: 'Bebas Neue', sans-serif;
  --font-body: 'Source Sans 3', sans-serif;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
  --shadow-card-hover: 0 10px 25px rgba(15, 23, 42, 0.12);
  --shadow-modal: 0 20px 45px rgba(15, 23, 42, 0.15);
  --shadow-button: 0 2px 4px rgba(234, 88, 12, 0.3);

  /* Animations */
  --animate-fade-in: fade-in 300ms ease-out;
  --animate-slide-up: slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-scale-in: scale-in 200ms ease-out;
  --animate-pulse-soft: pulse-soft 2s ease-in-out infinite;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Base resets */
body {
  margin: 0;
  background-color: var(--color-surface-bg);
  color: var(--color-foreground);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

---

## Component Patterns

### Button Component

```jsx
// Props:
// variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
// size: 'sm' | 'md' | 'lg'
// loading: boolean
// disabled: boolean
// icon: PhosphorIcon (optional, positioned left)
// children: ReactNode
// onClick, type, className, ...rest

// States to implement: default, hover, pressed, loading, disabled

// Class patterns:
// base: "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
// primary: "bg-primary text-white hover:bg-primary-hover shadow-[var(--shadow-button)]"
// secondary: "bg-surface-muted text-foreground hover:bg-border"
// outline: "border-2 border-primary text-primary hover:bg-primary-light"
// ghost: "text-foreground hover:bg-surface-muted"
// destructive: "bg-destructive text-white hover:bg-destructive-hover"
// sizes: sm="h-9 px-4 text-sm", md="h-11 px-6 text-base", lg="h-14 px-8 text-lg"
// loading: render <Spinner /> instead of icon, pointer-events-none
```

### Input Component

```jsx
// Props:
// label: string
// error?: string
// helperText?: string
// icon?: PhosphorIcon (positioned left)
// iconRight?: PhosphorIcon (positioned right, e.g. eye toggle)
// required?: boolean
// All standard input props (type, placeholder, value, onChange, name, disabled...)

// States: default, focused, filled, error, disabled

// Class patterns:
// wrapper: "flex flex-col gap-1.5"
// label: "text-sm font-semibold text-foreground"
// labelRequired: after:content-['_*'] after:text-destructive
// inputWrapper: "relative"
// input: "w-full h-11 px-4 rounded-[var(--radius-sm)] border border-border bg-white text-foreground placeholder:text-muted-foreground/60 transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:bg-surface-muted disabled:opacity-60"
// inputWithIcon: "pl-10"
// inputError: "border-destructive focus:border-destructive focus:ring-destructive/20"
// icon: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5"
// iconRight: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5"
// error: "text-sm text-destructive"
// helper: "text-sm text-muted-foreground"
```

### Card Component (Food/Restaurant)

```jsx
// Class patterns for all cards:
// base: "bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] transition-all duration-200"
// hover: "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 cursor-pointer"
// image: "w-full h-48 object-cover rounded-t-[var(--radius-lg)]"
// content: "p-4"
```

### Modal Component

```jsx
// Props:
// isOpen: boolean
// onClose: () => void
// title?: string
// children: ReactNode
// footer?: ReactNode
// size: 'sm' | 'md' | 'lg'

// States: open (animated in), closing (animated out), closed (unmounted)

// Class patterns:
// overlay: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
// panel: "bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] w-full animate-[var(--animate-scale-in)]"
// sizes: sm="max-w-sm", md="max-w-md", lg="max-w-lg"
// header: "flex items-center justify-between p-6 border-b border-border"
// title: "text-xl font-semibold"
// closeBtn: "p-2 rounded-full hover:bg-surface-muted transition-colors"
// body: "p-6"
// footer: "flex justify-end gap-3 p-6 border-t border-border"
```

### Skeleton Loader Component

```jsx
// Props:
// variant: 'text' | 'circular' | 'rectangular' | 'card'
// width?: string | number
// height?: string | number
// count?: number (repeats the skeleton)

// Class patterns:
// base: "animate-pulse bg-border rounded"
// text: "h-4 w-full rounded-sm"
// circular: "rounded-full"
// rectangular: "rounded-[var(--radius-md)]"
// card: "h-64 w-full rounded-[var(--radius-lg)]" (full card skeleton)
```

### Navbar Component

```jsx
// Layout: sticky top-0 z-50 bg-surface-bg/95 backdrop-blur-md border-b border-border
// Inner: max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4

// Left: Logo + main nav links (Home, Restaurants, Menu) — visible md:flex, hidden on mobile
// Center: Search input — flex-1 max-w-md hidden sm:block
// Right: Cart icon (with badge) + Notification bell + User avatar/dropdown
// Mobile: Hamburger button that opens sidebar drawer

// NavLink active state: "text-primary font-semibold border-b-2 border-primary"
// NavLink default: "text-foreground hover:text-primary transition-colors"
```

### Footer Component

```jsx
// Layout: bg-surface-muted border-t border-border mt-auto
// Inner: max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-8
// Columns: About | Customer Service | Quick Links | Contact
// Bottom: border-t border-border pt-4 mt-8 text-center text-sm text-muted-foreground
```

---

## Framer Motion Variants (Copy-Paste)

```js
// Place in src/utils/motion.js — import { fadeInUp, stagger, cardHover } from '@/utils/motion'

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

export const cardHover = {
  rest: { y: 0, boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.07)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}

export const scaleOnTap = {
  tap: { scale: 0.97, transition: { duration: 0.1 } }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

export const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.25, ease: 'easeInOut' }
}
```

### Usage Pattern (wrap every page)

```jsx
import { motion } from 'framer-motion'
import { pageTransition } from '@/utils/motion'

function MyPage() {
  return (
    <motion.div {...pageTransition}>
      {/* page content */}
    </motion.div>
  )
}
```

---

## Phosphor Icon Imports (Copy-Paste)

```js
// src/utils/icons.js — re-export with consistent defaults
// Usage: import { ShoppingCart, User, Star } from '@/utils/icons'

export {
  ShoppingCart,
  MagnifyingGlass,
  User,
  House,
  Storefront,
  ForkKnife,
  ClipboardText,
  Star,
  Heart,
  MapPin,
  Clock,
  Phone,
  Gear,
  SignOut,
  X,
  Check,
  CaretRight,
  CaretLeft,
  CaretDown,
  CaretUp,
  Plus,
  Minus,
  Faders,
  Truck,
  CreditCard,
  Bell,
  Ticket,
  MapPinArea,
  List,
  Funnel,
  ArrowLeft,
  ArrowRight,
  Envelope,
  Lock,
  Eye,
  EyeSlash,
  Warning,
  Info,
  Question,
  ChatCircle,
  Share,
  Trash,
  Pencil,
  Package,
  Calendar,
  Users,
  ChartBar,
  CurrencyDollar,
  Tag,
  Percent,
  Crosshair,
  Motorcycle,
  Timer,
  Receipt,
  Note,
  ShieldCheck,
  CheckCircle,
  XCircle,
  WarningCircle,
  Spinner,
  CirclesThreePlus,
  Handbag,
  Hamburger,
  Pizza,
  Coffee,
  Wine,
  Cake,
} from '@phosphor-icons/react'
```

---

## Toast Notification Pattern

```js
// Utility in src/utils/toast.js
import toast from 'react-hot-toast'

export const notify = {
  success: (msg) => toast.success(msg, {
    style: { background: '#FFF7ED', color: '#0F172A', border: '1px solid #FCEAE1' },
    iconTheme: { primary: '#16A34A', secondary: '#FFF' },
    duration: 3000,
  }),
  error: (msg) => toast.error(msg, {
    style: { background: '#FFF7ED', color: '#0F172A', border: '1px solid #FCEAE1' },
    iconTheme: { primary: '#DC2626', secondary: '#FFF' },
    duration: 4000,
  }),
  loading: (msg) => toast.loading(msg, {
    style: { background: '#FFF7ED', color: '#0F172A' },
  }),
  dismiss: (id) => toast.dismiss(id),
}
```

---

## Empty State Component Pattern

```jsx
// Props:
// icon: PhosphorIcon
// title: string
// description: string
// action?: { label: string, onClick: () => void }

// Layout:
// <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
//   <icon className="w-16 h-16 text-border mb-4" weight="duotone" />
//   <h3 className="text-lg font-semibold mb-1">{title}</h3>
//   <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
//   {action && <Button onClick={action.onClick}>{action.label}</Button>}
// </div>
```

---

## Responsive Breakpoint Strategy

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| Base (mobile) | <640px | Single column, stacked, hamburger nav, bottom sheet cart |
| `sm` | ≥640px | Search bar visible, 2-col grids |
| `md` | ≥768px | Full nav visible, 3-col grids, sidebar drawer → persistent |
| `lg` | ≥1024px | 4-col grids, larger hero, side-by-side layouts |
| `xl` | ≥1280px | Max-width container (1280px), extra white space |
| `2xl` | ≥1536px | Max-width container (1536px) |

### Page Container Pattern

```jsx
// Every page wraps in:
<div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
```

### Section Spacing Pattern

```jsx
// Section: py-16 md:py-24
// Section title + description: text-center mb-12
// Grid gap: gap-6 (cards), gap-8 (sections)
```

---

## Anti-Patterns (Enforced by Agent)

| Do NOT | Use Instead |
|--------|-------------|
| Hardcoded color hex values in components | Tailwind classes (`text-primary`, `bg-surface-bg`) |
| `style={{}}` inline styles | Tailwind classes |
| Emoji in UI (🍽️ 👨‍🍳 🛒) | Phosphor icons |
| `<div onClick={...}>` for buttons | `<button>` or `<Button>` component |
| `<input>` without label | `<Input label="..." />` component |
| Static loading text "Loading..." | `<Loader variant="card" />` skeleton |
| `alert()` for errors | `notify.error(...)` toast |
| `fetch()` directly | `src/services/*.js` service functions |
| Hardcoded API URLs | `import.meta.env.VITE_API_URL` from `.env` |
| No touch feedback | `active:scale-95` or `motion` tap variant |
| `<img>` without dimensions | `aspect-[4/3]` or fixed `h-48` |
| Image without `alt` text | Descriptive alt text always |
| Font size in px | rem-based Tailwind classes |
| Random spacing values | 4/8dp rhythm via Tailwind spacing scale |
