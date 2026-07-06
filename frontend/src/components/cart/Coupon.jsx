import { useState } from "react";

function Coupon() {

  const [coupon, setCoupon] = useState("");

  return (
    <div>

      <input
        type="text"
        placeholder="Enter Coupon Code"
        value={coupon}
        onChange={(e) => setCoupon(e.target.value)}
      />

      <button>Apply</button>

    </div>
  );
}

export default Coupon;