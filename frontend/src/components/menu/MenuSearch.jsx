import { useState } from "react";

function MenuSearch() {

  const [search, setSearch] = useState("");

  return (
    <div>

      <input
        type="text"
        placeholder="Search Food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>
  );
}

export default MenuSearch;