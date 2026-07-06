function OrderCard({ order }) {
  return (
    <div className="order-card">
      <h3>Order #{order.id}</h3>

      <p>Restaurant: {order.restaurant}</p>

      <p>Total: ₹{order.total}</p>

      <p>Status: {order.status}</p>

      <button>View Details</button>
    </div>
  );
}

export default OrderCard;