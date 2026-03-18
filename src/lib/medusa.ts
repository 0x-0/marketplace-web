import Medusa from "@medusajs/js-sdk"

const MEDUSA_API_URL = import.meta.env.VITE_MEDUSA_API_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = "pk_64321fe9371433beebc364a03a788792f1d699dd523fc7c1285dd02383bc4e92"

let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

export const getAuthToken = () => authToken

const originalFetch = window.fetch

const authFetch: typeof originalFetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url
  
  if (url.includes('/store/') || url.includes('/auth/')) {
    if (authToken && !url.includes('/auth/customer/emailpass')) {
      const headers = new Headers(init?.headers)
      headers.set("Authorization", `Bearer ${authToken}`)
      init = {
        ...init,
        headers,
      }
    }
  }
  
  return originalFetch(url, init)
}

export const medusa = new (Medusa as any)({
  baseUrl: MEDUSA_API_URL,
  debug: import.meta.env.DEV,
  publishableKey: PUBLISHABLE_KEY,
  fetch: authFetch,
})

export default medusa
