import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function IndividualDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("sub_role, approval_status")
    .eq("id", user.id)
    .single()

  console.log("[INDIVIDUAL] profile:", profile)

  // If no sub_role set yet, redirect to setup
  if (!profile?.sub_role) {
    redirect("/dashboard/individual/setup")
  }

  // If pending approval, show pending page
  if (profile.approval_status === "pending") {
    redirect("/dashboard/individual/pending")
  }

  // If rejected, show pending page with rejection info
  if (profile.approval_status === "rejected") {
    redirect("/dashboard/individual/pending")
  }

  // Approved — show the individual dashboard
  return (
    <div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
        Welcome, {profile.sub_role === "mentor" ? "Mentor" : "Jury Member"}!
      </h2>
      <p className="text-slate-500 mb-8">
        Your account has been approved. You can now participate in hackathons.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-200/40">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Your Hackathons</h3>
          <p className="text-sm text-slate-500">Hackathons you&apos;ve been assigned to will appear here.</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-200/40">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Your Profile</h3>
          <p className="text-sm text-slate-500">
            Role: <span className="font-semibold capitalize">{profile.sub_role}</span>
          </p>
          <p className="text-sm text-slate-500">
            Status: <span className="font-semibold text-emerald-600">Approved</span>
          </p>
        </div>
      </div>
    </div>
  )
}
