import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { pageTransition } from '../utils/motion'
import { fetchCurrentUser } from '../redux/authSlice'
import ProfileCard from '../components/profile/ProfileCard'
import LoyaltyCard from '../components/profile/LoyaltyCard'
import EditProfile from '../components/profile/EditProfile'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import Loader from '../components/common/Loader'

function ProfilePage() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <ProtectedRoute>
      <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-display text-3xl md:text-4xl mb-8">My Profile</h1>

        {loading ? (
          <Loader variant="page" />
        ) : (
          <div className="space-y-6">
            <LoyaltyCard points={user?.loyaltyPoints || 0} />
            <ProfileCard user={user} />
            <EditProfile />
          </div>
        )}
      </motion.div>
    </ProtectedRoute>
  )
}

export default ProfilePage
