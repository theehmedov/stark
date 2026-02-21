"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, TrendingUp, DollarSign, AlertTriangle, Search, ArrowRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type AnalyzerResult = {
  successProbability: number
  marketPosition: string
  revenuePotential: string
  risks: string[]
  competitorMatches: string[]
  summary: string
}

const loadingSteps = ["Analyzing Market...", "Checking Competitors...", "Calculating Success Rate...", "Identifying Risks..."]

function clampPercent(v: unknown) {
  const n = typeof v === "number" ? v : Number(v)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function Gauge({ value }: { value: number }) {
  const pct = clampPercent(value)
  const radius = 44
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const tone = pct >= 70 ? "text-emerald-600" : pct >= 45 ? "text-gold-600" : "text-rose-600"

  return (
    <div className="relative w-28 h-28">
      <svg height={radius * 2} width={radius * 2} className="w-full h-full">
        <circle
          stroke="rgba(148,163,184,0.25)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={tone}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-extrabold text-slate-900 leading-none">{pct}%</div>
        <div className="mt-1 text-[11px] font-semibold text-slate-500">Success</div>
      </div>
    </div>
  )
}

export default function PublicIdeaAnalyzerHero() {
  const [idea, setIdea] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState(loadingSteps[0])
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzerResult | null>(null)

  useEffect(() => {
    if (!loading) return

    let idx = 0
    setLoadingLabel(loadingSteps[0])

    const id = window.setInterval(() => {
      idx = (idx + 1) % loadingSteps.length
      setLoadingLabel(loadingSteps[idx])
    }, 900)

    return () => window.clearInterval(id)
  }, [loading])

  const canAnalyze = useMemo(() => idea.trim().length >= 12 && !loading, [idea, loading])

  async function onAnalyze() {
    const trimmed = idea.trim()
    if (trimmed.length < 12) {
      setError("Please describe your idea a bit more (at least 12 characters).")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/analyze-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError((data && typeof data.error === "string" && data.error) || "Failed to analyze idea.")
        return
      }

      setResult(data as AnalyzerResult)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16">
      <div className="glass rounded-2xl border border-slate-200/40 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-navy-200/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-gold-200/15 blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-slate-200/60 px-4 py-1.5">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span className="text-xs font-semibold text-slate-700 tracking-wide">Public AI Analyzer</span>
            </div>

            <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Validate Your Idea with AI
            </h2>
            <p className="mt-3 text-slate-500 text-[15px] leading-relaxed max-w-xl">
              Describe your startup in one sentence. We’ll estimate success probability, map your market position, and highlight
              competitor matches — instantly.
            </p>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold-200/40 via-navy-200/25 to-gold-200/40 blur-md opacity-70" />
                <div className="relative flex flex-col sm:flex-row gap-3 p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200/60">
                  <div className="flex-1">
                    <Input
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="E.g. AI platform that helps small businesses automate invoicing and cashflow forecasting..."
                      className="h-12 text-sm sm:text-[15px]"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={onAnalyze}
                    disabled={!canAnalyze}
                    className="h-12 px-6 rounded-xl shadow-lg shadow-navy-600/20"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Analyzing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Analyze Now
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-4 flex items-center gap-3"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-[0_0_18px_rgba(234,179,8,0.6)]" />
                    <div className="text-sm font-semibold text-slate-600">{loadingLabel}</div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-4 text-sm font-semibold text-rose-600"
                  >
                    {error}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <AnimatePresence>
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="rounded-2xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-6 shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-900">AI Snapshot</div>
                      <div className="mt-1 text-xs text-slate-500">Instant assessment (not financial advice)</div>
                    </div>
                    <Gauge value={result.successProbability} />
                  </div>

                  <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200/50 bg-white/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <TrendingUp className="w-4 h-4 text-navy-600" />
                        Market Position
                      </div>
                      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{result.marketPosition}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200/50 bg-white/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <DollarSign className="w-4 h-4 text-gold-600" />
                        Revenue Potential
                      </div>
                      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{result.revenuePotential}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200/50 bg-white/50 p-4">
                    <div className="text-sm font-extrabold text-slate-900">Summary</div>
                    <div className="mt-2 text-sm text-slate-600 leading-relaxed">{result.summary}</div>
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200/50 bg-white/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Key Risks
                      </div>
                      <div className="mt-2 space-y-2">
                        {(result.risks?.length ? result.risks : ["No risks returned"]).slice(0, 8).map((r, i) => (
                          <div key={i} className="text-sm text-slate-600 leading-snug">
                            {r}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/50 bg-white/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <Search className="w-4 h-4 text-navy-600" />
                        Competitor Match
                      </div>
                      <div className="mt-2 space-y-2">
                        {(result.competitorMatches?.length ? result.competitorMatches : ["No matches returned"]).slice(0, 8).map((c, i) => (
                          <div key={i} className="text-sm text-slate-600 leading-snug">
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      <span className="font-extrabold text-slate-900">Want a more detailed 10-page report?</span>
                      <div className="text-xs text-slate-500 mt-0.5">Sign up as a startup to unlock deeper analysis and tools.</div>
                    </div>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-navy-600 rounded-xl px-5 py-3 shadow-md shadow-navy-600/25 hover:bg-navy-500 hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 active:scale-[0.98]"
                    >
                      Sign Up as a Startup <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200/60 bg-white/45 backdrop-blur-md p-6"
                >
                  <div className="text-sm font-extrabold text-slate-900">Interactive Dashboard</div>
                  <div className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Enter your idea and click <span className="font-semibold text-slate-700">Analyze Now</span> to see a live report here.
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200/50 bg-white/50 p-4">
                      <div className="text-xs font-semibold text-slate-500">Success Probability</div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200/50 overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-gold-400 to-navy-500" />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Calculated after analysis</div>
                    </div>
                    <div className="rounded-xl border border-slate-200/50 bg-white/50 p-4">
                      <div className="text-xs font-semibold text-slate-500">Competitor Match</div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2 rounded bg-slate-200/50 w-4/5" />
                        <div className="h-2 rounded bg-slate-200/50 w-3/5" />
                        <div className="h-2 rounded bg-slate-200/50 w-2/3" />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Similar startups listed by AI</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
