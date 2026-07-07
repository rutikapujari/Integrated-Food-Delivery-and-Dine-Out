import MenuCard from './MenuCard'

function MenuCategory({ category, items }) {
  return (
    <div className="mb-8">
      <h3 className="font-display text-xl mb-4 flex items-center gap-2">
        {category}
        <span className="text-muted-foreground text-sm font-body">({items.length})</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default MenuCategory
