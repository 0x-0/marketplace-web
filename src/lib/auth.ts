import { create } from "zustand"
import { persist } from "zustand/middleware"
import medusa, { setAuthToken } from "./medusa"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  loading: boolean
  setLoading: (loading: boolean) => void
  
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      setLoading: (loading: boolean) => set({ loading }),

      login: async (email: string, password: string) => {
        set({ loading: true })
        try {
          const result = await medusa.auth.login(
            "customer",
            "emailpass",
            { email, password }
          )
          
          if (typeof result !== "string") {
            throw new Error("Authentication requires additional steps")
          }
          
          setAuthToken(result)
          
          const customerResponse = await medusa.store.customer.retrieve()
          
          set({ 
            user: { 
              id: customerResponse.customer.id, 
              email: customerResponse.customer.email,
              firstName: customerResponse.customer.first_name,
              lastName: customerResponse.customer.last_name,
            },
            token: result,
            loading: false 
          })
        } catch (error: any) {
          set({ loading: false })
          throw new Error(error.message || "Login failed")
        }
      },

      register: async (email: string, _password: string, firstName?: string, lastName?: string) => {
        set({ loading: true })
        try {
          const token = await medusa.auth.register(
            "customer",
            "emailpass",
            { email, password: _password }
          )
          
          const tokenStr = typeof token === "string" ? token : "registered"
          setAuthToken(tokenStr)
          
          const response = await medusa.store.customer.create({
            email,
            first_name: firstName,
            last_name: lastName,
          })
          
          set({ 
            user: { 
              id: response.customer.id, 
              email,
              firstName,
              lastName,
            },
            token: tokenStr,
            loading: false 
          })
        } catch (error: any) {
          set({ loading: false })
          throw new Error(error.message || "Registration failed")
        }
      },

      logout: () => {
        setAuthToken(null)
        medusa.auth.logout().catch(() => {})
        set({ user: null, token: null })
      },

      isAuthenticated: () => {
        return !!get().token
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
)
