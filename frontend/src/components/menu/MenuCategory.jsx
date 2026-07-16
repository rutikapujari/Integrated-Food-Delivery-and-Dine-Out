import MenuCard from './MenuCard'

function MenuCategory({ category, items }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display flex items-center gap-2 text-2xl">
        {category}
        <span className="text-muted-foreground text-sm font-body">({items.length})</span>
        </h3>
        <span className="text-sm font-semibold text-primary">Freshly made</span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default MenuCategory
