import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RestaurantSearch = ({
  value = "",
  onChange,
  placeholder = "Search restaurants or cuisines...",
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");

    if (onChange) {
      onChange("");
    }
  }, [onChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative mb-8"
    >
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />

        <input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          className="h-16 w-full rounded-full border border-slate-200 bg-white pl-14 pr-14 text-xl text-foreground shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
        />

        <AnimatePresence>
          {localValue && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 p-1.5 text-slate-500 transition-all hover:bg-primary hover:text-white"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RestaurantSearch;
