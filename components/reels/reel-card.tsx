"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { VideoActions } from "./video-actions"
import type { Video } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReelCardProps {
  video: Video
  isActive: boolean
  onUserClick?: (userId: string) => void
}

export function ReelCard({ video, isActive, onUserClick }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(false)

  // Auto-play when active
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    if (isActive) {
      videoEl.play().catch(() => {
        // Autoplay failed, keep muted
      })
      setIsPlaying(true)
    } else {
      videoEl.pause()
      videoEl.currentTime = 0
      setIsPlaying(false)
    }
  }, [isActive])

  // Handle time update
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const handleTimeUpdate = () => {
      const prog = (videoEl.currentTime / videoEl.duration) * 100
      setProgress(isNaN(prog) ? 0 : prog)
    }

    const handleEnded = () => {
      videoEl.currentTime = 0
      videoEl.play()
    }

    videoEl.addEventListener("timeupdate", handleTimeUpdate)
    videoEl.addEventListener("ended", handleEnded)

    return () => {
      videoEl.removeEventListener("timeupdate", handleTimeUpdate)
      videoEl.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    if (isPlaying) {
      videoEl.pause()
    } else {
      videoEl.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    const videoEl = videoRef.current
    if (!videoEl) return
    videoEl.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleProgressChange = useCallback((value: number[]) => {
    const videoEl = videoRef.current
    if (!videoEl) return
    const newTime = (value[0] / 100) * videoEl.duration
    videoEl.currentTime = newTime
    setProgress(value[0])
  }, [])

  const handleVideoClick = useCallback(() => {
    setShowControls(true)
    togglePlay()
    // Hide controls after 3 seconds
    setTimeout(() => setShowControls(false), 3000)
  }, [togglePlay])

  return (
    <div className="relative h-dvh w-full snap-start bg-background flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={handleVideoClick}
        crossOrigin="anonymous"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

      {/* Play/Pause indicator */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-4 animate-in fade-in zoom-in duration-200">
            {isPlaying ? (
              <Pause className="size-12 text-white" />
            ) : (
              <Play className="size-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white drop-shadow-lg">Reels</h1>
      </div>

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        <VideoActions video={video} />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-20 left-0 right-16 p-4">
        {/* User info */}
        <button
          onClick={() => onUserClick?.(video.userId)}
          className="flex items-center gap-3 mb-3"
        >
          <Avatar className="size-10 ring-2 ring-white/20">
            <AvatarImage src={video.userAvatar} alt={video.username} />
            <AvatarFallback>{video.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold drop-shadow-lg">
            @{video.username}
          </span>
        </button>

        {/* Caption */}
        <p className="text-white text-sm drop-shadow-lg line-clamp-2">
          {video.caption}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
