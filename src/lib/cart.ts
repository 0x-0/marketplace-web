import { create } from "zustand"
import { persist } from "zustand/middleware"
import medusa from "./medusa"

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

interface CartStore {
  cartId: string | null
  items: CartItem[]
  subtotal: number
  loading: boolean
  initialized: boolean
  
  initializeCart: () => Promise<void>
  addItem: (variantId: string, quantity: number, productInfo: any) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      subtotal: 0,
      loading: false,
      initialized: false,

      initializeCart: async () => {
        const { cartId, initialized } = get()
        if (initialized) return

        set({ loading: true })
        
        try {
          let currentCartId = cartId

          if (!currentCartId) {
            const response = await medusa.store.cart.create({
              region_id: "region_us",
              sales_channel_id: "sc_01KKVKMH0AZ44NCQWRXB12VA2E",
            })
            currentCartId = response.cart.id
            set({ cartId: currentCartId })
          }

          const response = await medusa.store.cart.retrieve(currentCartId, {
            fields: "*items,*items.variant,*items.variant.product,*items.variant.product.images",
          })
          const cart = response.cart

          if (cart.items && cart.items.length > 0) {
            const items: CartItem[] = cart.items.map((item: any) => {
              // Try to get thumbnail from variant -> product -> images
              let thumbnail = item.thumbnail
              if (!thumbnail && item.variant?.product?.images?.length > 0) {
                thumbnail = item.variant.product.images[0].url
              }
              if (!thumbnail && item.variant?.product?.thumbnail) {
                thumbnail = item.variant.product.thumbnail
              }
              return {
                id: item.id,
                variantId: item.variant_id || "",
                productId: item.product_id || "",
                title: item.title || "",
                variantTitle: item.variant?.title || "",
                quantity: item.quantity || 1,
                unitPrice: item.unit_price || 0,
                thumbnail,
              }
            })

            const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            set({ items, subtotal })
          }

          set({ initialized: true })
        } catch (error) {
          console.error("Failed to initialize cart:", error)
        } finally {
          set({ loading: false })
        }
      },

      addItem: async (variantId: string, quantity: number, productInfo: any) => {
        const { cartId } = get()
        
        if (!cartId) {
          await get().initializeCart()
        }

        const currentCartId = get().cartId
        if (!currentCartId) return

        set({ loading: true })

        try {
          // Use the correct SDK method
          const response = await medusa.store.cart.createLineItem(currentCartId, {
            variant_id: variantId,
            quantity,
          })

          const cart = response.cart
          if (cart.items) {
            const newItems: CartItem[] = cart.items.map((item: any) => {
              let thumbnail = item.thumbnail
              if (!thumbnail && item.variant?.product?.images?.length > 0) {
                thumbnail = item.variant.product.images[0].url
              }
              if (!thumbnail && item.variant?.product?.thumbnail) {
                thumbnail = item.variant.product.thumbnail
              }
              return {
                id: item.id,
                variantId: item.variant_id || "",
                productId: item.product_id || "",
                title: item.title || "",
                variantTitle: item.variant?.title || "",
                quantity: item.quantity || 1,
                unitPrice: item.unit_price || 0,
                thumbnail,
              }
            })

            const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            set({ items: newItems, subtotal })
          }
        } catch (error) {
          console.error("Failed to add item:", error)
          throw error
        } finally {
          set({ loading: false })
        }
      },

      removeItem: async (lineItemId: string) => {
        const { cartId } = get()
        if (!cartId) return

        set({ loading: true })

        try {
          await medusa.store.cart.deleteLineItem(cartId, lineItemId)

          const response = await medusa.store.cart.retrieve(cartId, {
            fields: "*items,*items.variant,*items.variant.product,*items.variant.product.images",
          })
          const cart = response.cart

          if (cart.items) {
            const newItems: CartItem[] = cart.items.map((item: any) => {
              let thumbnail = item.thumbnail
              if (!thumbnail && item.variant?.product?.images?.length > 0) {
                thumbnail = item.variant.product.images[0].url
              }
              return {
                id: item.id,
                variantId: item.variant_id || "",
                productId: item.product_id || "",
                title: item.title || "",
                variantTitle: item.variant?.title || "",
                quantity: item.quantity || 1,
                unitPrice: item.unit_price || 0,
                thumbnail,
              }
            })

            const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            set({ items: newItems, subtotal })
          } else {
            set({ items: [], subtotal: 0 })
          }
        } catch (error) {
          console.error("Failed to remove item:", error)
        } finally {
          set({ loading: false })
        }
      },

      updateQuantity: async (lineItemId: string, quantity: number) => {
        const { cartId } = get()
        if (!cartId) return

        if (quantity <= 0) {
          await get().removeItem(lineItemId)
          return
        }

        set({ loading: true })

        try {
          const response = await medusa.store.cart.updateLineItem(cartId, lineItemId, {
            quantity,
          })

          const cart = response.cart
          if (cart.items) {
            const newItems: CartItem[] = cart.items.map((item: any) => {
              let thumbnail = item.thumbnail
              if (!thumbnail && item.variant?.product?.images?.length > 0) {
                thumbnail = item.variant.product.images[0].url
              }
              return {
                id: item.id,
                variantId: item.variant_id || "",
                productId: item.product_id || "",
                title: item.title || "",
                variantTitle: item.variant?.title || "",
                quantity: item.quantity || 1,
                unitPrice: item.unit_price || 0,
                thumbnail,
              }
            })

            const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
            set({ items: newItems, subtotal })
          }
        } catch (error) {
          console.error("Failed to update quantity:", error)
        } finally {
          set({ loading: false })
        }
      },

      clearCart: () => {
        set({ cartId: null, items: [], subtotal: 0, initialized: false })
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
)
