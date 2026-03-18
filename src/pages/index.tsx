import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ShoppingBag, Search, Menu, User, Heart, Loader2, Package } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useAuthStore } from "@/lib/auth"

interface Product {
  id: string
  title: string
  thumbnail?: string
  images?: Array<{ id: string; url: string }>
  variants?: Array<{
    id: string
    prices?: Array<{ amount: number; currency_code: string }>
  }>
}

export default function Index() {
  const { isAuthenticated } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.list({ limit: 4 })
        setProducts(data.products || [])
      } catch (err) {
        console.error("Failed to fetch products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const formatPrice = (amount: number | undefined, currency: string = "usd") => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const getPrice = (product: Product) => {
    const variant = product.variants?.[0]
    const price = variant?.prices?.[0]
    if (price) {
      return formatPrice(price.amount, price.currency_code)
    }
    return "N/A"
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold">
                Marketplace
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium">
                  Home
                </Link>
                <Link to="/products" className="text-sm font-medium">
                  Products
                </Link>
                <Link to="/orders" className="text-sm font-medium">
                  Orders
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-9 pr-4 py-2 rounded-full border bg-background text-sm w-64"
                />
              </div>
              <button className="p-2 hover:bg-muted rounded-full">
                <Heart className="h-5 w-5" />
              </button>
              <Link to="/orders">
                <button className="p-2 hover:bg-muted rounded-full">
                  <Package className="h-5 w-5" />
                </button>
              </Link>
              <Link to={isAuthenticated() ? "/account" : "/login"}>
                <button className="p-2 hover:bg-muted rounded-full">
                  <User className="h-5 w-5" />
                </button>
              </Link>
              <Link to="/cart">
                <button className="p-2 hover:bg-muted rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </Link>
              <button className="p-2 hover:bg-muted rounded-full md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">
                Discover Premium Products
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Shop the latest trends from top brands. Authentic products, 
                verified quality, delivered to your door.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`} className="group">
                    <div className="aspect-square rounded-lg bg-muted mb-4 overflow-hidden">
                      {(product.thumbnail || product.images?.[0]?.url) ? (
                        <img
                          src={product.thumbnail || product.images?.[0]?.url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 group-hover:scale-105 transition-transform" />
                      )}
                    </div>
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-muted-foreground">{getPrice(product)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products?category=new">New Arrivals</Link></li>
                <li><Link to="/products?category=sale">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Help</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/shipping">Shipping</Link></li>
                <li><Link to="/returns">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2026 Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
