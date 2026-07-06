import { useState } from "react";

function RestaurantSearch() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="Search Restaurant..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button>Search</button>
    </div>
  );
}

export default RestaurantSearch;