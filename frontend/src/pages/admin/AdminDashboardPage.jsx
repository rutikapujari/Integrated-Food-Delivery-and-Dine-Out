import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import StatCard from '../../components/admin/StatCard'
import RevenueChart from '../../components/admin/RevenueChart'
import RecentOrdersTable from '../../components/admin/RecentOrdersTable'
import {
  CurrencyDollar, Package, Users, Storefront, ChartBar,
} from '../../utils/icons'

function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [analyticsRes, revenueRes] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getRevenue({ period: 'monthly', months: 6 }),
        ])
        setAnalytics(analyticsRes.data)
        setRecentOrders(analyticsRes.data.recentOrders || [])

        if (revenueRes.data?.revenue) {
          setRevenueData(
            revenueRes.data.revenue.map((item) => ({
              label: item.month || item.label,
              revenue: item.amount || item.revenue,
            }))
          )
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data')
        notify.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = {
    revenue: analytics?.totalRevenue || 0,
    totalOrders: analytics?.totalOrders || 0,
    activeUsers: analytics?.activeUsers || 0,
    restaurantCount: analytics?.restaurantCount || 0,
  }

  return (
    <div>
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2838] via-[#1E3A5F] to-[#0F172A] rounded-2xl mb-6">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#EA580C]/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#F97316]/10 blur-2xl" />
        <div className="relative px-6 md:px-8 pt-8 pb-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center">
              <ChartBar className="h-5 w-5" weight="fill" />
            </div>
            <span className="text-[#EA580C] text-sm font-bold tracking-wider uppercase">FoodHub Admin</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Dashboard Overview</h2>
          <p className="text-white/50 text-sm">Real-time snapshot of your platform</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-[11px] text-white/40 mb-1">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-[11px] text-white/40 mb-1">Orders</p>
              <p className="text-xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-[11px] text-white/40 mb-1">Users</p>
              <p className="text-xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-[11px] text-white/40 mb-1">Restaurants</p>
              <p className="text-xl font-bold">{stats.restaurantCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          icon={CurrencyDollar}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Restaurants"
          value={stats.restaurantCount}
          icon={Storefront}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all">
          <h3 className="font-bold text-gray-900 mb-4">Revenue Overview</h3>
          <RevenueChart data={revenueData} loading={loading} />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all">
          <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
          <RecentOrdersTable orders={recentOrders} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
