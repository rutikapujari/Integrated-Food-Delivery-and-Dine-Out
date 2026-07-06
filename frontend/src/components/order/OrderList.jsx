import OrderCard from "./OrderCard";

const orders = [
  {
    id: 1001,
    restaurant: "Pizza Hub",
    total: 499,
    status: "Delivered"
  },
  {
    id: 1002,
    restaurant: "Burger Point",
    total: 299,
    status: "Preparing"
  }
];

function OrderList() {
  return (
    <div>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
        />
      ))}
    </div>
  );
}

export default OrderList;