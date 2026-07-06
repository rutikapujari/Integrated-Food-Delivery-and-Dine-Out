function MenuItemDetails({ item }) {
  return (
    <div>

      <h2>{item.name}</h2>

      <p>{item.description}</p>

      <p>Category : {item.category}</p>

      <p>Price : ₹{item.price}</p>

    </div>
  );
}

export default MenuItemDetails;