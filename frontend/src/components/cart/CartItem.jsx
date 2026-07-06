function CartItem({ item }) {
  return (
    <div className="cart-item">
      <img
        src={item.image}
        alt={item.name}
        width="120"
      />

      <div>
        <h3>{item.name}</h3>

        <p>₹ {item.price}</p>

        <p>Quantity : {item.quantity}</p>
      </div>

      <button>Remove</button>
    </div>
  );
}

export default CartItem;