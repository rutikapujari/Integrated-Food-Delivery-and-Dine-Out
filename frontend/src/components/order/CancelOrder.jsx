function CancelOrder() {

  function handleCancel() {
    alert("Order Cancelled");
  }

  return (
    <button onClick={handleCancel}>
      Cancel Order
    </button>
  );
}

export default CancelOrder;