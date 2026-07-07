import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { adminService } from '../../services/adminService'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants'
import { notify } from '../../utils/toast'
import Pagination from '../../components/common/Pagination'

const statusColorClass = {
  warning: 'text-warning bg-warning-light',
  accent: 'text-accent bg-accent-50',
  primary: 'text-primary bg-primary-light',
  success: 'text-success bg-success-light',
  destructive: 'text-destructive bg-destructive/10',
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
      const { data } = await adminService.getOrders({
        page,
        limit: 15,
        status: status || undefined,
      })
      setOrders(data.orders || [])
      setPagination({ page: data.page || 1, pages: data.pages || 1, total: data.total || 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    fetchOrders(1, status)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdateLoading(orderId)
    try {
      await adminService.updateOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)))
      notify.success('Order status updated')
    } catch (err) {
      notify.error('Failed to update status')
    } finally {
      setUpdateLoading(null)
    }
  }

  const handlePageChange = (page) => fetchOrders(page, statusFilter)

  return (
    <motion.div {...pageTransition}>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">All Orders</h2>

      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-600">Order ID</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden md:table-cell">Customer</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden lg:table-cell">Restaurant</th>
                <th className="text-left p-4 font-semibold text-slate-600">Items</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden sm:table-cell">Total</th>
                <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden xl:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : !orders.length ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
              ) : (
                orders.map((order) => {
                  const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'
                  return (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs text-primary">
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4 hidden md:table-cell text-slate-700">{order.user?.name || 'N/A'}</td>
                      <td className="p-4 hidden lg:table-cell text-slate-700">{order.restaurant?.name || 'N/A'}</td>
                      <td className="p-4 text-slate-600">{order.items?.length || 0} items</td>
                      <td className="p-4 font-semibold hidden sm:table-cell">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updateLoading === order._id || order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED}
                          className={`h-8 px-2 rounded-lg border text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-60 ${statusColorClass[colorKey]}`}
                        >
                          {statusOptions.map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs hidden xl:table-cell">
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

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
    </motion.div>
  )
}

export default AdminOrdersPage
