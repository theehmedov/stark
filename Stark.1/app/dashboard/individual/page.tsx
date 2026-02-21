import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

      {profile.sub_role === "jury" && (
        <div className="glass rounded-2xl p-6 border border-amber-200/60 bg-amber-50/40 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Jury Workspace</h3>
              <p className="text-sm text-slate-600 mt-1">
                Open your judging dashboard to evaluate startups.
              </p>
            </div>
            <Link href="/dashboard/judge">
              <Button className="w-full md:w-auto">Go to Judge Dashboard</Button>
            </Link>
          </div>
        </div>
      )}

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
