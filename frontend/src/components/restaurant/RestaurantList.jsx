import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Store } from "lucide-react";

import { clearFilters, fetchRestaurants, setPage } from "../../redux/restaurantSlice";
import RestaurantCard from "./RestaurantCard";
import Pagination from "../common/Pagination";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";


function RestaurantList({ limit, showPagination = true }) {
  const dispatch = useDispatch();

  const { list, loading, error, pagination, search, filters } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    dispatch(
      fetchRestaurants({
        page: pagination?.page || 1,
        limit: limit || pagination?.limit || 8,
        search: search || undefined,
        cuisine: filters?.cuisine || undefined,
        rating: filters?.rating || undefined,
        deliveryTime: filters?.deliveryTime || undefined,
      })
    );
  }, [
    dispatch,
    pagination?.page,
    pagination?.limit,
    limit,
    search,
    filters,
  ]);

  if (loading) {
    return <Loader variant="card" count={limit || 8} />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => dispatch(fetchRestaurants())}
      />
    );
  }

  if (!list || list.length === 0) {
    const clearAllFilters = () => {
      dispatch(clearFilters());
      dispatch(setPage(1));
    };

    return (
      <EmptyState
        icon={Store}
        title="No Restaurants Found"
        description="Try adjusting your search or filters."
        action={{
          label: "Clear Filters",
          onClick: clearAllFilters,
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {list.map((restaurant, index) => (
            <motion.div
              key={restaurant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              whileTap={{ scale: 0.97 }}
              className="h-full"
            >
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {showPagination && pagination?.pages > 1 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) =>
              dispatch({
                type: "restaurant/setPage",
                payload: page,
              })
            }
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default RestaurantList;
