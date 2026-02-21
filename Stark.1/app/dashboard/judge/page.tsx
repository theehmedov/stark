"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Hackathon = {
  id: string
  title: string
}

type StartupRow = {
  startup_id: string
  startup_name: string
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

type ToastState = {
  message: string
  variant: "success" | "error"
} | null

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 10) return 10
  return value
}

function toNumberOrNull(raw: string) {
  if (raw.trim() === "") return null
  const n = Number(raw)
  if (Number.isNaN(n)) return null
  return clampScore(n)
}

function calcAverage(e: Pick<EvaluationRow, "score_teamwork" | "score_idea" | "score_code" | "score_business">) {
  const values = [e.score_teamwork, e.score_idea, e.score_code, e.score_business].map((v) =>
    typeof v === "number" ? v : 0
  )
  const sum = values.reduce((acc, v) => acc + v, 0)
  return sum / 4
}

export default function JudgePage() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) {
    supabaseRef.current = createClient()
  }
  const supabase = supabaseRef.current

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [toast, setToast] = useState<ToastState>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  const [roleAllowed, setRoleAllowed] = useState(false)
  const [judgeId, setJudgeId] = useState<string | null>(null)

  const [assignedHackathons, setAssignedHackathons] = useState<Hackathon[]>([])
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null)
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [startups, setStartups] = useState<StartupRow[]>([])
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationRow>>({})

  const [saveLoadingStartupId, setSaveLoadingStartupId] = useState<string | null>(null)

  const showToast = (next: ToastState) => {
    setToast(next)
    if (!next) return

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000)
  }

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
        console.error("[JUDGE] auth.getUser error:", userError)
        setError(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        setError("Not authenticated")
        setLoading(false)
        return
      }

      setJudgeId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, sub_role")
        .eq("id", user.id)
        .single()

      if (cancelled) return

      if (profileError) {
        console.error("[JUDGE] profile fetch error:", profileError)
        setError(profileError.message)
        setLoading(false)
        return
      }

      const isJudge = profile?.role === "judge" || (profile?.role === "individual" && profile?.sub_role === "jury")
      if (!isJudge) {
        setRoleAllowed(false)
        setLoading(false)
        return
      }

      setRoleAllowed(true)

      const { data: judgeLinks, error: judgeLinksError } = await supabase
        .from("hackathon_judges")
        .select("hackathon_id")
        .eq("judge_id", user.id)

      if (cancelled) return

      if (judgeLinksError) {
        console.error("[JUDGE] hackathon_judges fetch error:", judgeLinksError)
        setError(judgeLinksError.message)
        setAssignedHackathons([])
        setLoading(false)
        return
      }

      const hackathonIds = Array.from(
        new Set((judgeLinks ?? []).map((j: any) => j.hackathon_id).filter(Boolean))
      ) as string[]

      if (hackathonIds.length === 0) {
        setAssignedHackathons([])
        setSelectedHackathonId(null)
        setHackathon(null)
        setStartups([])
        setEvaluations({})
        setLoading(false)
        return
      }

      const { data: hackathonsData, error: hackathonsError } = await supabase
        .from("hackathons")
        .select("id, title")
        .in("id", hackathonIds)
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (hackathonsError) {
        console.error("[JUDGE] assigned hackathons fetch error:", hackathonsError)
        setError(hackathonsError.message)
        setAssignedHackathons([])
        setLoading(false)
        return
      }

      setAssignedHackathons((hackathonsData ?? []) as Hackathon[])
      setLoading(false)
    }

    init()

    return () => {
      cancelled = true
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadHackathonData = async () => {
      if (!roleAllowed) return
      if (!selectedHackathonId) {
        setHackathon(null)
        setStartups([])
        setEvaluations({})
        return
      }
      if (!judgeId) return

      setLoading(true)
      setError(null)

      const { data: hackathonData, error: hackathonError } = await supabase
        .from("hackathons")
        .select("id, title")
        .eq("id", selectedHackathonId)
        .single()

      if (cancelled) return

      if (hackathonError) {
        console.error("[JUDGE] selected hackathon fetch error:", hackathonError)
        setError(hackathonError.message)
        setHackathon(null)
        setStartups([])
        setEvaluations({})
        setLoading(false)
        return
      }

      setHackathon(hackathonData as Hackathon)

      const [appsRes, evalsRes] = await Promise.all([
        supabase
          .from("hackathon_applications")
          .select("startup_id")
          .eq("hackathon_id", selectedHackathonId)
          .order("created_at", { ascending: true }),
        supabase
          .from("evaluations")
          .select(
            "id, hackathon_id, startup_id, judge_id, score_teamwork, score_idea, score_code, score_business"
          )
          .eq("hackathon_id", selectedHackathonId)
          .eq("judge_id", judgeId),
      ])

      if (cancelled) return

      if (appsRes.error) {
        console.error("[JUDGE] applications fetch error:", appsRes.error)
        setError(appsRes.error.message)
        setStartups([])
        setEvaluations({})
        setLoading(false)
        return
      }

      if (evalsRes.error) {
        console.error("[JUDGE] evaluations fetch error:", evalsRes.error)
        setError(evalsRes.error.message)
        setStartups([])
        setEvaluations({})
        setLoading(false)
        return
      }

      const startupIds = Array.from(
        new Set((appsRes.data ?? []).map((a: any) => a.startup_id).filter(Boolean))
      ) as string[]

      const startupRows: StartupRow[] = []
      if (startupIds.length > 0) {
        const { data: startupProfiles, error: startupProfilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "startup")
          .in("id", startupIds)

        if (startupProfilesError) {
          console.error("[JUDGE] startup profiles fetch error:", startupProfilesError)
          setError(startupProfilesError.message)
          setStartups([])
          setEvaluations({})
          setLoading(false)
          return
        }

        const nameMap = new Map<string, string>()
        for (const p of startupProfiles ?? []) {
          nameMap.set((p as any).id, (p as any).full_name ?? "(Unknown startup)")
        }

        for (const id of startupIds) {
          startupRows.push({ startup_id: id, startup_name: nameMap.get(id) ?? "(Unknown startup)" })
        }
      }

      const nextEvals: Record<string, EvaluationRow> = {}
      for (const s of startupRows) {
        nextEvals[s.startup_id] = {
          hackathon_id: selectedHackathonId,
          startup_id: s.startup_id,
          judge_id: judgeId,
          score_teamwork: null,
          score_idea: null,
          score_code: null,
          score_business: null,
        }
      }

      for (const e of evalsRes.data ?? []) {
        nextEvals[(e as any).startup_id] = {
          id: (e as any).id,
          hackathon_id: (e as any).hackathon_id,
          startup_id: (e as any).startup_id,
          judge_id: (e as any).judge_id,
          score_teamwork: (e as any).score_teamwork,
          score_idea: (e as any).score_idea,
          score_code: (e as any).score_code,
          score_business: (e as any).score_business,
        }
      }

      setStartups(startupRows)
      setEvaluations(nextEvals)
      setLoading(false)
    }

    loadHackathonData()

    return () => {
      cancelled = true
    }
  }, [selectedHackathonId, roleAllowed, judgeId])

  const setScore = (startupId: string, field: keyof Pick<EvaluationRow, "score_teamwork" | "score_idea" | "score_code" | "score_business">, raw: string) => {
    const value = toNumberOrNull(raw)
    setEvaluations((prev) => ({
      ...prev,
      [startupId]: {
        ...prev[startupId],
        [field]: value,
      },
    }))
  }

  const saveRow = async (startupId: string) => {
    if (!hackathon?.id) {
      showToast({ message: "No hackathon found", variant: "error" })
      return
    }
    if (!judgeId) {
      showToast({ message: "Not authenticated", variant: "error" })
      return
    }

    const row = evaluations[startupId]
    if (!row) return

    setSaveLoadingStartupId(startupId)
    setError(null)

    const payload: EvaluationRow = {
      hackathon_id: hackathon.id,
      startup_id: startupId,
      judge_id: judgeId,
      score_teamwork: row.score_teamwork,
      score_idea: row.score_idea,
      score_code: row.score_code,
      score_business: row.score_business,
    }

    const { data, error: upsertError } = await supabase
      .from("evaluations")
      .upsert(payload, { onConflict: "hackathon_id,startup_id,judge_id" })
      .select("id")
      .single()

    if (upsertError) {
      console.error("[JUDGE] saveRow upsert error:", upsertError)
      showToast({ message: upsertError.message, variant: "error" })
      setSaveLoadingStartupId(null)
      return
    }

    setEvaluations((prev) => ({
      ...prev,
      [startupId]: {
        ...prev[startupId],
        id: (data as any)?.id ?? prev[startupId]?.id,
      },
    }))

    showToast({ message: "Saved", variant: "success" })
    setSaveLoadingStartupId(null)
  }

  const startupAverages = startups.map((s) => {
    const e = evaluations[s.startup_id]
    return {
      startup_id: s.startup_id,
      avg: e ? calcAverage(e) : 0,
    }
  })

  const best = startupAverages.reduce<{ startup_id: string | null; avg: number }>(
    (acc, curr) => {
      if (curr.avg > acc.avg) return { startup_id: curr.startup_id, avg: curr.avg }
      return acc
    },
    { startup_id: null, avg: -1 }
  )

  const overallAverage = startupAverages.length
    ? startupAverages.reduce((acc, s) => acc + s.avg, 0) / startupAverages.length
    : 0

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            toast.variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Judge Evaluation</h2>
        <p className="text-slate-500">Grade startups in an Excel-like table.</p>
      </div>

      {loading ? (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Fetching hackathon applications and your evaluations...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-sm text-slate-500">Loading...</div>
          </CardContent>
        </Card>
      ) : !roleAllowed ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This page is only available for judges.
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : !selectedHackathonId ? (
        assignedHackathons.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white/60 px-4 py-8 text-sm text-slate-500">
            No hackathons are assigned to you yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedHackathons.map((h) => (
              <Card key={h.id} className="glass border border-slate-200/40">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{h.title}</CardTitle>
                  <CardDescription>Assigned hackathon</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setSelectedHackathonId(h.id)}>
                    Start Judging
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : !hackathon ? (
        <div className="rounded-xl border border-slate-200 bg-white/60 px-4 py-8 text-sm text-slate-500">
          Hackathon not found.
        </div>
      ) : (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4">
              <span className="min-w-0 truncate">{hackathon.title}</span>
              <span className="text-xs font-semibold text-slate-500">Overall avg: {overallAverage.toFixed(2)}</span>
            </CardTitle>
            <CardDescription>Scores are 0-10. Average updates in real time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedHackathonId(null)}>
                Back to List
              </Button>
            </div>
            {startups.length === 0 ? (
              <div className="py-8 text-sm text-slate-500">No startups have applied to this hackathon yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500">
                      <th className="px-3 py-3 border-b border-slate-200">Startup Name</th>
                      <th className="px-3 py-3 border-b border-slate-200">Teamworking</th>
                      <th className="px-3 py-3 border-b border-slate-200">Idea</th>
                      <th className="px-3 py-3 border-b border-slate-200">Code</th>
                      <th className="px-3 py-3 border-b border-slate-200">Business</th>
                      <th className="px-3 py-3 border-b border-slate-200">Average</th>
                      <th className="px-3 py-3 border-b border-slate-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {startups.map((s) => {
                      const e = evaluations[s.startup_id]
                      const avg = e ? calcAverage(e) : 0
                      const isMvp = best.startup_id === s.startup_id && avg > 0

                      return (
                        <tr
                          key={s.startup_id}
                          className={
                            isMvp
                              ? "bg-amber-50/40"
                              : "bg-white/40"
                          }
                        >
                          <td
                            className={
                              "px-3 py-3 border-b border-slate-200 text-sm font-semibold text-slate-900 " +
                              (isMvp ? "border-l-4 border-l-amber-400" : "")
                            }
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate">{s.startup_name}</span>
                              {isMvp && (
                                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 bg-amber-100 text-amber-800">
                                  MVP
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3 border-b border-slate-200">
                            <input
                              inputMode="decimal"
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={e?.score_teamwork ?? ""}
                              onChange={(ev) => setScore(s.startup_id, "score_teamwork", ev.target.value)}
                              className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600/40"
                            />
                          </td>

                          <td className="px-3 py-3 border-b border-slate-200">
                            <input
                              inputMode="decimal"
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={e?.score_idea ?? ""}
                              onChange={(ev) => setScore(s.startup_id, "score_idea", ev.target.value)}
                              className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600/40"
                            />
                          </td>

                          <td className="px-3 py-3 border-b border-slate-200">
                            <input
                              inputMode="decimal"
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={e?.score_code ?? ""}
                              onChange={(ev) => setScore(s.startup_id, "score_code", ev.target.value)}
                              className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600/40"
                            />
                          </td>

                          <td className="px-3 py-3 border-b border-slate-200">
                            <input
                              inputMode="decimal"
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={e?.score_business ?? ""}
                              onChange={(ev) => setScore(s.startup_id, "score_business", ev.target.value)}
                              className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600/40"
                            />
                          </td>

                          <td className="px-3 py-3 border-b border-slate-200 text-sm font-semibold text-slate-900">
                            {avg.toFixed(2)}
                          </td>

                          <td className="px-3 py-3 border-b border-slate-200">
                            <Button
                              onClick={() => saveRow(s.startup_id)}
                              disabled={saveLoadingStartupId === s.startup_id}
                              size="sm"
                            >
                              {saveLoadingStartupId === s.startup_id ? "Saving..." : "Save"}
                            </Button>
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
    </div>
  )
}
