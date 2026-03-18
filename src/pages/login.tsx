import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth"

export default function Login() {
  const navigate = useNavigate()
  const { login, register, loading, setLoading } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isRegister, setIsRegister] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isRegister) {
        await register(email, password, firstName, lastName)
      } else {
        await login(email, password)
      }
      navigate("/orders")
    } catch (err: any) {
      console.error("Auth error:", err)
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8 bg-background rounded-lg border shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold">
            Marketplace
          </Link>
          <h1 className="text-xl mt-4">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isRegister 
              ? "Sign up to start shopping" 
              : "Sign in to your account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border"
                />
              </div>
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md border"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : isRegister ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-primary hover:underline"
              >
                Create one
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
