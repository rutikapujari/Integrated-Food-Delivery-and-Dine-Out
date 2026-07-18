import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants'
import { notify } from '../../utils/toast'
import Pagination from '../../components/common/Pagination'
import { Package, Funnel } from '../../utils/icons'

const statusColorClass = {
  warning: 'text-amber-600 bg-amber-50 border border-amber-100',
  accent: 'text-blue-600 bg-blue-50 border border-blue-100',
  primary: 'text-[#EA580C] bg-orange-50 border border-orange-100',
  success: 'text-green-600 bg-green-50 border border-green-100',
  destructive: 'text-red-500 bg-red-50 border border-red-100',
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [updateLoading, setUpdateLoading] = useState(null)

  const statusOptions = Object.entries(ORDER_STATUS_LABELS)

  const fetchOrders = useCallback(async (page = 1, status = '') => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminService.getOrders({ page, limit: 15, status: status || undefined })
      setOrders(data.orders || [])
      setPagination({ page: data.page || 1, pages: data.pages || 1, total: data.total || 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusFilter = (status) => { setStatusFilter(status); fetchOrders(1, status) }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdateLoading(orderId)
    try {
      await adminService.updateOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)))
      notify.success('Order status updated')
    } catch { notify.error('Failed to update status') }
    finally { setUpdateLoading(null) }
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2838] via-[#1E3A5F] to-[#0F172A] rounded-2xl mb-6">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#EA580C]/15 blur-3xl" />
        <div className="relative px-6 md:px-8 pt-8 pb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center">
              <Package className="h-5 w-5" weight="fill" />
            </div>
            <span className="text-[#EA580C] text-sm font-bold tracking-wider uppercase">FoodHub Admin</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">All Orders</h2>
          <p className="text-white/50 text-sm">{pagination.total} order{pagination.total === 1 ? '' : 's'} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <Funnel className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Order ID</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Restaurant</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Items</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Total</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider hidden xl:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : !orders.length ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No orders found</td></tr>
              ) : (
                orders.map((order) => {
                  const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'
                  return (
                    <tr key={order._id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 font-mono text-xs font-bold text-[#EA580C]">
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4 hidden md:table-cell text-gray-700">{order.user?.name || 'N/A'}</td>
                      <td className="p-4 hidden lg:table-cell text-gray-700">{order.restaurant?.name || 'N/A'}</td>
                      <td className="p-4 text-gray-500">{order.items?.length || 0} items</td>
                      <td className="p-4 font-bold hidden sm:table-cell text-gray-800">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updateLoading === order._id || order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED}
                          className={`h-8 px-2.5 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#EA580C]/20 focus:outline-none disabled:opacity-50 ${statusColorClass[colorKey]}`}
                        >
                          {statusOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-gray-400 text-xs hidden xl:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(p) => fetchOrders(p, statusFilter)} />
    </div>
  )
}

export default AdminOrdersPage
