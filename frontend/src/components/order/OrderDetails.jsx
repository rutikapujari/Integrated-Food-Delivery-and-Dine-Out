function OrderDetails({ order }) {
  return (
    <div>
      <h2>Order Details</h2>

      <p>Order ID: {order.id}</p>

      <p>Restaurant: {order.restaurant}</p>

      <p>Items: {order.items}</p>

      <p>Total: ₹{order.total}</p>
    </div>
  );
}

export default OrderDetails;