import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { aiService } from '../../services/aiService'
import { formatCurrency } from '../../utils/formatCurrency'
import { fadeInUp, staggerContainer } from '../../utils/motion'
import { Sparkle } from '@phosphor-icons/react'
import Loader from '../common/Loader'

function AISuggestionCard({ item, onClick }) {
  return (
    <motion.div
      variants={fadeInUp}
      onClick={onClick}
      className="shrink-0 w-64 bg-white border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-200 snap-start"
    >
      <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
      <div className="p-3">
        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
        <p className="text-primary font-bold text-sm mt-1">{formatCurrency(item.price)}</p>
        {item.reason && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.reason}</p>
        )}
      </div>
    </motion.div>
  )
}

function AISuggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return
    setLoading(true)
    aiService.getSuggestions()
      .then(({ data }) => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated || (!loading && !suggestions.length)) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkle className="w-6 h-6 text-primary" weight="fill" />
          <h3 className="font-semibold text-xl">Recommended for You</h3>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shrink-0 w-64 animate-pulse">
                <div className="h-36 bg-border rounded-t-[var(--radius-lg)]" />
                <div className="p-3 space-y-2 bg-white border border-border border-t-0 rounded-b-[var(--radius-lg)]">
                  <div className="h-4 w-3/4 bg-border rounded" />
                  <div className="h-4 w-1/2 bg-border rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar"
          >
            {suggestions.map((item) => (
              <AISuggestionCard
                key={item._id}
                item={item}
                onClick={() => navigate(`/restaurants/${item.restaurantId}?highlight=${item._id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default AISuggestions
