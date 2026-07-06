function CheckoutButton() {

  function handleCheckout() {

    alert("Proceeding to Checkout");

  }

  return (
    <button onClick={handleCheckout}>
      Proceed To Checkout
    </button>
  );
}

export default CheckoutButton;