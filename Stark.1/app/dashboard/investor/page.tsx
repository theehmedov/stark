"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type InvestorDetails = {
  organization_name: string | null
  website: string | null
  investment_focus: string | null
}

type ToastState = {
  message: string
  variant: "success" | "error"
} | null

const INVESTMENT_FOCUS_OPTIONS = [
  "AI",
  "Financial",
  "Healthcare",
  "Education",
  "Sports",
  "B2B SaaS",
  "Cyber Security",
] as const

export default function InvestorDashboardPage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [roleAllowed, setRoleAllowed] = useState(false)
  const [savedDetails, setSavedDetails] = useState<InvestorDetails | null>(null)

  const [organizationName, setOrganizationName] = useState("")
  const [website, setWebsite] = useState("")
  const [selectedFocus, setSelectedFocus] = useState<Set<string>>(new Set())

  const toastTimeoutRef = useRef<number | null>(null)

  const showToast = (next: ToastState) => {
    setToast(next)
    if (!next) return
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000)
  }

  const parseFocus = (raw: string | null) => {
    if (!raw) return new Set<string>()
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    return new Set(parts)
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
        console.error("[INVESTOR] auth.getUser error:", userError)
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
        console.error("[INVESTOR] profile fetch error:", profileError)
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (profile?.role !== "investor") {
        setRoleAllowed(false)
        setLoading(false)
        return
      }

      setRoleAllowed(true)

      const { data: details, error: detailsError } = await supabase
        .from("investor_details")
        .select("organization_name, website, investment_focus")
        .eq("user_id", user.id)
        .maybeSingle()

      if (cancelled) return

      if (detailsError) {
        console.error("[INVESTOR] investor_details fetch error:", detailsError)
        setError(detailsError.message)
        setSavedDetails(null)
        setLoading(false)
        return
      }

      if (details) {
        const nextDetails: InvestorDetails = {
          organization_name: details.organization_name ?? null,
          website: details.website ?? null,
          investment_focus: details.investment_focus ?? null,
        }
        setSavedDetails(nextDetails)
        setOrganizationName(nextDetails.organization_name ?? "")
        setWebsite(nextDetails.website ?? "")
        setSelectedFocus(parseFocus(nextDetails.investment_focus))
      } else {
        setSavedDetails(null)
      }

      setLoading(false)
    }

    init()

    return () => {
      cancelled = true
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const toggleFocus = (option: string) => {
    setSelectedFocus((prev) => {
      const next = new Set(prev)
      if (next.has(option)) next.delete(option)
      else next.add(option)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!roleAllowed) return
    if (!userId) {
      setError("Not authenticated")
      return
    }

    if (!organizationName.trim()) {
      setError("Organization name is required")
      return
    }

    const focusString = Array.from(selectedFocus).join(", ")

    setSubmitting(true)
    try {
      const { data, error: insertError } = await supabase
        .from("investor_details")
        .insert({
          user_id: userId,
          organization_name: organizationName.trim(),
          website: website.trim() ? website.trim() : null,
          investment_focus: focusString,
        })
        .select("organization_name, website, investment_focus")
        .single()

      if (insertError) {
        console.error("[INVESTOR] insert investor_details error:", insertError)
        showToast({ message: insertError.message, variant: "error" })
        return
      }

      const nextDetails: InvestorDetails = {
        organization_name: data?.organization_name ?? null,
        website: data?.website ?? null,
        investment_focus: data?.investment_focus ?? null,
      }
      setSavedDetails(nextDetails)
      showToast({ message: "Investor details saved", variant: "success" })
    } catch (err) {
      console.error("[INVESTOR] unexpected submit error:", err)
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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Investor Onboarding</h2>
        <p className="text-slate-500">Set your organization details and investment focus.</p>
      </div>

      {loading ? (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Fetching your profile and investor details...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-sm text-slate-500">Loading...</div>
          </CardContent>
        </Card>
      ) : !roleAllowed ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This page is only available for users with the investor role.
        </div>
      ) : savedDetails ? (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Your Saved Details</CardTitle>
            <CardDescription>These details are currently stored in investor_details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3">
                <div className="text-xs font-semibold text-slate-500">Organization</div>
                <div className="text-sm font-semibold text-slate-900">{savedDetails.organization_name ?? "-"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3">
                <div className="text-xs font-semibold text-slate-500">Website</div>
                <div className="text-sm font-semibold text-slate-900">{savedDetails.website ?? "-"}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3">
              <div className="text-xs font-semibold text-slate-500">Investment Focus</div>
              <div className="text-sm font-semibold text-slate-900">{savedDetails.investment_focus ?? "-"}</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass border border-slate-200/40">
          <CardHeader>
            <CardTitle>Complete your onboarding</CardTitle>
            <CardDescription>Fill in the details below to set up your investor profile.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization name</Label>
                <Input
                  id="organization_name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Acme Ventures"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Investment focus</p>
                  <p className="text-xs text-slate-500">Select one or more.</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {INVESTMENT_FOCUS_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/60 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-900">{opt}</span>
                      <input
                        type="checkbox"
                        checked={selectedFocus.has(opt)}
                        onChange={() => toggleFocus(opt)}
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save details"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => {
                    setOrganizationName("")
                    setWebsite("")
                    setSelectedFocus(new Set())
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
