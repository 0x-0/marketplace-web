import { useEffect, useState, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search, Heart, ShoppingBag, Loader2, User, X } from "lucide-react"
import { productsApi } from "@/lib/api"
import { useAuthStore } from "@/lib/auth"

interface Product {
  id: string
  title: string
  handle: string
  thumbnail?: string
  images?: Array<{ id: string; url: string }>
  variants?: Array<{
    id: string
    prices?: Array<{ amount: number; currency_code: string }>
  }>
  categories?: Array<{ id: string; name: string }>
  metadata?: Record<string, unknown>
}

const GENDER_FILTERS = [
  { value: "", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
]

const SIZE_FILTERS = [
  { value: "US 6", label: "US 6" },
  { value: "US 7", label: "US 7" },
  { value: "US 8", label: "US 8" },
  { value: "US 9", label: "US 9" },
  { value: "US 10", label: "US 10" },
  { value: "US 11", label: "US 11" },
  { value: "US 12", label: "US 12" },
]

const PRICE_RANGES = [
  { value: "", label: "All Prices" },
  { value: "0-50", label: "Under $50" },
  { value: "50-100", label: "$50 - $100" },
  { value: "100-200", label: "$100 - $200" },
  { value: "200-500", label: "$200 - $500" },
  { value: "500-", label: "$500+" },
]

const BRAND_FILTERS = [
  { value: "", label: "All Brands" },
  { value: "Nike", label: "Nike" },
  { value: "Adidas", label: "Adidas" },
  { value: "PUMA", label: "PUMA" },
  { value: "New Balance", label: "New Balance" },
  { value: "Vans", label: "Vans" },
  { value: "Jordan", label: "Jordan" },
  { value: "Reebok", label: "Reebok" },
  { value: "Under Armour", label: "Under Armour" },
  { value: "ASICS", label: "ASICS" },
  { value: "Li-Ning", label: "Li-Ning" },
  { value: "ANTA", label: "ANTA" },
]

const REGION_FILTERS = [
  { value: "", label: "All Regions" },
  { value: "US", label: "US" },
  { value: "EU", label: "Europe" },
  { value: "UK", label: "UK" },
  { value: "APAC", label: "Asia Pacific" },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; handle: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const limit = 100
  const { isAuthenticated } = useAuthStore()
  const categoryParam = searchParams.get("category") || ""
  
  const genderParam = searchParams.get("gender") || ""
  const sizeParam = searchParams.get("size") || ""
  const priceParam = searchParams.get("price") || ""
  const brandParam = searchParams.get("brand") || ""
  const regionParam = searchParams.get("region") || ""

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productsApi.listCategories()
        setCategories(cats || [])
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    setOffset(0)
  }, [categoryParam, searchQuery, genderParam, sizeParam, priceParam, brandParam, regionParam])

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach((cat) => {
      map[cat.handle] = cat.id
    })
    return map
  }, [categories])

  const categoryId = categoryParam && categoryMap[categoryParam] ? categoryMap[categoryParam] : undefined

  useEffect(() => {
    const fetchProducts = async () => {
      if (categoryParam && !categoryMap[categoryParam]) return
      
      setLoading(true)
      setError(null)
      try {
        const searchTerm = searchQuery.trim() || undefined
        const data = await productsApi.list({ 
          limit, 
          offset,
          category_id: categoryId,
          q: searchTerm
        })
        setProducts(data.products || [])
        setTotal(data.count || 0)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [categoryId, searchQuery, categoryParam, categories.length, offset])

  const filteredProducts = useMemo(() => {
    let result = [...products]
    
    if (genderParam) {
      const genderLower = genderParam.toLowerCase()
      result = result.filter(p => 
        p.title?.toLowerCase().includes(genderLower) ||
        p.title?.toLowerCase().includes(genderLower === "men" ? "men's" : genderLower === "women" ? "women's" : "kids")
      )
    }
    
    if (brandParam) {
      result = result.filter(p => 
        p.title?.toLowerCase().includes(brandParam.toLowerCase()) ||
        p.metadata?.brand_name?.toString().toLowerCase().includes(brandParam.toLowerCase())
      )
    }
    
    if (priceParam) {
      const [min, max] = priceParam.split("-").map(v => v ? parseInt(v) * 100 : null)
      result = result.filter(p => {
        const price = p.variants?.[0]?.prices?.[0]?.amount || 0
        if (min !== null && price < min) return false
        if (max !== null && price > max) return false
        return true
      })
    }
    
    return result
  }, [products, genderParam, priceParam, brandParam])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = genderParam || sizeParam || priceParam || brandParam || regionParam

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
            <Link to="/" className="text-2xl font-bold">
              Marketplace
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
              <Link to="/products" className="text-sm font-medium hover:text-primary">Products</Link>
              <Link to="/orders" className="text-sm font-medium hover:text-primary">Orders</Link>
            </nav>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-full border bg-background text-sm w-64"
                />
              </div>
              <Link to="/cart">
                <button className="p-2 hover:bg-muted rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </Link>
              <Link to={isAuthenticated() ? "/account" : "/login"}>
                <button className="p-2 hover:bg-muted rounded-full">
                  <User className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 hidden lg:block flex-shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700 mb-4 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear Filters
              </button>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Gender</h3>
              <div className="space-y-2">
                {GENDER_FILTERS.map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={genderParam === filter.value}
                      onChange={() => updateFilter("gender", filter.value)}
                      className="rounded"
                    />
                    {filter.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Category</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/products" className={!categoryParam ? "font-medium text-primary" : ""}>
                    All
                  </Link>
                </li>
                {categories.slice(0, 20).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/products?category=${cat.handle}`}
                      className={categoryParam === cat.handle ? "font-medium text-primary" : ""}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceParam === filter.value}
                      onChange={() => updateFilter("price", filter.value)}
                      className="rounded"
                    />
                    {filter.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => updateFilter("size", sizeParam === filter.value ? "" : filter.value)}
                    className={`text-xs py-2 border rounded ${
                      sizeParam === filter.value ? "border-primary bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {filter.label.replace("US ", "")}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Brand</h3>
              <select
                value={brandParam}
                onChange={(e) => updateFilter("brand", e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {BRAND_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Region</h3>
              <div className="space-y-2">
                {REGION_FILTERS.map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="region"
                      checked={regionParam === filter.value}
                      onChange={() => updateFilter("region", filter.value)}
                      className="rounded"
                    />
                    {filter.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">
                  {categoryParam
                    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
                    : "Products"}
                </h1>
                <span className="text-sm text-muted-foreground">({filteredProducts.length} items)</span>
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2 border rounded-md text-sm"
              >
                Filters {hasActiveFilters && `(${["gender", "size", "price"].filter(p => searchParams.get(p)).length})`}
              </button>
            </div>

            {showMobileFilters && (
              <div className="lg:hidden mb-6 p-4 border rounded-lg">
                <div className="mb-4">
                  <h3 className="font-semibold mb-3">Gender</h3>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => updateFilter("gender", filter.value)}
                        className={`px-3 py-1 text-sm border rounded-full ${
                          genderParam === filter.value ? "border-primary bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-3">Price</h3>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => updateFilter("price", filter.value)}
                        className={`px-3 py-1 text-sm border rounded-full ${
                          priceParam === filter.value ? "border-primary bg-primary text-primary-foreground" : ""
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-3">Brand</h3>
                  <select
                    value={brandParam}
                    onChange={(e) => updateFilter("brand", e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {BRAND_FILTERS.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-12 text-red-500">{error}</div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-12">No products found</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group"
                >
                  <div className="aspect-square rounded-lg bg-muted mb-4 overflow-hidden">
                    {(product.thumbnail || product.images?.[0]?.url) ? (
                      <img
                        src={product.thumbnail || product.images?.[0]?.url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-muted-foreground">{getPrice(product)}</p>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-full">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {total > limit && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 rounded-full border disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  {offset + 1}-{Math.min(offset + limit, total)} of {total}
                </span>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 rounded-full border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
