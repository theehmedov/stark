import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Trophy, PlusCircle, LogOut, BarChart3 } from "lucide-react"

export default async function ITCompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "it_company") {
    redirect("/dashboard")
  }

  async function signOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden md:flex w-64 shrink-0 flex-col rounded-2xl glass border border-slate-200/40 overflow-hidden">
        <div className="px-5 py-5 border-b border-slate-200/40">
          <div className="text-sm font-extrabold tracking-tight text-slate-900">IT Company</div>
          <div className="text-xs text-slate-500 mt-1">Hackathon Management</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard/it-company"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50/70 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            Dashboard Home
          </Link>

          <Link
            href="/dashboard/it-company/hackathons"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50/70 transition"
          >
            <Trophy className="w-4 h-4 text-slate-500" />
            My Hackathons
          </Link>

          <Link
            href="/dashboard/it-company/results"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 hover:bg-emerald-50/60 transition"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Results
          </Link>

          <Link
            href="/dashboard/it-company/hackathons/new"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50/70 transition"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            Create New Hackathon
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-200/40">
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex-1 md:pl-6">
        <div className="md:hidden mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900">IT Company</div>
            <div className="text-xs text-slate-500">Hackathon Management</div>
          </div>
          <Link href="/dashboard/it-company/hackathons/new">
            <Button size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New
            </Button>
          </Link>
        </div>

        <div>{children}</div>
      </div>
    </div>
  )
}
