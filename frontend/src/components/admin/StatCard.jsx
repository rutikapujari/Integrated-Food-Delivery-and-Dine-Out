import { ArrowRight } from '../../utils/icons'

function StatCard({ title, value, icon: Icon, change, loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 font-medium">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-2" />
          ) : (
            <p className="text-xl font-bold mt-1.5 text-gray-900">{value}</p>
          )}
          {change && (
            <p className={`text-xs font-bold mt-1.5 ${change.type === 'increase' ? 'text-green-600' : 'text-red-500'}`}>
              {change.type === 'increase' ? '↑' : '↓'} {change.value}%
            </p>
          )}
        </div>
        <div className="h-11 w-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
          <Icon className="w-5.5 h-5.5 text-[#EA580C]" />
        </div>
      </div>
    </div>
  )
}

export default StatCard
