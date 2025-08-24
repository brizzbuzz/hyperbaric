import { authClient } from '../lib/auth'

interface User {
  id: string
  email: string
  name: string
}

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        <div className="user-info">
          <h2>Your Account</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>

        <div className="dashboard-section">
          <h2>Dashboard</h2>
          <p>You are successfully authenticated! This is your protected dashboard.</p>
          <div className="placeholder-content">
            <p>This is where your app content would go...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
