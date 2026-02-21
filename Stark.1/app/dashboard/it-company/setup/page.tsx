"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, ArrowRight, FileText, Globe, Wrench, Zap } from "lucide-react"
import { setupITCompany } from "./actions"

const residencyOptions = [
  { value: "local", label: "Local Company" },
  { value: "resident", label: "Tech Park Resident" },
  { value: "international", label: "International" },
]

const serviceOptions = [
  "Web Development",
  "Mobile Development",
  "Cloud & Infrastructure",
  "AI / Machine Learning",
  "Cybersecurity",
  "Data Analytics",
  "DevOps & Automation",
  "UI/UX Design",
  "ERP / CRM Solutions",
  "Blockchain",
  "IoT Solutions",
  "Consulting & Strategy",
  "Other",
]

export default function ITCompanySetupPage() {
  const [companyName, setCompanyName] = useState("")
  const [voen, setVoen] = useState("")
  const [residencyStatus, setResidencyStatus] = useState("local")
  const [mainService, setMainService] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!companyName.trim() || !voen.trim() || !mainService) {
      setError("Company name, VOEN, and main service are required")
      setLoading(false)
      return
    }

    try {
      const result = await setupITCompany({
        company_name: companyName.trim(),
        voen: voen.trim(),
        residency_status: residencyStatus,
        main_service: mainService,
      })

      if (result.success) {
        router.refresh()
        router.push("/dashboard/it-company")
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
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Set Up Your IT Company
          </h1>
          <p className="text-slate-500 max-w-sm mx-auto">
            Tell us about your company so startups can find and partner with you.
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
                  placeholder="e.g. TechVision LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* VOEN */}
            <div className="space-y-2">
              <Label htmlFor="voen" className="text-sm font-medium text-slate-700">
                VOEN (Tax ID)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="voen"
                  placeholder="e.g. 1234567890"
                  value={voen}
                  onChange={(e) => setVoen(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Residency Status */}
            <div className="space-y-2">
              <Label htmlFor="residency_status" className="text-sm font-medium text-slate-700">
                Residency Status
              </Label>
              <Select value={residencyStatus} onValueChange={setResidencyStatus}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:border-navy-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-300 transition-all">
                  <Globe className="w-4 h-4 text-slate-400 mr-2" />
                  <SelectValue placeholder="Select residency status" />
                </SelectTrigger>
                <SelectContent>
                  {residencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Main Service */}
            <div className="space-y-2">
              <Label htmlFor="main_service" className="text-sm font-medium text-slate-700">
                Main Service
              </Label>
              <Select value={mainService} onValueChange={setMainService}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:border-navy-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-300 transition-all">
                  <Wrench className="w-4 h-4 text-slate-400 mr-2" />
                  <SelectValue placeholder="Select your main service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((svc) => (
                    <SelectItem key={svc} value={svc}>
                      {svc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
