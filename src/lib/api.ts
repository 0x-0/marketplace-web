import medusa from "./medusa"

export interface MedusaProduct {
  id: string
  title: string
  description: string
  handle: string
  status: string
  thumbnail?: string
  images?: Array<{ url: string }>
  variants?: MedusaVariant[]
  options?: MedusaOption[]
}

export interface MedusaVariant {
  id: string
  title: string
  prices: Array<{
    amount: number
    currency_code: string
  }>
  inventory_quantity?: number
}

export interface MedusaOption {
  id: string
  title: string
  values: Array<{ value: string }>
}

export const productsApi = {
  list: async (params?: {
    limit?: number
    offset?: number
    category_id?: string
    q?: string
  }) => {
    const response = await medusa.store.product.list({
      ...params,
      fields: "title,*variants,*variants.prices,*images,*categories,thumbnail",
    })
    return { products: response.products, count: response.count || 0 }
  },

  retrieve: async (id: string) => {
    const response = await medusa.store.product.list({
      id: [id],
      limit: 1,
      fields: "title,description,handle,*variants,*variants.prices,*images,thumbnail",
    })
    return response.products[0] || null
  },

  listCategories: async () => {
    const response = await medusa.store.category.list({ limit: 300 })
    return response.product_categories
  },
}

export const cartApi = {
  create: async () => {
    const response = await medusa.store.cart.create()
    return response.cart
  },

  retrieve: async (cartId: string) => {
    const response = await medusa.store.cart.retrieve(cartId)
    return response.cart
  },

  addLineItem: async (cartId: string, variantId: string, quantity: number) => {
    const response = await medusa.store.cart.lineItem.create(cartId, {
      variant_id: variantId,
      quantity,
    })
    return response.cart
  },

  updateLineItem: async (cartId: string, lineItemId: string, quantity: number) => {
    const response = await medusa.store.cart.lineItem.update(cartId, lineItemId, {
      quantity,
    })
    return response.cart
  },

  deleteLineItem: async (cartId: string, lineItemId: string) => {
    const response = await medusa.store.cart.lineItem.delete(cartId, lineItemId)
    return response
  },

  complete: async (cartId: string) => {
    const response = await medusa.store.cart.complete(cartId)
    return response
  },
}

export const regionsApi = {
  list: async () => {
    const response = await medusa.store.region.list()
    return response.regions
  },
}
