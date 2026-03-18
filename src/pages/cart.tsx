import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingBag, Trash2, ChevronLeft, Loader2 } from "lucide-react"
import { useCartStore } from "@/lib/cart"

export default function Cart() {
  const navigate = useNavigate()
  const { items, subtotal, loading, initializeCart, removeItem, updateQuantity, clearCart } = useCartStore()

  useEffect(() => {
    initializeCart()
  }, [])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100)
  }

  const handleCheckout = async () => {
    navigate("/checkout")
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
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

        {loading && items.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                    <p className="font-medium mt-1">{formatPrice(item.unitPrice)}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-muted rounded-full"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 sticky top-4">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={loading || items.length === 0}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
