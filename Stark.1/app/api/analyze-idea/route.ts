import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

type AnalyzerResult = {
  successProbability: number
  marketPosition: string
  revenuePotential: string
  risks: string[]
  competitorMatches: string[]
  summary: string
}

function clamp01To100(value: unknown) {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function safeStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((v) => typeof v === "string").slice(0, 12)
}

function extractJson(text: string) {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null
  const candidate = text.slice(start, end + 1)
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.error("[ANALYZE_IDEA] Missing NEXT_PUBLIC_GEMINI_API_KEY")
      return NextResponse.json({ error: "Missing API key configuration" }, { status: 500, headers: { "Content-Type": "application/json" } })
    }

    const body = (await req.json().catch(() => null)) as { idea?: unknown } | null
    const idea = safeString(body?.idea).trim()

    if (!idea) {
      return NextResponse.json({ error: "Missing 'idea'" }, { status: 400, headers: { "Content-Type": "application/json" } })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are an expert startup analyst.
Analyze the following startup idea and return ONLY valid JSON (no markdown, no backticks, no extra text).

Idea: ${JSON.stringify(idea)}

Return a JSON object with this exact shape:
{
  "successProbability": number (0-100),
  "marketPosition": string,
  "revenuePotential": string,
  "risks": string[],
  "competitorMatches": string[],
  "summary": string
}

Constraints:
- competitorMatches: 3-8 items max (names or short descriptions).
- risks: 3-8 items max.
- Keep strings concise and actionable.
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const parsed = extractJson(text)

    const normalized: AnalyzerResult = {
      successProbability: clamp01To100(parsed?.successProbability),
      marketPosition: safeString(parsed?.marketPosition, "Positioning unavailable"),
      revenuePotential: safeString(parsed?.revenuePotential, "Revenue outlook unavailable"),
      risks: safeStringArray(parsed?.risks),
      competitorMatches: safeStringArray(parsed?.competitorMatches),
      summary: safeString(parsed?.summary, "Analysis unavailable"),
    }

    return NextResponse.json(normalized, { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("[ANALYZE_IDEA] Gemini API Error:", error)
    return NextResponse.json({ error: "Failed to analyze idea" }, { status: 500, headers: { "Content-Type": "application/json" } })
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: "analyze-idea API is running" },
    { headers: { "Content-Type": "application/json" } }
  )
}
