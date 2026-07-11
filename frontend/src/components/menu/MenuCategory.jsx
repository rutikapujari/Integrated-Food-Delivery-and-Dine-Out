import MenuCard from './MenuCard'

function MenuCategory({ category, items }) {
  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 font-display text-3xl text-slate-950">
          {category}
          <span className="font-body text-sm text-muted-foreground">({items.length})</span>
        </h3>
        <div className="hidden h-px flex-1 bg-slate-200 sm:block" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default MenuCategory
