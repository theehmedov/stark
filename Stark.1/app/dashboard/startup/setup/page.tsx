"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rocket, ArrowRight, Building2, Users, Layers, Link as LinkIcon, Zap } from "lucide-react"
import { setupStartup } from "./actions"

const industries = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "AgriTech",
  "E-Commerce",
  "SaaS",
  "AI / Machine Learning",
  "CleanTech / Energy",
  "Logistics",
  "Cybersecurity",
  "Gaming",
  "Other",
]

const stages = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP / Prototype" },
  { value: "pre_seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B+" },
  { value: "growth", label: "Growth / Scale" },
]

export default function StartupSetupPage() {
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [stage, setStage] = useState("idea")
  const [teamSize, setTeamSize] = useState("1")
  const [pitchDeckUrl, setPitchDeckUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!companyName.trim() || !industry) {
      setError("Company name and industry are required")
      setLoading(false)
      return
    }

    try {
      const result = await setupStartup({
        company_name: companyName.trim(),
        industry,
        stage,
        team_size: parseInt(teamSize) || 1,
        pitch_deck_url: pitchDeckUrl.trim() || undefined,
      })

      if (result.success) {
        router.refresh()
        router.push("/dashboard/startup")
      } else {
        setError(result.error || "Setup failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-lg shadow-navy-600/25 mb-5">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Set Up Your Startup
          </h1>
          <p className="text-slate-500 max-w-sm mx-auto">
            Tell us about your startup so we can connect you with the right investors and partners.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200/60 rounded-xl">
                {error}
              </div>
            )}

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm font-medium text-slate-700">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="company_name"
                  placeholder="e.g. Stark Industries"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium text-slate-700">
                Industry
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:border-navy-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-300 transition-all">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <Label htmlFor="stage" className="text-sm font-medium text-slate-700">
                Stage
              </Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:border-navy-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-300 transition-all">
                  <SelectValue placeholder="Select your stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Size */}
            <div className="space-y-2">
              <Label htmlFor="team_size" className="text-sm font-medium text-slate-700">
                Team Size
              </Label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="team_size"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g. 5"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Pitch Deck URL */}
            <div className="space-y-2">
              <Label htmlFor="pitch_deck_url" className="text-sm font-medium text-slate-700">
                Pitch Deck URL <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="pitch_deck_url"
                  type="url"
                  placeholder="https://docs.google.com/..."
                  value={pitchDeckUrl}
                  onChange={(e) => setPitchDeckUrl(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Setting up...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Complete Setup <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-slate-400 mt-6">
          <Zap className="w-3 h-3 inline mr-1" />
          You can update this information anytime from your dashboard settings.
        </p>
      </div>
    </div>
  )
}
