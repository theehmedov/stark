"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type StaffProfile = {
  id: string
  full_name: string | null
  sub_role: string | null
}

type ToastState = {
  message: string
  variant: "success" | "error"
} | null

export default function NewHackathonPage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const [isAllowed, setIsAllowed] = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)

  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set())

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [location, setLocation] = useState("")

  const toastTimeoutRef = useRef<number | null>(null)

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
        console.error("[HACKATHON NEW] auth.getUser error:", userError)
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
        console.error("[HACKATHON NEW] profile fetch error:", profileError)
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (profile?.role !== "it_company") {
        setIsAllowed(false)
        setLoading(false)
        return
      }

      setIsAllowed(true)

      const { data: staffData, error: staffError } = await supabase
        .from("profiles")
        .select("id, full_name, sub_role")
        .eq("role", "individual")
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false })

      if (cancelled) return

      if (staffError) {
        console.error("[HACKATHON NEW] staff fetch error:", staffError)
        setError(staffError.message)
        setStaff([])
        setLoading(false)
        return
      }

      setStaff((staffData ?? []) as StaffProfile[])
      setLoading(false)
    }

    init()

    return () => {
      cancelled = true
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [supabase])

  const toggleStaff = (id: string) => {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isAllowed) return
    if (!companyId) {
      setError("Not authenticated")
      return
    }

    if (!title.trim() || !description.trim() || !eventDate || !location.trim()) {
      setError("Title, description, event date, and location are required")
      return
    }

    setSubmitting(true)

    try {
      const { data: hackathon, error: hackathonError } = await supabase
        .from("hackathons")
        .insert({
          company_id: companyId,
          title: title.trim(),
          description: description.trim(),
          event_date: eventDate,
          location: location.trim(),
        })
        .select("id")
        .single()

      if (hackathonError) {
        console.error("[HACKATHON NEW] insert hackathon error:", hackathonError)
        showToast({ message: hackathonError.message, variant: "error" })
        return
      }

      const hackathonId = hackathon?.id
      if (!hackathonId) {
        showToast({ message: "Hackathon created but no ID returned", variant: "error" })
        return
      }

      const selectedIds = Array.from(selectedStaffIds)
      if (selectedIds.length > 0) {
        const selectedProfiles = staff.filter((s) => selectedStaffIds.has(s.id))

        const staffRows = selectedProfiles.map((s) => ({
          hackathon_id: hackathonId,
          profile_id: s.id,
          staff_role: s.sub_role ?? "individual",
        }))

        const { error: staffInsertError } = await supabase.from("hackathon_staff").insert(staffRows)

        if (staffInsertError) {
          console.error("[HACKATHON NEW] insert staff error:", staffInsertError)
          showToast({ message: staffInsertError.message, variant: "error" })
          return
        }
      }

      showToast({ message: "Hackathon created successfully", variant: "success" })
      setTitle("")
      setDescription("")
      setEventDate("")
      setLocation("")
      setSelectedStaffIds(new Set())
    } catch (err) {
      console.error("[HACKATHON NEW] unexpected error:", err)
      showToast({ message: "An unexpected error occurred", variant: "error" })
    } finally {
      setSubmitting(false)
    }
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Hackathon</h1>
        <p className="text-slate-500">Only IT Companies can create hackathons.</p>
      </div>

      {loading ? (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Checking permissions and loading staff...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-sm text-slate-500">Loading...</div>
          </CardContent>
        </Card>
      ) : !isAllowed ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Only IT Companies can create hackathons
        </div>
      ) : (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Hackathon Details</CardTitle>
            <CardDescription>Create a hackathon and assign mentors/juries.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="STARK Hackathon 2026" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-600/40"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the hackathon goals, themes, and outcomes..."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Baku, Azerbaijan"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Select Mentors & Juries</p>
                  <p className="text-xs text-slate-500">Approved individuals only</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white/60 p-4">
                  {staff.length === 0 ? (
                    <div className="text-sm text-slate-500">No approved mentors/juries found.</div>
                  ) : (
                    <div className="space-y-3">
                      {staff.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">{s.full_name || "(No name)"}</div>
                            <div className="text-xs text-slate-500 capitalize">{s.sub_role || "individual"}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedStaffIds.has(s.id)}
                            onChange={() => toggleStaff(s.id)}
                            className="h-4 w-4"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Hackathon"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => {
                    setTitle("")
                    setDescription("")
                    setEventDate("")
                    setLocation("")
                    setSelectedStaffIds(new Set())
                    setError(null)
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
