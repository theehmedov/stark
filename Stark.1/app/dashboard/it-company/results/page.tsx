"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Medal, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Hackathon = {
  id: string
  title: string
  event_date: string | null
  location: string | null
}

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  website: string | null
}

type Application = {
  id: string
  hackathon_id: string
  startup_id: string
}

type EvaluationRow = {
  id?: string
  hackathon_id: string
  startup_id: string
  judge_id: string
  score_teamwork: number | null
  score_idea: number | null
  score_code: number | null
  score_business: number | null
}

type StartupResult = {
  startup_id: string
  startup_name: string
  startup_avatar_url: string | null
  startup_website: string | null
  average: number
  evaluations: EvaluationRow[]
}

function hasJudgeVoted(e: EvaluationRow) {
  return (
    typeof e.score_teamwork === "number" ||
    typeof e.score_idea === "number" ||
    typeof e.score_code === "number" ||
    typeof e.score_business === "number"
  )
}

function averageOfNumbers(values: Array<number | null | undefined>) {
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 10) return 10
  return value
}

function calcEvaluationAverage(e: Pick<EvaluationRow, "score_teamwork" | "score_idea" | "score_code" | "score_business">) {
  const values = [e.score_teamwork, e.score_idea, e.score_code, e.score_business].map((v) =>
    typeof v === "number" ? clampScore(v) : 0
  )
  const sum = values.reduce((acc, v) => acc + v, 0)
  return sum / 4
}

function formatScore(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00"
}

export default function ITCompanyResultsPage() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [roleAllowed, setRoleAllowed] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)

  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null)

  const [results, setResults] = useState<StartupResult[]>([])
  const [judgeNames, setJudgeNames] = useState<Record<string, string>>({})
  const [assignedJudgeCount, setAssignedJudgeCount] = useState(0)

  const [detailsStartupId, setDetailsStartupId] = useState<string | null>(null)
  const [animateIn, setAnimateIn] = useState(false)

  const selectedHackathon = useMemo(
    () => hackathons.find((h) => h.id === selectedHackathonId) ?? null,
    [hackathons, selectedHackathonId]
  )

  const detailsStartup = useMemo(
    () => (detailsStartupId ? results.find((r) => r.startup_id === detailsStartupId) ?? null : null),
    [detailsStartupId, results]
  )

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      setLoading(true)
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        setError("Not authenticated")
        setLoading(false)
        return
      }

      setCompanyId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (cancelled) return

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (profile?.role !== "it_company") {
        setRoleAllowed(false)
        setLoading(false)
        return
      }

      setRoleAllowed(true)

      const { data: hackathonData, error: hackathonError } = await supabase
        .from("hackathons")
        .select("id, title, event_date, location")
        .eq("company_id", user.id)
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (hackathonError) {
        setError(hackathonError.message)
        setHackathons([])
        setLoading(false)
        return
      }

      const list = (hackathonData ?? []) as Hackathon[]
      setHackathons(list)
      setSelectedHackathonId((prev) => prev ?? list[0]?.id ?? null)
      setLoading(false)
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadLeaderboard = async () => {
      if (!roleAllowed) return
      if (!selectedHackathonId) {
        setResults([])
        setJudgeNames({})
        setAssignedJudgeCount(0)
        setDetailsStartupId(null)
        return
      }

      setLoading(true)
      setError(null)

      const { data: appsData, error: appsError } = await supabase
        .from("hackathon_applications")
        .select("id, hackathon_id, startup_id")
        .eq("hackathon_id", selectedHackathonId)

      if (cancelled) return

      if (appsError) {
        setError(appsError.message)
        setResults([])
        setLoading(false)
        return
      }

      const applications = (appsData ?? []) as Application[]
      const startupIds = Array.from(new Set(applications.map((a) => a.startup_id).filter(Boolean)))

      if (startupIds.length === 0) {
        setResults([])
        setJudgeNames({})
        setDetailsStartupId(null)
        setLoading(false)
        return
      }

      const [
        { data: startupProfiles, error: startupProfilesError },
        { data: evalsData, error: evalsError },
        { data: assignedJudges, error: assignedJudgesError },
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url, website").in("id", startupIds),
        supabase
          .from("evaluations")
          .select("id, hackathon_id, startup_id, judge_id, score_teamwork, score_idea, score_code, score_business")
          .eq("hackathon_id", selectedHackathonId)
          .in("startup_id", startupIds),
        supabase.from("hackathon_judges").select("judge_id").eq("hackathon_id", selectedHackathonId),
      ])

      if (cancelled) return

      if (startupProfilesError) {
        setError(startupProfilesError.message)
        setResults([])
        setLoading(false)
        return
      }

      if (evalsError) {
        setError(evalsError.message)
        setResults([])
        setLoading(false)
        return
      }

      if (assignedJudgesError) {
        setError(assignedJudgesError.message)
        setResults([])
        setLoading(false)
        return
      }

      const startupsById = new Map<string, Profile>()
      ;((startupProfiles ?? []) as Profile[]).forEach((p) => startupsById.set(p.id, p))

      const evals = (evalsData ?? []) as EvaluationRow[]

      const assignedJudgeIds = Array.from(new Set(((assignedJudges ?? []) as any[]).map((j) => j.judge_id).filter(Boolean))) as string[]
      const totalAssigned = assignedJudgeIds.length
      setAssignedJudgeCount(totalAssigned)

      const evalsByStartup = new Map<string, EvaluationRow[]>()
      for (const e of evals) {
        if (!evalsByStartup.has(e.startup_id)) evalsByStartup.set(e.startup_id, [])
        evalsByStartup.get(e.startup_id)!.push(e)
      }

      const judgeIds = Array.from(new Set(evals.map((e) => e.judge_id).filter(Boolean)))
      let judgeMap: Record<string, string> = {}
      if (judgeIds.length > 0) {
        const { data: judgeProfiles, error: judgeProfilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", judgeIds)

        if (cancelled) return

        if (judgeProfilesError) {
          setError(judgeProfilesError.message)
          setResults([])
          setLoading(false)
          return
        }

        judgeMap = Object.fromEntries(
          ((judgeProfiles ?? []) as any[]).map((p) => [p.id as string, (p.full_name as string) || "Judge"])
        )
      }

      const computed: StartupResult[] = startupIds.map((startupId) => {
        const profile = startupsById.get(startupId)
        const startupName = profile?.full_name?.trim() || "Startup"
        const startupAvatarUrl = profile?.avatar_url ?? null
        const startupWebsite = profile?.website ?? null

        const myEvals = evalsByStartup.get(startupId) ?? []
        const judgeAverages = myEvals.map((e) => calcEvaluationAverage(e))
        const average = judgeAverages.length > 0 ? judgeAverages.reduce((a, b) => a + b, 0) / judgeAverages.length : 0

        return {
          startup_id: startupId,
          startup_name: startupName,
          startup_avatar_url: startupAvatarUrl,
          startup_website: startupWebsite,
          average,
          evaluations: myEvals,
        }
      })

      computed.sort((a, b) => b.average - a.average)

      setJudgeNames(judgeMap)
      setResults(computed)
      setDetailsStartupId(null)
      setLoading(false)
      setAnimateIn(false)
      window.setTimeout(() => {
        if (!cancelled) setAnimateIn(true)
      }, 60)
    }

    loadLeaderboard()

    return () => {
      cancelled = true
    }
  }, [roleAllowed, selectedHackathonId])

  const podium = results.slice(0, 3)
  const rest = results.slice(3)

  const getVotedJudgeCount = (r: StartupResult) => {
    const votedJudgeIds = new Set(r.evaluations.filter(hasJudgeVoted).map((e) => e.judge_id).filter(Boolean))
    return votedJudgeIds.size
  }

  const handleExportCsv = () => {
    if (!selectedHackathonId) return

    const header = [
      "Rank",
      "Startup Name",
      "Teamwork Avg",
      "Idea Avg",
      "Code Avg",
      "Business Avg",
      "Final Total Average",
    ]

    const rows = results.map((r, idx) => {
      const votedEvals = r.evaluations.filter(hasJudgeVoted)
      const teamworkAvg = averageOfNumbers(votedEvals.map((e) => e.score_teamwork))
      const ideaAvg = averageOfNumbers(votedEvals.map((e) => e.score_idea))
      const codeAvg = averageOfNumbers(votedEvals.map((e) => e.score_code))
      const businessAvg = averageOfNumbers(votedEvals.map((e) => e.score_business))
      const finalAvg = (teamworkAvg + ideaAvg + codeAvg + businessAvg) / 4

      const rank = idx + 1
      const safe = (v: string) => `"${v.replaceAll('"', '""')}"`
      return [
        String(rank),
        safe(r.startup_name),
        formatScore(teamworkAvg),
        formatScore(ideaAvg),
        formatScore(codeAvg),
        formatScore(businessAvg),
        formatScore(finalAvg),
      ].join(",")
    })

    const csv = [header.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url

    const slug = (selectedHackathon?.title || "hackathon")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    a.download = `results-${slug || "hackathon"}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const podiumSlots: Array<{ rank: number; item?: StartupResult; tone: "gold" | "silver" | "bronze" }> = [
    { rank: 2, item: podium[1], tone: "silver" },
    { rank: 1, item: podium[0], tone: "gold" },
    { rank: 3, item: podium[2], tone: "bronze" },
  ]

  const toneStyles: Record<string, { badge: string; card: string; ring: string; tint: string }> = {
    gold: {
      badge: "bg-gold-50 text-gold-700 border-gold-200",
      card: "border-gold-200/60",
      ring: "ring-gold-200/40",
      tint: "bg-gold-50/40",
    },
    silver: {
      badge: "bg-slate-50 text-slate-700 border-slate-200",
      card: "border-slate-200/60",
      ring: "ring-slate-200/40",
      tint: "bg-slate-50/40",
    },
    bronze: {
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      card: "border-orange-200/60",
      ring: "ring-orange-200/40",
      tint: "bg-orange-50/40",
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-gold-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Results</h1>
          </div>
          <p className="text-slate-500 mt-1">Tournament leaderboard based on judge evaluations.</p>
        </div>

        <Button
          onClick={handleExportCsv}
          disabled={results.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Export Results
        </Button>
      </div>

      {loading ? (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Calculating leaderboard...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-sm text-slate-500">Loading...</div>
          </CardContent>
        </Card>
      ) : !roleAllowed ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This page is only available for users with the IT Company role.
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : hackathons.length === 0 ? (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>No hackathons yet</CardTitle>
            <CardDescription>Create a hackathon to see results and leaderboard rankings.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="glass border border-slate-200/40">
            <CardHeader>
              <CardTitle>Select Hackathon</CardTitle>
              <CardDescription>Choose one of your hackathons to view the leaderboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Hackathon</div>
                  <select
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={selectedHackathonId ?? ""}
                    onChange={(e) => setSelectedHackathonId(e.target.value || null)}
                  >
                    {hackathons.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">Summary</div>
                  <div className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-600">
                    <div className="font-semibold text-slate-900">{selectedHackathon?.title}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {selectedHackathon?.event_date ? new Date(selectedHackathon.event_date).toLocaleString() : ""}
                      {selectedHackathon?.event_date && selectedHackathon?.location ? " • " : ""}
                      {selectedHackathon?.location || ""}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {results.length === 0 ? (
            <Card className="glass border border-slate-200/40">
              <CardHeader>
                <CardTitle>No applications yet</CardTitle>
                <CardDescription>Once startups apply and judges submit scores, results will appear here.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div
                className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 ease-out ${
                  animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                {podiumSlots.map(({ rank, item, tone }) => {
                  const styles = toneStyles[tone]
                  const name = item?.startup_name ?? "—"
                  const avg = item ? formatScore(item.average) : "—"
                  const voted = item ? getVotedJudgeCount(item) : 0
                  const total = assignedJudgeCount
                  const ratio = total > 0 ? voted / total : 1
                  const isProvisional = total > 0 && ratio < 0.5

                  return (
                    <div
                      key={rank}
                      className={`glass rounded-2xl border ${styles.card} ${styles.tint} shadow-sm overflow-hidden ring-1 ${styles.ring}`}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`text-xs font-semibold ${styles.badge}`}>
                            {rank === 1 ? "1st Place" : rank === 2 ? "2nd Place" : "3rd Place"}
                          </Badge>
                          <Medal className={rank === 1 ? "w-5 h-5 text-gold-600" : rank === 2 ? "w-5 h-5 text-slate-500" : "w-5 h-5 text-orange-600"} />
                        </div>

                        <div className="mt-4 flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-2xl bg-white/70 border border-slate-200/50 overflow-hidden shrink-0">
                            {item?.startup_avatar_url ? (
                              <Image src={item.startup_avatar_url} alt={`${name} logo`} fill className="object-contain p-2" sizes="64px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-xl bg-navy-600 text-white flex items-center justify-center text-xl font-extrabold">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-lg font-extrabold text-slate-900 truncate">{name}</div>
                            <div className="text-sm text-slate-500">
                              Avg score:{" "}
                              <span className={`font-semibold ${isProvisional ? "text-slate-400" : "text-slate-700"}`}>{avg}</span>
                              {total > 0 && (
                                <span className="text-xs text-slate-400 ml-2">({voted}/{total} Judges Voted)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={!item}
                            onClick={() => item && setDetailsStartupId(item.startup_id)}
                          >
                            View Details
                          </Button>

                          {item?.startup_website ? (
                            <Link href={item.startup_website} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button className="w-full">
                                Website
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          ) : (
                            <Button className="flex-1" variant="secondary" disabled>
                              Website soon
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="h-1 w-full bg-gradient-to-r from-navy-500/0 via-navy-500/20 to-navy-500/0" />
                    </div>
                  )
                })}
              </div>

              <Card
                className={`glass border border-slate-200/40 transition-all duration-500 ease-out ${
                  animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                <CardHeader>
                  <CardTitle>Leaderboard</CardTitle>
                  <CardDescription>
                    Ranked by average score across all judges.
                    {assignedJudgeCount > 0 && (
                      <span className="ml-2">Total assigned judges: {assignedJudgeCount}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-500">
                          <th className="py-2 pr-4 font-semibold">Rank</th>
                          <th className="py-2 pr-4 font-semibold">Startup</th>
                          <th className="py-2 pr-4 font-semibold">Avg Score</th>
                          <th className="py-2 pr-4 font-semibold">Voted</th>
                          <th className="py-2 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rest.map((r, idx) => {
                          const rank = idx + 4
                          const voted = getVotedJudgeCount(r)
                          const total = assignedJudgeCount
                          const ratio = total > 0 ? voted / total : 1
                          const isProvisional = total > 0 && ratio < 0.5

                          return (
                            <tr key={r.startup_id} className="border-t border-slate-200/60">
                              <td className="py-3 pr-4 font-extrabold text-slate-700">{rank}</td>
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-xl bg-white/70 border border-slate-200/50 overflow-hidden shrink-0">
                                    {r.startup_avatar_url ? (
                                      <Image src={r.startup_avatar_url} alt={`${r.startup_name} logo`} fill className="object-contain p-2" sizes="40px" />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-lg bg-navy-600 text-white flex items-center justify-center text-sm font-extrabold">
                                          {r.startup_name.charAt(0).toUpperCase()}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">{r.startup_name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className={`py-3 pr-4 font-semibold ${isProvisional ? "text-slate-400" : "text-slate-700"}`}>
                                {formatScore(r.average)}
                                {total > 0 && (
                                  <div className="text-xs text-slate-400 mt-0.5">({voted}/{total} Judges Voted)</div>
                                )}
                              </td>
                              <td className="py-3 pr-4 text-slate-500">{voted}</td>
                              <td className="py-3">
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="outline" onClick={() => setDetailsStartupId(r.startup_id)}>
                                    View Details
                                  </Button>
                                  {r.startup_website ? (
                                    <Link href={r.startup_website} target="_blank" rel="noopener noreferrer">
                                      <Button size="sm">
                                        Website
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button size="sm" variant="secondary" disabled>
                                      Website soon
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {detailsStartup && (
                <Card className="glass border border-slate-200/40">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle>Score Breakdown</CardTitle>
                      <CardDescription>
                        {detailsStartup.startup_name} • Avg {formatScore(detailsStartup.average)}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setDetailsStartupId(null)}>
                      Close
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {detailsStartup.evaluations.length === 0 ? (
                      <div className="text-sm text-slate-500">No evaluations submitted yet for this startup.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-slate-500">
                              <th className="py-2 pr-4 font-semibold">Judge</th>
                              <th className="py-2 pr-4 font-semibold">Teamwork</th>
                              <th className="py-2 pr-4 font-semibold">Idea</th>
                              <th className="py-2 pr-4 font-semibold">Code</th>
                              <th className="py-2 pr-4 font-semibold">Business</th>
                              <th className="py-2 font-semibold">Avg</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailsStartup.evaluations.map((e) => {
                              const avg = calcEvaluationAverage(e)
                              const judgeName = judgeNames[e.judge_id] || "Judge"
                              const shortName = judgeName.split(" ")[0] || judgeName
                              const fmt = (n: number | null) => (typeof n === "number" ? n.toFixed(1) : "-")
                              return (
                                <tr key={e.id || `${e.judge_id}-${e.startup_id}`} className="border-t border-slate-200/60">
                                  <td className="py-3 pr-4 font-semibold text-slate-900">{judgeName}</td>
                                  <td className="py-3 pr-4 text-slate-700" title={`${judgeName}: ${fmt(e.score_teamwork)}`}>
                                    <span className="text-slate-400 mr-1">{shortName}:</span>
                                    {fmt(e.score_teamwork)}
                                  </td>
                                  <td className="py-3 pr-4 text-slate-700" title={`${judgeName}: ${fmt(e.score_idea)}`}>
                                    <span className="text-slate-400 mr-1">{shortName}:</span>
                                    {fmt(e.score_idea)}
                                  </td>
                                  <td className="py-3 pr-4 text-slate-700" title={`${judgeName}: ${fmt(e.score_code)}`}>
                                    <span className="text-slate-400 mr-1">{shortName}:</span>
                                    {fmt(e.score_code)}
                                  </td>
                                  <td className="py-3 pr-4 text-slate-700" title={`${judgeName}: ${fmt(e.score_business)}`}>
                                    <span className="text-slate-400 mr-1">{shortName}:</span>
                                    {fmt(e.score_business)}
                                  </td>
                                  <td className="py-3 font-semibold text-slate-900" title={`${judgeName}: ${formatScore(avg)}`}>
                                    <span className="text-slate-400 mr-1">{shortName}:</span>
                                    {formatScore(avg)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
