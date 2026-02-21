import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Zap, AlertTriangle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[DASHBOARD PAGE] user:", user?.id ?? "none")

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  console.log("[DASHBOARD PAGE] profile:", profile, "error:", profileError?.message ?? "none")

  // If profile exists, redirect to the correct role dashboard
  if (profile) {
    switch (profile.role) {
      case "admin":
        redirect("/dashboard/admin")
      case "startup":
        redirect("/dashboard/startup")
      case "investor":
        redirect("/dashboard/investor")
      case "it_company":
        redirect("/dashboard/it-company")
      case "individual":
        redirect("/dashboard/individual")
    }
  }

  // Profile fetch failed (RLS error, missing profile, etc.)
  // Show a fallback UI instead of redirect-looping to /login
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-50 mb-6">
          <AlertTriangle className="w-8 h-8 text-gold-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Profile Setup Required</h1>
        <p className="text-slate-500 mb-2">
          We couldn&apos;t load your profile. This usually means your profile hasn&apos;t been fully set up yet.
        </p>
        {profileError && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg p-3 mb-4 font-mono">
            DB Error: {profileError.message} ({profileError.code})
          </p>
        )}
        <p className="text-sm text-slate-400 mb-6">
          User ID: <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{user.id}</code>
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-600 text-white text-sm font-semibold hover:bg-navy-500 transition-colors"
          >
            <Zap className="w-4 h-4" /> Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}
