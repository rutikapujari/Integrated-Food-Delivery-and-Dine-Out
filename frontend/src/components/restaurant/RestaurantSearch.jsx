import { MagnifyingGlass } from '../../utils/icons'

function RestaurantSearch({ value, onChange, placeholder = 'Search restaurants or cuisines...' }) {
  return (
    <div className="relative mb-4 w-full">
      <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-foreground shadow-inner shadow-slate-200/40 placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

export default RestaurantSearch
