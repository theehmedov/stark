import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"
import startupsData from "@/startups.json"

// Use service role key to bypass RLS for seeding
// Find this in Supabase Dashboard → Settings → API → service_role (secret)
const supabaseUrl = "https://bjsdagwquuontqgvdtdx.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Map funding type strings to our stage enum values
function mapStage(fundingType: string): string {
  const normalized = fundingType.toLowerCase().trim()
  if (normalized.includes("series a")) return "series_a"
  if (normalized.includes("series b")) return "series_b"
  if (normalized.includes("series c")) return "series_b"
  if (normalized.includes("series d")) return "series_b"
  if (normalized.includes("series e")) return "growth"
  if (normalized.includes("series f")) return "growth"
  if (normalized.includes("series g")) return "growth"
  if (normalized.includes("series h")) return "growth"
  if (normalized.includes("series i")) return "growth"
  if (normalized.includes("seed")) return "seed"
  if (normalized.includes("pre-seed")) return "pre_seed"
  if (normalized.includes("venture")) return "seed"
  if (normalized.includes("private")) return "growth"
  if (normalized.includes("strategic")) return "seed"
  return "mvp"
}

// Parse team size string like "50-100" or "1000-5000" to a number (take midpoint)
function parseTeamSize(sizeStr: string): number {
  const match = sizeStr.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)/)
  if (match) {
    const low = parseInt(match[1].replace(/,/g, ""))
    const high = parseInt(match[2].replace(/,/g, ""))
    return Math.round((low + high) / 2)
  }
  const single = parseInt(sizeStr.replace(/[^0-9]/g, ""))
  return single || 10
}

export async function GET(request: Request) {
  // Simple secret check to prevent accidental triggers
  const { searchParams } = new URL(request.url)
  const confirm = searchParams.get("confirm")

  if (confirm !== "yes") {
    return NextResponse.json({
      message: "Seed endpoint ready. Add ?confirm=yes to run. WARNING: This will insert 50 dummy startups.",
      count: (startupsData as any[]).length,
    })
  }

  if (!supabaseServiceKey) {
    return NextResponse.json(
      {
        error: "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local file.",
        hint: "Find it in Supabase Dashboard → Settings → API → service_role (secret key)",
      },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const results: { name: string; status: string; error?: string }[] = []
  let inserted = 0
  let skipped = 0

  for (const item of startupsData as any[]) {
    const name = item["Startup Name"]
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "")
    const email = `${slug}_${randomUUID().slice(0, 6)}@demo.stark.az`

    try {
      // 1. Create a real auth user via Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: "Password123!",
        email_confirm: true,
      })

      if (authError || !authData.user) {
        results.push({ name, status: "auth_error", error: authError?.message || "No user returned" })
        skipped++
        continue
      }

      const userId = authData.user.id

      // 2. Insert profile linked to the real auth user
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: name,
        role: "startup",
      })

      if (profileError) {
        results.push({ name, status: "profile_error", error: profileError.message })
        // Clean up auth user
        await supabase.auth.admin.deleteUser(userId)
        skipped++
        continue
      }

      // 3. Insert startup record
      const { error: startupError } = await supabase.from("startups").insert({
        user_id: userId,
        company_name: name,
        industry: item["Industry"],
        stage: mapStage(item["Last Funding Type"]),
        team_size: parseTeamSize(item["Team Size (Est.)"]),
        pitch_deck_url: null,
      })

      if (startupError) {
        results.push({ name, status: "startup_error", error: startupError.message })
        // Clean up profile and auth user
        await supabase.from("profiles").delete().eq("id", userId)
        await supabase.auth.admin.deleteUser(userId)
        skipped++
        continue
      }

      results.push({ name, status: "ok" })
      inserted++
    } catch (err: any) {
      results.push({ name, status: "exception", error: err.message })
      skipped++
    }
  }

  return NextResponse.json({
    message: `Seeding complete: ${inserted} inserted, ${skipped} skipped`,
    inserted,
    skipped,
    total: (startupsData as any[]).length,
    results,
  })
}
