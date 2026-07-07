import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { useAuth } from '../hooks/useAuth'
import ProfileCard from '../components/profile/ProfileCard'
import EditProfile from '../components/profile/EditProfile'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import Loader from '../components/common/Loader'

function ProfilePage() {
  const { user, loading } = useAuth()

  return (
    <ProtectedRoute>
      <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-display text-3xl md:text-4xl mb-8">My Profile</h1>

        {loading ? (
          <Loader variant="page" />
        ) : (
          <div className="space-y-6">
            <ProfileCard user={user} />
            <EditProfile />
          </div>
        )}
      </motion.div>
    </ProtectedRoute>
  )
}

export default ProfilePage
