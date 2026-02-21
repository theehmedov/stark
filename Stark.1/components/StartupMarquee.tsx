"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { animate, motion, useMotionValue } from "framer-motion"

import SafeImage from "@/components/SafeImage"

type FeaturedStartup = {
  name: string
  url: string | null
  logo: string
  summary: string
}

const featuredStartups: FeaturedStartup[] = [
  {
    name: "Corescout",
    url: "http://corescout.app/",
    logo: "https://storage.googleapis.com/dealroom-images-production/09/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI2LzAxLzI0LzNhMzYwZjUzNjE3ZmRjMmUyMmE2MzM0MjI0OTA1MDM2.png",
    summary:
      "Corescout provides a professional football scouting platform that utilizes artificial intelligence to bridge the gap between raw statistics and video analysis for recruitment decisions.",
  },
  {
    name: "Askiva",
    url: "http://askiva.io/",
    logo: "https://storage.googleapis.com/dealroom-images-production/e8/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI2LzAxLzI0Lzg5M2MyMzVlMzZkZGIzMjAxZmMwMTZiMDgyODQ0ZWJm.png",
    summary: "Askiva is an AI-powered platform for automating research interviews. It manages the entire interview workflow.",
  },
  {
    name: "Your Academy",
    url: null,
    logo: "https://storage.googleapis.com/dealroom-images-production/18/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzExLzE0L2JhM2ZlNTNmOWUxYzM1NzdhNzhhNDg1ZTc4MDE0ODBi.png",
    summary: "Educational entity based in Azerbaijan providing professional training services for individual and corporate clients.",
  },
  {
    name: "EduVia",
    url: "http://eduvia-az.com/",
    logo: "https://storage.googleapis.com/dealroom-images-production/0c/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzExLzA1LzVhNzM4MTkwZDczODhmOWY3OThjY2EyYjFmZWVmZDg4.png",
    summary: "EduVia is an educational technology firm focused on the Azerbaijani market.",
  },
  {
    name: "Englisshe",
    url: "http://englisshe.com/",
    logo: "https://storage.googleapis.com/dealroom-images-production/a6/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzEwL2EyOTFlMzY2ODdjMjJjZmVkOTI4YWIzYzk4MjEyYzg4.png",
    summary: "Offers English language instruction and mentorship specializing in test preparation (IELTS, TOEFL, SAT).",
  },
  {
    name: "Yuvam",
    url: "https://yuvam.az/",
    logo: "https://storage.googleapis.com/dealroom-images-production/57/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzAxL2I5M2VhMzJjMGJlMDVhZmJiOTlmNTM4MzI3YzhkMWNi.png",
    summary: "Home insurance product offered by PASHA Insurance in Azerbaijan.",
  },
  {
    name: "StarKid Stories",
    url: "https://starkidstories.com/",
    logo: "https://storage.googleapis.com/dealroom-images-production/a9/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzAxL2Y3OWJkNDBlZWVkY2MyZjhkNjQ3NTA3NGU3YmJlNTg2.png",
    summary: "Creates personalized children's books to make learning engaging and fun.",
  },
  {
    name: "KinoBox",
    url: "https://kinobox.az/",
    logo: "https://storage.googleapis.com/dealroom-images-production/2c/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzAxLzAwYzVhNzlmNTFjZDk1M2FkM2E2ZTFkYmI2ZDg4OWY2.png",
    summary: "Digital cinema platform dedicated to Azerbaijani films.",
  },
  {
    name: "Dapti",
    url: "https://dapti.az/",
    logo: "https://storage.googleapis.com/dealroom-images-production/0f/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzAxL2NhYjg2ZTc1ODRiY2Y2ZGZjYjMxMjExNGI4NjZhZjdh.png",
    summary: "AI-driven platform to assist university students with adaptive exam preparation.",
  },
  {
    name: "CleanX",
    url: "https://cleanx.bio/",
    logo: "https://storage.googleapis.com/dealroom-images-production/25/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzAxLzVmYjYxMmNmY2JiY2EwMmY4N2ZjNjRjOWQ4NGIwZDJh.png",
    summary: "Converts waste cooking oil into high-performance, biodegradable cleaning solutions.",
  },
  {
    name: "BoardX",
    url: "https://boardx.life/",
    logo: "https://storage.googleapis.com/dealroom-images-production/50/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzAxL2RjZWI2MmJiZmM5YmUwYWZhOTE2NjAxNWE1ZGViZjlh.png",
    summary: "AI-powered visual platform for collaboration and design thinking.",
  },
  {
    name: "Backlify",
    url: "http://backlify.app/",
    logo: "https://storage.googleapis.com/dealroom-images-production/80/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzEwLzAxLzUwMTg1MGMxZjM2NTA1ZTFiNTVjYzc4YzJiZjg3ZmY0.png",
    summary: "Build production-ready APIs using natural language.",
  },
]

function clampOneLine(text: string) {
  return text
}

function MarqueeRow({ items, direction }: { items: FeaturedStartup[]; direction: "left" | "right" }) {
  const baseItems = useMemo(() => items, [items])
  const duplicated = useMemo(() => [...baseItems, ...baseItems], [baseItems])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)

  const x = useMotionValue(0)
  const [distance, setDistance] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return

    const update = () => {
      const total = inner.scrollWidth
      setDistance(total / 2)
      x.set(direction === "left" ? 0 : -total / 2)
    }

    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(inner)

    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction])

  useEffect(() => {
    if (!distance) return

    const from = direction === "left" ? 0 : -distance
    const to = direction === "left" ? -distance : 0

    if (paused) return

    x.set(from)

    const duration = 28
    const controls = animate(x, to, {
      duration,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    })

    return () => controls.stop()
  }, [direction, distance, paused, x])

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <motion.div ref={innerRef} style={{ x }} className="flex w-max gap-4 will-change-transform">
        {duplicated.map((s, idx) => {
          const card = (
            <div
              className="glass border border-slate-200/60 bg-white/30 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-2xl px-4 py-3 w-[240px] sm:w-[260px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-white/60 border border-slate-200/70 overflow-hidden shrink-0">
                  <SafeImage
                    src={s.logo}
                    alt={`${s.name} logo`}
                    fallbackText={s.name}
                    fill
                    className="object-contain p-1.5"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 truncate">{s.name}</div>
                  <div className="text-xs text-slate-600 truncate">{clampOneLine(s.summary)}</div>
                </div>
              </div>
            </div>
          )

          return s.url ? (
            <Link key={`${s.name}-${idx}`} href={s.url} target="_blank" rel="noopener noreferrer" className="block">
              {card}
            </Link>
          ) : (
            <div key={`${s.name}-${idx}`} className="opacity-80">
              {card}
            </div>
          )
        })}
      </motion.div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-white/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-white/70 to-transparent" />
    </div>
  )
}

export default function StartupMarquee() {
  const row1 = featuredStartups.slice(0, 6)
  const row2 = featuredStartups.slice(6)

  return (
    <div className="space-y-4">
      <MarqueeRow items={row1} direction="left" />
      <MarqueeRow items={row2} direction="right" />
    </div>
  )
}
