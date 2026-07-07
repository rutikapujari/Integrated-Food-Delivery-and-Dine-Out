import { User, Envelope, Phone } from '../../utils/icons'

function ProfileCard({ user }) {
  if (!user) return null

  return (
    <div className="bg-white border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-xl">{user.name}</h2>
          <p className="text-muted-foreground text-sm">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Envelope className="w-4 h-4 text-muted-foreground" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>+91 {user.phone}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileCard
