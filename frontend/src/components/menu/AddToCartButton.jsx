function AddToCartButton() {

  function handleClick() {
    alert("Item Added To Cart");
  }

  return (
    <button onClick={handleClick}>
      Add To Cart
    </button>
  );
}

export default AddToCartButton;