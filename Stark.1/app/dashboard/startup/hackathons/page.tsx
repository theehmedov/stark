"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Hackathon = {
  id: string
  title: string
  description: string
  event_date: string
  location: string
}

type Application = {
  id: string
  hackathon_id: string
  startup_id: string
  status: string | null
  created_at: string | null
}

type ToastState = {
  message: string
  variant: "success" | "error"
} | null

export default function StartupHackathonsPage() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) {
    supabaseRef.current = createClient()
  }
  const supabase = supabaseRef.current

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const [roleAllowed, setRoleAllowed] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const toastTimeoutRef = useRef<number | null>(null)

  const showToast = (next: ToastState) => {
    setToast(next)
    if (!next) return

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000)
  }

  const appliedHackathonIds = new Set(applications.map((a) => a.hackathon_id))

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
        console.error("[STARTUP HACKATHONS] auth.getUser error:", userError)
        setError(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        setError("Not authenticated")
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (cancelled) return

      if (profileError) {
        console.error("[STARTUP HACKATHONS] profile fetch error:", profileError)
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (profile?.role !== "startup") {
        setRoleAllowed(false)
        setLoading(false)
        return
      }

      setRoleAllowed(true)

      const [{ data: hackathonData, error: hackathonError }, { data: appData, error: appError }] = await Promise.all([
        supabase
          .from("hackathons")
          .select("id, title, description, event_date, location")
          .order("created_at", { ascending: false }),
        supabase
          .from("hackathon_applications")
          .select("id, hackathon_id, startup_id, status, created_at")
          .eq("startup_id", user.id)
          .order("created_at", { ascending: false }),
      ])

      if (cancelled) return

      if (hackathonError) {
        console.error("[STARTUP HACKATHONS] fetch hackathons error:", hackathonError)
        setError(hackathonError.message)
        setHackathons([])
        setApplications([])
        setLoading(false)
        return
      }

      if (appError) {
        console.error("[STARTUP HACKATHONS] fetch applications error:", appError)
        setError(appError.message)
        setHackathons((hackathonData ?? []) as Hackathon[])
        setApplications([])
        setLoading(false)
        return
      }

      setHackathons((hackathonData ?? []) as Hackathon[])
      setApplications((appData ?? []) as Application[])
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

  const applyToHackathon = async (hackathonId: string) => {
    if (!userId) {
      setError("Not authenticated")
      return
    }

    setActionLoadingId(hackathonId)
    setError(null)

    const { data, error: applyError } = await supabase
      .from("hackathon_applications")
      .insert({ hackathon_id: hackathonId, startup_id: userId, status: "applied" })
      .select("id, hackathon_id, startup_id, status, created_at")
      .single()

    if (applyError) {
      console.error("[STARTUP HACKATHONS] apply error:", applyError)
      showToast({ message: applyError.message, variant: "error" })
      setActionLoadingId(null)
      return
    }

    if (data) {
      setApplications((prev) => [data as Application, ...prev])
    }

    showToast({ message: "Applied successfully", variant: "success" })
    setActionLoadingId(null)
  }

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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Hackathons</h2>
        <p className="text-slate-500">Browse hackathons and apply as a startup.</p>
      </div>

      {loading ? (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Fetching hackathons and your applications...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-sm text-slate-500">Loading...</div>
          </CardContent>
        </Card>
      ) : !roleAllowed ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This page is only available for users with the startup role.
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : hackathons.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white/60 px-4 py-8 text-sm text-slate-500">
          No hackathons available.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((h) => {
            const isApplied = appliedHackathonIds.has(h.id)
            const isActionLoading = actionLoadingId === h.id

            return (
              <Card key={h.id} className="glass border border-slate-200/40">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{h.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{h.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-900">Date:</span>{" "}
                      {h.event_date ? new Date(h.event_date).toLocaleString() : "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Location:</span> {h.location || "-"}
                    </div>
                  </div>

                  <Button
                    onClick={() => applyToHackathon(h.id)}
                    disabled={isApplied || isActionLoading}
                    className="w-full"
                  >
                    {isApplied ? "Applied" : isActionLoading ? "Applying..." : "Apply"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
