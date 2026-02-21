import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Building2, Rocket, Handshake, TrendingUp, ArrowUpRight, ArrowRight, Wrench, Search, BarChart3 } from "lucide-react"

export default async function ITCompanyDashboard() {
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

  // Check if IT company record exists — if not, redirect to setup
  const { data: itCompany } = await supabase
    .from("it_companies")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!itCompany) {
    redirect("/dashboard/it-company/setup")
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Welcome back, {profile?.full_name?.split(" ")[0]}
        </h2>
        <p className="text-slate-500">Connect with startups and offer your technology solutions</p>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bento-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-navy-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">0</div>
          <p className="text-sm text-slate-500 font-medium">Partnerships</p>
          <p className="text-xs text-slate-400 mt-1">Active partnerships</p>
        </div>

        <div className="bento-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gold-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">0</div>
          <p className="text-sm text-slate-500 font-medium">Leads</p>
          <p className="text-xs text-slate-400 mt-1">Potential clients</p>
        </div>

        <div className="bento-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-navy-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">0</div>
          <p className="text-sm text-slate-500 font-medium">Projects</p>
          <p className="text-xs text-slate-400 mt-1">Ongoing projects</p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Opportunities */}
        <div className="lg:col-span-2 bento-card flex flex-col">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900">Partnership Opportunities</h3>
            <p className="text-sm text-slate-500 mt-0.5">Startups looking for tech partners</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center mb-4">
              <Rocket className="w-7 h-7 text-navy-200" />
            </div>
            <p className="text-sm font-medium text-slate-400">No opportunities yet</p>
            <p className="text-xs text-slate-400 mt-1">New partnership requests will appear here</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 bento-card">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
            <p className="text-sm text-slate-500 mt-0.5">Manage your company profile and services</p>
          </div>
          <div className="space-y-3">
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-navy-50/50 cursor-pointer transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">Update Services</h4>
                <p className="text-xs text-slate-500 mt-0.5">Showcase your technology solutions and expertise</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-gold-50/50 cursor-pointer transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-gold-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">Browse Startups</h4>
                <p className="text-xs text-slate-500 mt-0.5">Find startups that need your services</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-gold-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-navy-50/50 cursor-pointer transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-navy-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">View Analytics</h4>
                <p className="text-xs text-slate-500 mt-0.5">Track engagement and partnership metrics</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-navy-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
