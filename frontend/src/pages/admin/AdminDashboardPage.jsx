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
      <div className="mb-8 overflow-hidden rounded-xl border border-white/80 bg-white/80 p-6 shadow-card backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Live operations</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="mt-2 text-muted-foreground">Real-time snapshot of your platform performance</p>
          </div>
          <div className="rounded-lg border border-primary-100 bg-primary-light px-4 py-3 text-sm font-semibold text-primary-dark">
            {error ? 'Data needs attention' : 'Updated just now'}
          </div>
        </div>
        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">{error}</p>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Last 6 months</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Revenue Overview</h3>
            </div>
          </div>
          <RevenueChart data={revenueData} loading={loading} />
        </div>
        <div className="rounded-xl border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Fulfillment queue</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Recent Orders</h3>
          </div>
          <RecentOrdersTable orders={recentOrders} loading={loading} />
        </div>
      </div>
    </motion.div>
  )
}

export default AdminDashboardPage
