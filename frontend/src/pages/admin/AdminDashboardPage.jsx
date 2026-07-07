import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import StatCard from '../../components/admin/StatCard'
import RevenueChart from '../../components/admin/RevenueChart'
import RecentOrdersTable from '../../components/admin/RecentOrdersTable'
import {
  CurrencyDollar, Package, Users, Storefront,
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
    revenueChange: analytics?.revenueChange,
    totalOrders: analytics?.totalOrders || 0,
    orderChange: analytics?.orderChange,
    activeUsers: analytics?.activeUsers || 0,
    restaurantCount: analytics?.restaurantCount || 0,
  }

  return (
    <motion.div {...pageTransition}>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Dashboard Overview</h2>
        <p className="text-muted-foreground">Real-time snapshot of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          icon={CurrencyDollar}
          change={stats.revenueChange ? { value: stats.revenueChange, type: stats.revenueChange > 0 ? 'increase' : 'decrease' } : undefined}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={Package}
          change={stats.orderChange ? { value: stats.orderChange, type: stats.orderChange > 0 ? 'increase' : 'decrease' } : undefined}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue Overview</h3>
          <RevenueChart data={revenueData} loading={loading} />
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Orders</h3>
          <RecentOrdersTable orders={recentOrders} loading={loading} />
        </div>
      </div>
    </motion.div>
  )
}

export default AdminDashboardPage
