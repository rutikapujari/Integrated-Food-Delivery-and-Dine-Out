function Invoice({ order }) {
  return (
    <div>
      <h2>Invoice</h2>

      <p>Order ID: {order.id}</p>

      <p>Restaurant: {order.restaurant}</p>

      <p>Total Amount: ₹{order.total}</p>

      <button>Download Invoice</button>
    </div>
  );
}

export default Invoice;