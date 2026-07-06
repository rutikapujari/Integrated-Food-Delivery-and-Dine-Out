import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2>FoodHub</h2>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/restaurants">Restaurants</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <div className="nav-right">
        <input type="text" placeholder="Search food..." />
        <Link to="/cart">🛒 Cart</Link>
      </div>
    </nav>
  );
}

export default Navbar;