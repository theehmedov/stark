"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signUp } from "./actions"
import { Zap, ArrowRight, Mail, Lock, User, Rocket, Users, Building2, UserCircle } from "lucide-react"
import type { UserRole } from "@/lib/types/database.types"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<UserRole>("startup")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const result = await signUp(email, password, fullName, role)

      if (result.success) {
        setError("")
        alert("Registration successful! Please check your email to verify your account.")
        router.push("/login")
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-subtle gradient-mesh relative overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-navy-100/20 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gold-200/15 blur-3xl animate-float-delayed pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-navy-600/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Stark</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-500">Join the Innovation Ecosystem today</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200/60 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">I am a...</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("startup")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === "startup"
                      ? "border-navy-500 bg-navy-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === "startup" ? "bg-navy-100" : "bg-slate-100"
                  }`}>
                    <Rocket className={`w-5 h-5 ${role === "startup" ? "text-navy-600" : "text-slate-500"}`} />
                  </div>
                  <span className={`text-xs font-semibold ${role === "startup" ? "text-navy-700" : "text-slate-600"}`}>
                    Startup
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("investor")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === "investor"
                      ? "border-gold-500 bg-gold-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === "investor" ? "bg-gold-100" : "bg-slate-100"
                  }`}>
                    <Users className={`w-5 h-5 ${role === "investor" ? "text-gold-600" : "text-slate-500"}`} />
                  </div>
                  <span className={`text-xs font-semibold ${role === "investor" ? "text-gold-700" : "text-slate-600"}`}>
                    Investor
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("it_company")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === "it_company"
                      ? "border-navy-400 bg-navy-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === "it_company" ? "bg-navy-100" : "bg-slate-100"
                  }`}>
                    <Building2 className={`w-5 h-5 ${role === "it_company" ? "text-navy-500" : "text-slate-500"}`} />
                  </div>
                  <span className={`text-xs font-semibold ${role === "it_company" ? "text-navy-600" : "text-slate-600"}`}>
                    IT Company
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("individual")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    role === "individual"
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    role === "individual" ? "bg-emerald-100" : "bg-slate-100"
                  }`}>
                    <UserCircle className={`w-5 h-5 ${role === "individual" ? "text-emerald-600" : "text-slate-500"}`} />
                  </div>
                  <span className={`text-xs font-semibold ${role === "individual" ? "text-emerald-700" : "text-slate-600"}`}>
                    Individual
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200/60 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-navy-600 hover:text-gold-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
