"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type PendingIndividual = {
  id: string
  full_name: string | null
  sub_role: string | null
  cv_url: string | null
  approval_status: string | null
}

type ToastState = {
  message: string
  variant: "success" | "error"
} | null

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const [pending, setPending] = useState<PendingIndividual[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = (next: ToastState) => {
    setToast(next)
    if (!next) return
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPending = async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("id, full_name, sub_role, cv_url, approval_status")
      .eq("role", "individual")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("[ADMIN] fetchPending error:", fetchError)
      setError(fetchError.message)
      setPending([])
      setLoading(false)
      return
    }

    setPending((data ?? []) as PendingIndividual[])
    setLoading(false)
  }

  useEffect(() => {
    fetchPending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateStatus = async (userId: string, status: "approved" | "rejected") => {
    setActionLoadingId(userId)
    setError(null)

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ approval_status: status })
      .eq("id", userId)

    if (updateError) {
      console.error("[ADMIN] updateStatus error:", updateError)
      showToast({ message: updateError.message, variant: "error" })
      setActionLoadingId(null)
      return
    }

    setPending((prev) => prev.filter((p) => p.id !== userId))
    showToast({
      message: status === "approved" ? "User approved" : "User rejected",
      variant: "success",
    })
    setActionLoadingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h2>
          <p className="text-slate-500">Review and approve pending mentors and jury members.</p>
        </div>
        <Button variant="outline" onClick={fetchPending} disabled={loading}>
          Refresh
        </Button>
      </div>

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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="glass border border-slate-200/40">
        <CardHeader>
          <CardTitle>Pending Individuals</CardTitle>
          <CardDescription>
            {loading ? "Loading pending applications..." : `${pending.length} pending application(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-sm text-slate-500">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="py-10 text-sm text-slate-500">No pending mentor/jury applications.</div>
          ) : (
            <div className="space-y-3">
              {pending.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 px-4 py-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{p.full_name || "(No name)"}</div>
                    <div className="text-xs text-slate-500 capitalize">{p.sub_role || "individual"}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                    {p.cv_url ? (
                      <a
                        href={p.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View CV
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">No CV</span>
                    )}

                    <Button
                      onClick={() => updateStatus(p.id, "approved")}
                      disabled={actionLoadingId === p.id}
                    >
                      {actionLoadingId === p.id ? "Saving..." : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateStatus(p.id, "rejected")}
                      disabled={actionLoadingId === p.id}
                    >
                      {actionLoadingId === p.id ? "Saving..." : "Reject"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
