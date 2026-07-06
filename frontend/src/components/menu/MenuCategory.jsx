function MenuCategory() {

  const categories = [
    "Burger",
    "Pizza",
    "Chinese",
    "Biryani",
    "Dessert"
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

export default MenuCategory;