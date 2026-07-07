function RestaurantCategories({ categories, selected, onSelect }) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-primary text-white'
            : 'bg-surface-muted text-foreground hover:bg-border'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
            selected === cat
              ? 'bg-primary text-white'
              : 'bg-surface-muted text-foreground hover:bg-border'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export default RestaurantCategories
