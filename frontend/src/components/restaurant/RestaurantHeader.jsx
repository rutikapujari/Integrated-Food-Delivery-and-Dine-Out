function RestaurantHeader({ restaurant }) {
  return (
    <div>
      <img
        src={restaurant.image}
        alt={restaurant.name}
        width="500"
      />

      <h1>{restaurant.name}</h1>

      <p>{restaurant.cuisine}</p>

      <p>⭐ {restaurant.rating}</p>

      <p>{restaurant.address}</p>
    </div>
  );
}

export default RestaurantHeader;