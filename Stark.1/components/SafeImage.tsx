"use client"

import Image, { type ImageProps } from "next/image"
import { useMemo, useState } from "react"

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined
  alt: string
  fallbackText?: string
}

function makeSvgDataUri(label: string) {
  const safe = (label || "?").slice(0, 2).toUpperCase()
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#0f172a" offset="0" />
      <stop stop-color="#334155" offset="1" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="48" fill="url(#g)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="88" font-weight="800" fill="#ffffff">${safe}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function SafeImage({ src, alt, fallbackText, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false)

  const fallback = useMemo(() => makeSvgDataUri(fallbackText || alt), [fallbackText, alt])
  const safeSrc = !failed && src ? src : fallback

  return (
    <Image
      {...props}
      src={safeSrc}
      alt={alt}
      onError={() => setFailed(true)}
    />
  )
}
