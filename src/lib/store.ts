import { create } from "zustand"

export interface Product {
  id: string
  title: string
  description: string
  handle: string
  status: string
  thumbnail?: string
  images?: Array<{ url: string }>
  variants?: ProductVariant[]
  options?: ProductOption[]
  price?: {
    min?: number
    max?: number
  }
}

export interface ProductVariant {
  id: string
  title: string
  prices: Array<{
    amount: number
    currency_code: string
  }>
  inventory_quantity?: number
  options?: Record<string, string>
}

export interface ProductOption {
  id: string
  title: string
  values: string[]
}

export interface CartItem {
  id: string
  variantId: string
  productId: string
  title: string
  variantTitle: string
  quantity: number
  unitPrice: number
  thumbnail?: string
}

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  setProducts: (products: Product[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

interface CartStore {
  cartId: string | null
  items: CartItem[]
  subtotal: number
  loading: boolean
  setCartId: (id: string) => void
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  setItems: (items: CartItem[]) => void
  setSubtotal: (subtotal: number) => void
  setLoading: (loading: boolean) => void
  clearCart: () => void
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export const useCartStore = create<CartStore>((set) => ({
  cartId: null,
  items: [],
  subtotal: 0,
  loading: false,
  setCartId: (cartId) => set({ cartId }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (itemId) => set((state) => ({ 
    items: state.items.filter(i => i.id !== itemId) 
  })),
  updateQuantity: (itemId, quantity) => set((state) => ({
    items: state.items.map(i => 
      i.id === itemId ? { ...i, quantity } : i
    )
  })),
  setItems: (items) => set({ items }),
  setSubtotal: (subtotal) => set({ subtotal }),
  setLoading: (loading) => set({ loading }),
  clearCart: () => set({ cartId: null, items: [], subtotal: 0 }),
}))
