function RestaurantCategories() {
  const categories = [
    "Pizza",
    "Burger",
    "Biryani",
    "Chinese",
    "South Indian"
  ];

  return (
    <div>
      {categories.map((category) => (
        <button key={category}>
          {category}
        </button>
      ))}
    </div>
  );
}

export default RestaurantCategories;