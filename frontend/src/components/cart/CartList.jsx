import CartItem from "./CartItem";

const cartItems = [
  {
    id: 1,
    name: "Veg Burger",
    price: 149,
    quantity: 2,
    image: "https://via.placeholder.com/120"
  },
  {
    id: 2,
    name: "Pizza",
    price: 299,
    quantity: 1,
    image: "https://via.placeholder.com/120"
  }
];

function CartList() {
  return (
    <div>
      {cartItems.map((item) => (
        <CartItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}

export default CartList;