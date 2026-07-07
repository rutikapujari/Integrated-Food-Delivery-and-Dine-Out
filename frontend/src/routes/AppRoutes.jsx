import { Link, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import CartList from "../components/cart/CartList";
import MenuList from "../components/menu/MenuList";
import OrderList from "../components/order/OrderList";
import RestaurantList from "../components/restaurant/RestaurantList";
import ReviewForm from "../components/review/ReviewForm";
import ReviewList from "../components/review/ReviewList";

function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-card">
          <span className="tag">Fine Dining • Fast Delivery</span>
          <h1>Discover your next favorite meal in a warm, modern setting.</h1>
          <p>From handcrafted burgers to fresh pasta and signature desserts, FoodHub brings restaurant-quality dining straight to your door.</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
            <Link to="/restaurants"><button type="button">Browse Restaurants</button></Link>
            <Link to="/menu"><button type="button" style={{ background: "transparent", color: "var(--accent-dark)", border: "1px solid var(--border)" }}>Explore Menu</button></Link>
          </div>
          <div className="summary-row">
            <span>15+ Years Experience</span>
            <span>5 Expert Chefs</span>
            <span>15000+ Happy Customers</span>
          </div>
        </div>
        <div className="hero-media" />
      </section>

      <section className="section">
        <h2>Why Guests Love Us</h2>
        <div className="section-grid">
          <div className="section-card">
            <div className="icon">🍽️</div>
            <h3>Fresh Ingredients</h3>
            <p>Every dish is prepared with locally inspired produce and premium ingredients.</p>
          </div>
          <div className="section-card">
            <div className="icon">👨‍🍳</div>
            <h3>Expert Team</h3>
            <p>Our chefs blend classic flavors with modern presentation for a memorable meal.</p>
          </div>
          <div className="section-card">
            <div className="icon">💛</div>
            <h3>Cooked with Love</h3>
            <p>We focus on warm hospitality, fast service, and experiences worth repeating.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="showcase-grid">
          <div className="showcase-card">
            <span className="pill">Signature Experience</span>
            <h2>Crafted for comfort, designed for celebration.</h2>
            <p>From rooftop dinners to cozy brunches, our spaces and plates are made to create lasting memories.</p>
          </div>
          <div className="showcase-card">
            <span className="pill">Chef's Pick</span>
            <h3>Smoked Truffle Pasta</h3>
            <p>Rich cream sauce, charred mushrooms, and a finishing touch of fresh herbs.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Popular Restaurants</h2>
        <RestaurantList />
      </section>
    </>
  );
}

function RestaurantsPage() {
  return (
    <section>
      <h1>Restaurants</h1>
      <RestaurantList />
    </section>
  );
}

function MenuPage() {
  return (
    <section>
      <h1>Popular Menu</h1>
      <MenuList />
    </section>
  );
}

function CartPage() {
  return (
    <section>
      <h1>Your Cart</h1>
      <CartList />
    </section>
  );
}

function OrdersPage() {
  return (
    <section>
      <h1>Your Orders</h1>
      <OrderList />
    </section>
  );
}

function ProfilePage() {
  return (
    <section>
      <h1>Profile</h1>
      <p>Manage your account details, saved addresses, and favorite restaurants here.</p>
    </section>
  );
}

function ReviewsPage() {
  return (
    <section>
      <h1>Reviews</h1>
      <p>Share your experience and read what other customers are saying.</p>
      <ReviewForm />
      <ReviewList />
    </section>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
