import { MagnifyingGlass } from '../../utils/icons'

function MenuSearch({ value, onChange }) {
  return (
    <div className="relative w-full">
      <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search dishes..."
        className="h-14 w-full rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-foreground shadow-inner shadow-slate-200/50 placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

export default MenuSearch
