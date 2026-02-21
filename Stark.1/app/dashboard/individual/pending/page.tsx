import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function IndividualPendingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("approval_status")
    .eq("id", user.id)
    .single()

  if (profile?.approval_status === "approved") {
    redirect("/dashboard/individual")
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Application Under Review</CardTitle>
          <CardDescription>Thanks for completing your individual setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Your application is under review by the Admin. You will be notified once approved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
