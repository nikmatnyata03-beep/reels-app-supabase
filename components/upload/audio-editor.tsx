"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Music, Upload, Play, Pause, Volume2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AudioEditorProps {
  videoUrl: string
  onAudioSelect: (file: File | null, previewUrl: string | null) => void
  selectedAudio: File | null
  audioPreviewUrl: string | null
  videoVolume: number
  audioVolume: number
  onVideoVolumeChange: (volume: number) => void
  onAudioVolumeChange: (volume: number) => void
}

export function AudioEditor({
  videoUrl,
  onAudioSelect,
  selectedAudio,
  audioPreviewUrl,
  videoVolume,
  audioVolume,
  onVideoVolumeChange,
  onAudioVolumeChange,
}: AudioEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync video and audio playback
  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current

    if (!video) return

    video.volume = videoVolume / 100

    if (audio) {
      audio.volume = audioVolume / 100
    }
  }, [videoVolume, audioVolume])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file")
      return
    }
    const url = URL.createObjectURL(file)
    onAudioSelect(file, url)
    toast.success("Audio added!")
  }, [onAudioSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handlePlayPause = () => {
    const video = videoRef.current
    const audio = audioRef.current

    if (!video) return

    if (isPlaying) {
      video.pause()
      audio?.pause()
    } else {
      video.currentTime = 0
      if (audio) audio.currentTime = 0
      video.play()
      audio?.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handleRemoveAudio = () => {
    onAudioSelect(null, null)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Preview with audio */}
      <div className="relative aspect-[9/16] max-h-[40vh] bg-secondary rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          playsInline
          muted={videoVolume === 0}
          onEnded={handleVideoEnded}
        />
        
        {audioPreviewUrl && (
          <audio ref={audioRef} src={audioPreviewUrl} />
        )}

        {/* Play button overlay */}
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="size-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            {isPlaying ? (
              <Pause className="size-8 text-white" />
            ) : (
              <Play className="size-8 text-white ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Audio selection */}
      {!selectedAudio ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          
          <div className="size-12 rounded-full bg-secondary flex items-center justify-center">
            <Music className="size-6 text-muted-foreground" />
          </div>
          
          <div className="text-center">
            <p className="font-medium text-foreground">Add Music/Sound</p>
            <p className="text-sm text-muted-foreground">
              Upload an audio file to overlay
            </p>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="size-4" />
            Choose Audio
          </Button>
        </div>
      ) : (
        <div className="bg-secondary rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Music className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm truncate max-w-[200px]">
                  {selectedAudio.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedAudio.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveAudio}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Volume controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">Video Volume</span>
              <Slider
                value={[videoVolume]}
                onValueChange={(v) => onVideoVolumeChange(v[0])}
                max={100}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">{videoVolume}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">Music Volume</span>
              <Slider
                value={[audioVolume]}
                onValueChange={(v) => onAudioVolumeChange(v[0])}
                max={100}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">{audioVolume}%</span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Note: Audio will be uploaded separately. Final mixing happens in playback.
      </p>
    </div>
  )
}
