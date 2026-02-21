import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Rocket, Building2, Users, Layers, Wrench, Globe, Search, Inbox } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ExploreTabsClient from "./explore-tabs"

interface StartupRow {
  id: string
  user_id: string
  company_name: string
  industry: string
  stage: string
  team_size: number
  pitch_deck_url: string | null
  profiles: { full_name: string } | null
}

interface ITCompanyRow {
  id: string
  user_id: string
  company_name: string
  voen: string
  residency_status: string
  main_service: string
  profiles: { full_name: string } | null
}

const stageLabels: Record<string, string> = {
  idea: "Idea",
  mvp: "MVP",
  pre_seed: "Pre-Seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B+",
  growth: "Growth",
}

const stageColors: Record<string, string> = {
  idea: "bg-slate-100 text-slate-600 border-slate-200",
  mvp: "bg-blue-50 text-blue-600 border-blue-200",
  pre_seed: "bg-violet-50 text-violet-600 border-violet-200",
  seed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  series_a: "bg-gold-50 text-gold-700 border-gold-200",
  series_b: "bg-orange-50 text-orange-600 border-orange-200",
  growth: "bg-navy-50 text-navy-600 border-navy-200",
}

const residencyLabels: Record<string, string> = {
  local: "Local",
  resident: "Tech Park Resident",
  international: "International",
}

export default async function ExplorePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Fetch startups — try with profile join first, fall back to plain fetch
  let startupList: StartupRow[] = []
  {
    const { data, error } = await supabase
      .from("startups")
      .select("*, profiles!startups_profile_id_fkey(full_name)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[EXPLORE] Startups join fetch error:", error.message, "— falling back to plain fetch")
      // Fallback: fetch without join
      const { data: plain, error: plainErr } = await supabase
        .from("startups")
        .select("*")
        .order("created_at", { ascending: false })
      if (plainErr) console.error("[EXPLORE] Startups plain fetch error:", plainErr.message)
      startupList = ((plain ?? []) as any[]).map((s) => ({ ...s, profiles: null }))
    } else {
      startupList = (data ?? []) as StartupRow[]
    }
  }

  // Fetch IT companies — try with profile join first, fall back to plain fetch
  let itCompanyList: ITCompanyRow[] = []
  {
    const { data, error } = await supabase
      .from("it_companies")
      .select("*, profiles!it_companies_profile_id_fkey(full_name)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[EXPLORE] IT Companies join fetch error:", error.message, "— falling back to plain fetch")
      const { data: plain, error: plainErr } = await supabase
        .from("it_companies")
        .select("*")
        .order("created_at", { ascending: false })
      if (plainErr) console.error("[EXPLORE] IT Companies plain fetch error:", plainErr.message)
      itCompanyList = ((plain ?? []) as any[]).map((c) => ({ ...c, profiles: null }))
    } else {
      itCompanyList = (data ?? []) as ITCompanyRow[]
    }
  }

  const startupCards = (
    <>
      {startupList.length === 0 ? (
        <EmptyState icon={<Rocket className="w-8 h-8 text-slate-300" />} message="No startups found yet" sub="Be the first to register your startup!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {startupList.map((s) => (
            <Card key={s.id} className="group hover:shadow-lg hover:border-navy-200/60 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5 text-navy-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                        {s.company_name}
                      </CardTitle>
                      {s.profiles && (
                        <p className="text-xs text-slate-400 mt-0.5">{s.profiles.full_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs font-medium bg-navy-50/50 text-navy-600 border-navy-200/60">
                    {s.industry}
                  </Badge>
                  <Badge variant="outline" className={`text-xs font-medium ${stageColors[s.stage] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {stageLabels[s.stage] || s.stage}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {s.team_size} {s.team_size === 1 ? "member" : "members"}
                  </span>
                  {s.pitch_deck_url && (
                    <a
                      href={s.pitch_deck_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-navy-500 hover:text-navy-700 font-medium transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Pitch Deck
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )

  const itCompanyCards = (
    <>
      {itCompanyList.length === 0 ? (
        <EmptyState icon={<Building2 className="w-8 h-8 text-slate-300" />} message="No IT companies found yet" sub="Be the first to register your company!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {itCompanyList.map((c) => (
            <Card key={c.id} className="group hover:shadow-lg hover:border-gold-200/60 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                        {c.company_name}
                      </CardTitle>
                      {c.profiles && (
                        <p className="text-xs text-slate-400 mt-0.5">{c.profiles.full_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs font-medium bg-gold-50/50 text-gold-700 border-gold-200/60">
                    <Wrench className="w-3 h-3 mr-1" />
                    {c.main_service}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-medium bg-slate-50 text-slate-600 border-slate-200">
                    <Globe className="w-3 h-3 mr-1" />
                    {residencyLabels[c.residency_status] || c.residency_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Search className="w-6 h-6 text-navy-500" />
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Explore Directory
          </h2>
        </div>
        <p className="text-slate-500 ml-9">
          Discover startups and IT companies in the ecosystem
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-slate-200/40">
          <Rocket className="w-4 h-4 text-navy-500" />
          <span className="text-sm font-semibold text-slate-700">{startupList.length}</span>
          <span className="text-sm text-slate-400">Startups</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-slate-200/40">
          <Building2 className="w-4 h-4 text-gold-600" />
          <span className="text-sm font-semibold text-slate-700">{itCompanyList.length}</span>
          <span className="text-sm text-slate-400">IT Companies</span>
        </div>
      </div>

      {/* Tabs */}
      <ExploreTabsClient
        startupCards={startupCards}
        itCompanyCards={itCompanyCards}
        startupCount={startupList.length}
        itCompanyCount={itCompanyList.length}
      />
    </div>
  )
}

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-lg font-semibold text-slate-400 mb-1">{message}</p>
      <p className="text-sm text-slate-300">{sub}</p>
    </div>
  )
}
