import { Link } from "react-router-dom"
import { User, Package, LogOut } from "lucide-react"
import { useAuthStore } from "../lib/auth"

export default function Account() {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              Marketplace
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Account</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Account ID: {user?.id}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/orders"
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <Package className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-medium">My Orders</p>
                <p className="text-sm text-muted-foreground">View your order history</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted transition-colors w-full text-left"
            >
              <LogOut className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-medium">Log Out</p>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
