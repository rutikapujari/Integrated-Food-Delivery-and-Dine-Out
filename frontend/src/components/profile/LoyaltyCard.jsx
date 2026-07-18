import { motion } from 'framer-motion'
import { Star, Gift, Trophy } from '../../utils/icons'

const TIERS = [
  { min: 0, name: 'Bronze', color: 'from-amber-700 to-amber-500' },
  { min: 50, name: 'Silver', color: 'from-slate-400 to-slate-300' },
  { min: 150, name: 'Gold', color: 'from-yellow-500 to-amber-400' },
  { min: 300, name: 'Platinum', color: 'from-indigo-500 to-purple-500' },
]

function tierFor(points) {
  let current = TIERS[0]
  for (const t of TIERS) if (points >= t.min) current = t
  const next = TIERS[TIERS.indexOf(current) + 1]
  return { current, next }
}

function LoyaltyCard({ points = 0 }) {
  const { current, next } = tierFor(points)
  const progress = next ? Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100)) : 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[var(--radius-lg)] bg-gradient-to-br ${current.color} p-6 text-white shadow-[var(--shadow-card)]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6" weight="duotone" />
          <span className="text-sm font-semibold uppercase tracking-wide">Loyalty</span>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{current.name} Member</span>
      </div>

      <div className="mt-4">
        <p className="text-4xl font-display font-bold">{points}</p>
        <p className="text-sm text-white/80">reward points earned</p>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-white/25">
          <div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/80">
          {next ? `${next.min - points} more points to ${next.name}` : 'Top tier reached!'}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-white/90">
        <span className="flex items-center gap-1"><Star className="h-4 w-4" weight="fill" /> Earn on reviews</span>
        <span className="flex items-center gap-1"><Gift className="h-4 w-4" /> Redeem for discounts</span>
      </div>
    </motion.div>
  )
}

export default LoyaltyCard
