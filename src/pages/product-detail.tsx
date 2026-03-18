import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingBag, ChevronLeft, Loader2 } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useCartStore } from "@/lib/cart"

interface ProductImage {
  id: string
  url: string
}

interface Variant {
  id: string
  title: string
  prices?: Array<{ amount: number; currency_code: string }>
}

interface Product {
  id: string
  title: string
  description: string
  handle: string
  thumbnail?: string
  images?: ProductImage[]
  variants?: Variant[]
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  
  const { addItem, initializeCart } = useCartStore()

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const data = await productsApi.retrieve(id)
        setProduct(data)
        if (data.variants?.length) {
          setSelectedVariant(data.variants[0])
        }
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const formatPrice = (amount: number | undefined, currency: string = "usd") => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const getPrice = () => {
    if (!selectedVariant) return "N/A"
    const price = selectedVariant.prices?.[0]
    return formatPrice(price?.amount, price?.currency_code)
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    
    setAdding(true)
    try {
      await initializeCart()
      await addItem(selectedVariant.id, quantity, {
        title: product?.title,
        variantTitle: selectedVariant.title,
        images: product?.images,
      })
      navigate("/cart")
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Product not found"}</p>
          <Link to="/products" className="text-primary hover:underline">
            Back to Products
          </Link>
        </div>
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
            <Link to="/cart">
              <button className="p-2 hover:bg-muted rounded-full">
                <ShoppingBag className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg bg-muted overflow-hidden">
              <img
                src={product.images?.[0]?.url || product.thumbnail || "https://via.placeholder.com/600"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {(product.images?.length ?? 0) > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images?.map((img) => (
                  <div key={img.id} className="aspect-square rounded-lg bg-muted overflow-hidden">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            <p className="text-2xl font-bold mb-6">{getPrice()}</p>

            <div className="mb-6">
              <h3 className="font-medium mb-3">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-full border text-sm ${
                      selectedVariant?.id === variant.id ? "border-primary bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant}
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <button className="p-3 rounded-full border">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 pt-8 border-t">
              <h3 className="font-medium mb-3">Description</h3>
              <p className="text-muted-foreground">{product.description || "No description available"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
