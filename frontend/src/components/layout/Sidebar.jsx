import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <h3>Dashboard</h3>

      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/restaurants">Restaurants</Link>
        </li>

        <li>
          <Link to="/orders">Orders</Link>
        </li>

        <li>
          <Link to="/users">Users</Link>
        </li>

        <li>
          <Link to="/settings">Settings</Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;