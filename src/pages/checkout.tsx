import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, Loader2, Check } from "lucide-react"
import axios from "axios"
import medusa from "@/lib/medusa"
import { useCartStore } from "@/lib/cart"

const MEDUSA_API_URL = import.meta.env.VITE_MEDUSA_API_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = "pk_64321fe9371433beebc364a03a788792f1d699dd523fc7c1285dd02383bc4e92"

export default function Checkout() {
  const { items, subtotal, cartId, initializeCart, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"shipping" | "payment" | "complete">("shipping")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    initializeCart()
  }, [])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100)
  }

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cartId) return

    setLoading(true)
    setError(null)
    try {
      await medusa.store.cart.update(cartId, {
        email,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          city,
          postal_code: postalCode,
          country_code: "US",
        },
      })
      setStep("payment")
    } catch (err: any) {
      console.error("Failed to update shipping:", err)
      setError(err.message || "Failed to update shipping address")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cartId) return

    setLoading(true)
    setError(null)
    try {
      // Create payment collection using axios
      const paymentColRes = await axios.post(
        `${MEDUSA_API_URL}/store/payment-collections`,
        { cart_id: cartId },
        {
          headers: {
            "x-publishable-api-key": PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      
      const paymentCollectionId = paymentColRes.data.payment_collection.id

      // Initialize payment session with system default
      await axios.post(
        `${MEDUSA_API_URL}/store/payment-collections/${paymentCollectionId}/payment-sessions`,
        { provider_id: "pp_system_default" },
        {
          headers: {
            "x-publishable-api-key": PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      
      // Complete the order
      const response = await medusa.store.cart.complete(cartId)
      
      if (response.type === "order" && response.order) {
        setOrderId(response.order.id)
        setStep("complete")
        clearCart()
      } else {
        setError("Please complete payment")
      }
    } catch (err: any) {
      console.error("Failed to complete order:", err)
      setError(err.response?.data?.message || err.message || "Failed to complete order")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step !== "complete") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="text-2xl font-bold">
              Marketplace
            </Link>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/products" className="text-primary hover:underline">
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="text-2xl font-bold">
              Marketplace
            </Link>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your order.
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mb-6">
                Order ID: {orderId}
              </p>
            )}
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-2xl font-bold">
            Marketplace
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-primary text-primary-foreground" : "bg-green-600 text-white"}`}>
                  1
                </div>
                <span className={step === "shipping" ? "font-medium" : "text-muted-foreground"}>Shipping</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  2
                </div>
                <span className={step === "payment" ? "font-medium" : "text-muted-foreground"}>Payment</span>
              </div>
            </div>

            {step === "shipping" && (
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-md border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-md border"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-md border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-md border"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Continue to Payment"}
                </button>
              </form>
            )}

            {step === "payment" && (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Demo mode: No actual payment will be processed.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Place Order"}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.title} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
