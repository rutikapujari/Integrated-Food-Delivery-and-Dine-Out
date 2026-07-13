import { Search, X } from 'lucide-react'
import { motion } from 'framer-motion'

const RestaurantSearch = ({ value, onChange, placeholder = "Search restaurants or cuisines..." }) => {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = useCallback((e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }, [onChange])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative mb-6"
    >
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          className="w-full h-12 pl-12 pr-12 rounded-full border border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
        />
        {localValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default RestaurantSearch
