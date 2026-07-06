import RestaurantCard from "./RestaurantCard";

const restaurants = [
  {
    id: 1,
    name: "Pizza Hub",
    cuisine: "Italian",
    rating: 4.5,
    deliveryTime: 30,
    image: "https://via.placeholder.com/250"
  },
  {
    id: 2,
    name: "Burger King",
    cuisine: "Fast Food",
    rating: 4.2,
    deliveryTime: 20,
    image: "https://via.placeholder.com/250"
  }
];

function RestaurantList() {
  return (
    <div>
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
        />
      ))}
    </div>
  );
}

export default RestaurantList;