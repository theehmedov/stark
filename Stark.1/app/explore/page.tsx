import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import SafeImage from "@/components/SafeImage"

const startups = [
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
    summary:
      "Askiva is an AI-powered platform for automating research interviews. It manages the entire interview workflow.",
  },
  {
    name: "Your Academy",
    url: null,
    logo: "https://storage.googleapis.com/dealroom-images-production/18/MTAwOjEwMDpjb21wYW55QHMzLWV1LXdlc3QtMS5hbWF6b25hd3MuY29tL2RlYWxyb29tLWltYWdlcy8yMDI1LzExLzE0L2JhM2ZlNTNmOWUxYzM1NzdhNzhhNDg1ZTc4MDE0ODBi.png",
    summary:
      "Educational entity based in Azerbaijan providing professional training services for individual and corporate clients.",
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
    summary:
      "Offers English language instruction and mentorship specializing in test preparation (IELTS, TOEFL, SAT).",
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
] as const

export default function ExplorePage() {
  return (
    <div className="min-h-screen gradient-subtle gradient-mesh">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Explore Startups</h1>
          <p className="mt-2 text-slate-500">Discover innovative companies from Azerbaijan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {startups.map((s) => {
            const hasUrl = Boolean(s.url)

            return (
              <div
                key={s.name}
                className="group glass rounded-2xl border border-slate-200/60 overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="relative w-full aspect-square rounded-xl bg-white/70 border border-slate-200/60 overflow-hidden">
                    <SafeImage
                      src={s.logo}
                      alt={`${s.name} logo`}
                      fallbackText={s.name}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{s.name}</h3>
                    <p
                      className="mt-2 text-sm text-slate-600"
                      style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {s.summary}
                    </p>
                  </div>

                  <div className="mt-5">
                    {hasUrl ? (
                      <Link href={s.url as string} target="_blank" rel="noopener noreferrer" className="block">
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
      </div>
    </div>
  )
}
