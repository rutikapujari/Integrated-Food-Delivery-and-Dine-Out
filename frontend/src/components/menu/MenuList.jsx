import MenuCard from "./MenuCard";

const menuItems = [
  {
    id: 1,
    name: "Veg Burger",
    description: "Cheese Veg Burger",
    price: 149,
    image: "https://via.placeholder.com/200"
  },
  {
    id: 2,
    name: "Pizza",
    description: "Margherita Pizza",
    price: 299,
    image: "https://via.placeholder.com/200"
  }
];

function MenuList() {
  return (
    <div>
      {menuItems.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}

export default MenuList;