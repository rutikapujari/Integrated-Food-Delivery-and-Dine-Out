import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import { notify } from '../../utils/toast'
import { MagnifyingGlass, Users } from '../../utils/icons'
import Pagination from '../../components/common/Pagination'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [updateLoading, setUpdateLoading] = useState(null)

  const fetchUsers = useCallback(async (page = 1, searchQuery = '') => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminService.getUsers({ page, search: searchQuery, limit: 15 })
      setUsers(data.users || [])
      setPagination({ page: data.page || 1, pages: data.pages || 1, total: data.total || 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1, search), 400)
    return () => clearTimeout(timer)
  }, [search, fetchUsers])

  const handleRoleChange = async (userId, newRole) => {
    setUpdateLoading(userId)
    try {
      await adminService.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)))
      notify.success('Role updated')
    } catch { notify.error('Failed to update role') }
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
              <Users className="h-5 w-5" weight="fill" />
            </div>
            <span className="text-[#EA580C] text-sm font-bold tracking-wider uppercase">FoodHub Admin</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Users</h2>
          <p className="text-white/50 text-sm">{pagination.total} user{pagination.total === 1 ? '' : 's'} registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" /><div className="h-4 w-24 bg-gray-100 animate-pulse rounded" /></div></td>
                    <td className="p-4 hidden md:table-cell"><div className="h-4 w-40 bg-gray-100 animate-pulse rounded" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-gray-100 animate-pulse rounded" /></td>
                    <td className="p-4 hidden lg:table-cell"><div className="h-4 w-24 bg-gray-100 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : !users.length ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center text-sm font-bold">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={updateLoading === user._id}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-semibold focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 focus:outline-none bg-white disabled:opacity-50"
                      >
                        <option value="customer">Customer</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-400 text-sm hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(p) => fetchUsers(p, search)} />
    </div>
  )
}

export default AdminUsersPage
