import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ExternalLink, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SafeImage from "@/components/SafeImage"

type ProfileRow = {
  id: string
  role?: string | null
  full_name?: string | null
  avatar_url?: string | null
  website?: string | null
  bio?: string | null
  summary?: string | null
}

export default async function ExplorePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: communityProfiles, error: communityError } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "startup")
    .order("created_at", { ascending: false })

  if (communityError) {
    console.error("[DASHBOARD EXPLORE] profiles fetch error:", communityError.message)
  }

  const startupList = ((communityProfiles ?? []) as ProfileRow[]).filter((p) => p.id)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Search className="w-6 h-6 text-navy-500" />
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Explore Startups
          </h2>
        </div>
        <p className="text-slate-500 ml-9">
          Discover community startups on Stark
        </p>
      </div>

      {startupList.length === 0 ? (
        <EmptyState message="No community startups found yet" sub="Startups will appear here once they join." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {startupList.map((p) => {
            const name = p.full_name?.trim() || "Startup"
            const summary = (p.bio || p.summary || "No description provided by this startup.")?.toString()
            const website = (p.website || null)?.toString() || null
            const hasLogo = Boolean(p.avatar_url)

            return (
              <div
                key={p.id}
                className="group glass rounded-2xl border border-slate-200/60 overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                      Community Member
                    </Badge>
                  </div>

                  <div className="mt-4 relative w-full aspect-square rounded-xl bg-white/70 border border-slate-200/60 overflow-hidden">
                    {hasLogo ? (
                      <SafeImage
                        src={p.avatar_url as string}
                        alt={`${name} logo`}
                        fallbackText={name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-navy-600 text-white flex items-center justify-center text-3xl font-extrabold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{name}</h3>
                    <p
                      className="mt-2 text-sm text-slate-600"
                      style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {summary}
                    </p>
                  </div>

                  <div className="mt-5">
                    {website ? (
                      <Link href={website} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className="w-full" variant="default">
                          Visit Website
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" variant="secondary" disabled>
                        Website coming soon
                      </Button>
                    )}
                  </div>
                </div>

                <div className="h-1 w-full bg-gradient-to-r from-navy-500/0 via-navy-500/20 to-navy-500/0" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-lg font-semibold text-slate-400 mb-1">{message}</p>
      <p className="text-sm text-slate-300">{sub}</p>
    </div>
  )
}
