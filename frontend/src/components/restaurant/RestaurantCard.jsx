function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        width="250"
      />

      <h2>{restaurant.name}</h2>

      <p>{restaurant.cuisine}</p>

      <p>⭐ {restaurant.rating}</p>

      <p>{restaurant.deliveryTime} mins</p>

      <button>View Menu</button>
    </div>
  );
}

export default RestaurantCard;