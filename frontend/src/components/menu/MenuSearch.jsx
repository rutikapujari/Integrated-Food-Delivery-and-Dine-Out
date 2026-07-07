import { MagnifyingGlass } from '../../utils/icons'

function MenuSearch({ value, onChange }) {
  return (
    <div className="relative w-full mb-6">
      <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search dishes..."
        className="w-full h-12 pl-12 pr-4 rounded-full border border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
      />
    </div>
  )
}

export default MenuSearch
