import { useState } from "react";

function MenuQuantity() {

  const [quantity, setQuantity] = useState(1);

  return (
    <div>

      <button
        onClick={() => setQuantity(quantity - 1)}
        disabled={quantity === 1}
      >
        -
      </button>

      <span>{quantity}</span>

      <button
        onClick={() => setQuantity(quantity + 1)}
      >
        +
      </button>

    </div>
  );
}

export default MenuQuantity;