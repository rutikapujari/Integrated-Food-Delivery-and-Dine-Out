import MenuPrice from "./MenuPrice";
import AddToCartButton from "./AddToCartButton";

function MenuCard({ item }) {
  return (
    <div className="menu-card">
      <img
        src={item.image}
        alt={item.name}
        width="200"
      />

      <h3>{item.name}</h3>

      <p>{item.description}</p>

      <MenuPrice price={item.price} />

      <AddToCartButton />
    </div>
  );
}

export default MenuCard;