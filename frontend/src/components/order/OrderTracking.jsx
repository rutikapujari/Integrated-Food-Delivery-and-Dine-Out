import OrderStatus from "./OrderStatus";
import OrderTimeline from "./OrderTimeline";

function OrderTracking() {
  return (
    <div>
      <h2>Track Your Order</h2>

      <OrderStatus status="Out For Delivery" />

      <OrderTimeline />
    </div>
  );
}

export default OrderTracking;