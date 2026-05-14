"use client"

import { Play } from "lucide-react"
import type { Video } from "@/lib/types"
import { cn } from "@/lib/utils"

interface VideoGridProps {
  videos: Video[]
  onVideoClick?: (video: Video, index: number) => void
}

export function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No videos yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {videos.map((video, index) => (
        <button
          key={video.id}
          onClick={() => onVideoClick?.(video, index)}
          className="relative aspect-[9/16] bg-secondary overflow-hidden group"
        >
          <video
            src={video.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="size-8 text-white fill-white" />
          </div>
        </button>
      ))}
    </div>
  )
}
