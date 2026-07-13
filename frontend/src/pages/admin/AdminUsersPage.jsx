import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { adminService } from '../../services/adminService'
import { notify } from '../../utils/toast'
import { MagnifyingGlass, Pencil } from '../../utils/icons'
import Pagination from '../../components/common/Pagination'
import Button from '../../components/common/Button'

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
    } catch (err) {
      notify.error('Failed to update role')
    } finally {
      setUpdateLoading(null)
    }
  }

  const handlePageChange = (page) => fetchUsers(page, search)

  return (
    <motion.div {...pageTransition}>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Users</h2>

      <div className="relative mb-6 max-w-md">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" /><div className="h-4 w-24 bg-slate-100 animate-pulse rounded" /></div></td>
                    <td className="p-4 hidden md:table-cell"><div className="h-4 w-40 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded" /></td>
                    <td className="p-4 hidden lg:table-cell"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : !users.length ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={updateLoading === user._id}
                        className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white disabled:opacity-50"
                      >
                        <option value="customer">Customer</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
    </motion.div>
  )
}

export default AdminUsersPage
