"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ReelCard } from "./reel-card"
import type { Video } from "@/lib/types"
import { useRouter } from "next/navigation"

interface ReelViewerProps {
  videos: Video[]
  initialIndex?: number
}

export function ReelViewer({ videos, initialIndex = 0 }: ReelViewerProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  // Handle scroll to detect active video
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollTop = container.scrollTop
    const itemHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / itemHeight)

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < videos.length) {
      setActiveIndex(newIndex)
    }
  }, [activeIndex, videos.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Scroll to initial index
  useEffect(() => {
    const container = containerRef.current
    if (!container || initialIndex === 0) return

    container.scrollTo({
      top: initialIndex * container.clientHeight,
      behavior: "instant",
    })
  }, [initialIndex])

  const handleUserClick = useCallback((userId: string) => {
    router.push(`/profile/${userId}`)
  }, [router])

  if (videos.length === 0) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">No videos yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to upload a video!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full overflow-y-scroll snap-y-mandatory hide-scrollbar"
    >
      {videos.map((video, index) => (
        <ReelCard
          key={video.id}
          video={video}
          isActive={index === activeIndex}
          onUserClick={handleUserClick}
        />
      ))}
    </div>
  )
}
