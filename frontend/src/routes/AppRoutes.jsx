import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import AdminRoute from '../components/layout/AdminRoute'
import AdminLayout from '../components/layout/AdminLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import RestaurantListPage from '../pages/RestaurantListPage'
import RestaurantDetailPage from '../pages/RestaurantDetailPage'
import MenuPage from '../pages/MenuPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import PaymentSuccessPage from '../pages/PaymentSuccessPage'
import PaymentFailedPage from '../pages/PaymentFailedPage'
import PaymentsPage from '../pages/PaymentsPage'
import OrdersPage from '../pages/OrdersPage'
import OrderTrackingPage from '../pages/OrderTrackingPage'
import ProfilePage from '../pages/ProfilePage'
import CustomerDashboardPage from '../pages/CustomerDashboardPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminRestaurantsPage from '../pages/admin/AdminRestaurantsPage'
import AdminMenuPage from '../pages/admin/AdminMenuPage'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import AdminRegisterPage from '../pages/admin/AdminRegisterPage'
import DeliveryPage from '../pages/DeliveryPage'
import CourierLoginPage from '../pages/CourierLoginPage'
import CourierRoute from '../components/layout/CourierRoute'
import DeliveryLayout from '../components/layout/DeliveryLayout'
import AvailableDeliveriesPage from '../pages/delivery/AvailableDeliveriesPage'
import ActiveDeliveryPage from '../pages/delivery/ActiveDeliveryPage'
import DeliveryEarningsPage from '../pages/delivery/DeliveryEarningsPage'
import DeliveryProfilePage from '../pages/delivery/DeliveryProfilePage'
import CourierRegisterPage from '../pages/CourierRegisterPage'
import EventsPage from '../pages/EventsPage'
import EventDetailPage from '../pages/EventDetailPage'
import RestaurantRoute from '../components/layout/RestaurantRoute'
import PartnerLayout from '../components/layout/PartnerLayout'
import PartnerDashboardPage from '../pages/partner/PartnerDashboardPage'
import PartnerMenuPage from '../pages/partner/PartnerMenuPage'
import PartnerOrdersPage from '../pages/partner/PartnerOrdersPage'
import BookReservationPage from '../pages/BookReservationPage'
import RestaurantMenuManagePage from '../pages/RestaurantMenuManagePage'
import ReservationsPage from '../pages/ReservationsPage'
import RestaurantReviewsPage from '../pages/RestaurantReviewsPage'
import SupportPage from '../pages/SupportPage'
import NotificationsPage from '../pages/NotificationsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />

      <Route path="/courier/login" element={<CourierLoginPage />} />
      <Route path="/courier/register" element={<CourierRegisterPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/restaurants/:id/reviews" element={<RestaurantReviewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        <Route path="/partner" element={
          <RestaurantRoute><PartnerLayout /></RestaurantRoute>
        }>
          <Route index element={<PartnerDashboardPage />} />
          <Route path="menu" element={<PartnerMenuPage />} />
          <Route path="orders" element={<PartnerOrdersPage />} />
        </Route>

        <Route path="/menu" element={<MenuPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><CustomerDashboardPage /></ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute><CartPage /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        } />
        <Route path="/payment-success" element={
          <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>
        } />
        <Route path="/payment-failed" element={
          <ProtectedRoute><PaymentFailedPage /></ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute><PaymentsPage /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute><OrderTrackingPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        <Route path="/reservations" element={
          <ProtectedRoute><ReservationsPage /></ProtectedRoute>
        } />
        <Route path="/restaurants/:id/reserve" element={
          <ProtectedRoute><BookReservationPage /></ProtectedRoute>
        } />
        <Route path="/restaurants/:id/manage-menu" element={
          <ProtectedRoute><RestaurantMenuManagePage /></ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute><SupportPage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />

        <Route path="/delivery" element={
          <CourierRoute><DeliveryLayout /></CourierRoute>
        }>
          <Route index element={<ActiveDeliveryPage />} />
          <Route path="active" element={<ActiveDeliveryPage />} />
          <Route path="available" element={<AvailableDeliveriesPage />} />
          <Route path="earnings" element={<DeliveryEarningsPage />} />
          <Route path="profile" element={<DeliveryProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
          <Route path="/admin/menu" element={<AdminMenuPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
