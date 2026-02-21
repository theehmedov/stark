import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Rocket, Users, TrendingUp, ArrowUpRight, ArrowRight, Zap, UserPlus, Building2 } from "lucide-react"

export default async function StartupDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if startup record exists — if not, redirect to setup
  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!startup) {
    redirect("/dashboard/startup/setup")
  }

  const startupId = profile?.startup_id || null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Welcome back, {profile?.full_name?.split(" ")[0]}
        </h2>
        <p className="text-slate-500">Manage your startup profile and connect with investors</p>
        {startupId && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-navy-50 border border-navy-200 px-3 py-1">
            <span className="text-xs font-semibold text-navy-700">ID: {startupId}</span>
          </div>
        )}
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bento-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-navy-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">0</div>
          <p className="text-sm text-slate-500 font-medium">Profile Views</p>
          <p className="text-xs text-slate-400 mt-1">This month</p>
        </div>

        <div className="bento-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-gold-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">0</div>
          <p className="text-sm text-slate-500 font-medium">Connections</p>
          <p className="text-xs text-slate-400 mt-1">Active connections</p>
        </div>

        <div className="bento-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-navy-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">0</div>
          <p className="text-sm text-slate-500 font-medium">Opportunities</p>
          <p className="text-xs text-slate-400 mt-1">Available now</p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick Actions — wider */}
        <div className="lg:col-span-3 bento-card">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            <p className="text-sm text-slate-500 mt-0.5">Get started with your startup profile</p>
          </div>
          <div className="space-y-3">
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-navy-50/50 cursor-pointer transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">Complete Your Profile</h4>
                <p className="text-xs text-slate-500 mt-0.5">Add details about your startup to attract investors</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-gold-50/50 cursor-pointer transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-gold-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">Browse Investors</h4>
                <p className="text-xs text-slate-500 mt-0.5">Find investors interested in your industry</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-gold-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-navy-50/50 cursor-pointer transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-navy-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">Connect with IT Companies</h4>
                <p className="text-xs text-slate-500 mt-0.5">Partner with technology providers</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>

        {/* Recent Activity — narrower */}
        <div className="lg:col-span-2 bento-card flex flex-col">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <p className="text-sm text-slate-500 mt-0.5">Your latest interactions</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Rocket className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">No recent activity</p>
            <p className="text-xs text-slate-400 mt-1">Start connecting with the ecosystem!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
