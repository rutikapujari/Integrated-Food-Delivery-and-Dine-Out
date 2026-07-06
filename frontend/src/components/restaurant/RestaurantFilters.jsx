function RestaurantFilters() {
  return (
    <div>
      <h2>Filters</h2>

      <select>
        <option>All Ratings</option>
        <option>4★ & Above</option>
        <option>3★ & Above</option>
      </select>

      <select>
        <option>All Cuisine</option>
        <option>Indian</option>
        <option>Chinese</option>
        <option>Italian</option>
      </select>

      <button>Apply</button>
    </div>
  );
}

export default RestaurantFilters;