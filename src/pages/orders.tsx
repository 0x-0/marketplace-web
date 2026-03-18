import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Package, Loader2, ShoppingBag, User } from "lucide-react"
import { useAuthStore } from "../lib/auth"
import medusa, { getAuthToken } from "../lib/medusa"

interface Order {
  id: string
  display_id: string
  created_at: string
  status: string
  total: number
  currency_code: string
}

export default function Orders() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = getAuthToken()
    if (isAuthenticated() && user && token) {
      fetchOrders()
    } else if (isAuthenticated() && !token) {
      navigate("/login")
    }
  }, [user, isAuthenticated])

  const fetchOrders = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await medusa.store.order.list()
      setOrders(response.orders as Order[])
    } catch (err: any) {
      console.error("Failed to fetch orders:", err)
      setError(err.message || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold">
                Marketplace
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
                <Link to="/products" className="text-sm font-medium hover:text-primary">Products</Link>
                <Link to="/orders" className="text-sm font-medium hover:text-primary">Orders</Link>
              </nav>
              <div className="flex items-center gap-4">
                <Link to="/cart">
                  <button className="p-2 hover:bg-muted rounded-full">
                    <ShoppingBag className="h-5 w-5" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="p-2 hover:bg-muted rounded-full">
                    <User className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">My Orders</h1>

          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Please log in to view your orders</p>
            <p className="text-sm text-muted-foreground mb-6">
              Demo: Orders are created during checkout but require authentication to view
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Log In
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              Marketplace
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
              <Link to="/products" className="text-sm font-medium hover:text-primary">Products</Link>
              <Link to="/orders" className="text-sm font-medium hover:text-primary">Orders</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/cart">
                <button className="p-2 hover:bg-muted rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </Link>
              <Link to="/account">
                <button className="p-2 hover:bg-muted rounded-full">
                  <User className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Orders</h1>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Order #{order.display_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {order.currency_code.toUpperCase()} {order.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
