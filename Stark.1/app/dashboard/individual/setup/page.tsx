"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setupIndividual } from "./actions"

export default function IndividualSetupPage() {
  const [fullName, setFullName] = useState("")
  const [subRole, setSubRole] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!fullName.trim()) {
      setError("Please enter your full name")
      setLoading(false)
      return
    }

    if (!subRole) {
      setError("Please select your role")
      setLoading(false)
      return
    }

    if (!cvFile) {
      setError("Please upload your CV (PDF, DOC, or DOCX)")
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("full_name", fullName)
    formData.append("sub_role", subRole)
    formData.append("cv_file", cvFile)

    try {
      const result = await setupIndividual(formData)

      if (result.success) {
        router.push("/dashboard/individual/pending")
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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Individual Setup</CardTitle>
          <CardDescription>
            Choose whether you want to join as a Mentor or Jury member and upload your CV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub_role">Role</Label>
              <Select value={subRole} onValueChange={setSubRole} disabled={loading}>
                <SelectTrigger id="sub_role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="jury">Jury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cv_file">CV Upload</Label>
              <Input
                id="cv_file"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
              <p className="text-xs text-slate-500">Accepted formats: PDF, DOC, DOCX.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
