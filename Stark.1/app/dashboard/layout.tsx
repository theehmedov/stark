import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LogOut, Zap, Shield, Rocket, Users, Building2, Compass, UserCircle, Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[DASHBOARD LAYOUT] user:", user?.id ?? "none")

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  console.log("[DASHBOARD LAYOUT] profile:", profile?.role ?? "null", "error:", profileError?.message ?? "none")

  async function signOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
  }

  const getRoleLabel = () => {
    switch (profile?.role) {
      case "admin": return "Administrator"
      case "startup": return "Startup"
      case "investor": return "Investor"
      case "it_company": return "IT Company"
      case "individual": return profile?.sub_role === "jury" ? "Jury" : profile?.sub_role === "mentor" ? "Mentor" : "Individual"
      default: return "User"
    }
  }

  const getRoleColor = () => {
    switch (profile?.role) {
      case "admin": return "bg-gold-50 text-gold-700 border-gold-200"
      case "startup": return "bg-navy-50 text-navy-600 border-navy-200"
      case "investor": return "bg-gold-50 text-gold-700 border-gold-200"
      case "it_company": return "bg-navy-50 text-navy-500 border-navy-200"
      case "individual": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="min-h-screen gradient-subtle gradient-mesh">
      {/* Glassmorphism Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Stark</span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${getRoleColor()}`}>
              {getRoleLabel()}
            </span>
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <Link
              href="/dashboard/explore"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-600 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>

            {profile?.role === "individual" && profile?.sub_role === "jury" && (
              <Link
                href="/dashboard/judge"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-600 transition-colors"
              >
                <Gavel className="w-4 h-4" />
                Judging
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{profile?.full_name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="text-slate-500 hover:text-red-600">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
