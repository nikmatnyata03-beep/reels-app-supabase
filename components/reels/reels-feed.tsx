"use client"

import { useEffect, useState } from "react"
import { ReelViewer } from "./reel-viewer"
import type { Video } from "@/lib/types"
import { getFeedVideos } from "@/lib/store/video-store"
import { Loader2 } from "lucide-react"

export function ReelsFeed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getFeedVideos()
      .then(setVideos)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Gagal memuat video</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center bg-background gap-3">
        <p className="text-muted-foreground text-lg">Belum ada video</p>
        <p className="text-muted-foreground text-sm">Jadilah yang pertama upload!</p>
      </div>
    )
  }

  return <ReelViewer videos={videos} />
}
