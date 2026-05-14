"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoUploaderProps {
  onVideoSelect: (file: File, previewUrl: string) => void
  selectedVideo: File | null
  previewUrl: string | null
  onClear: () => void
}

export function VideoUploader({ 
  onVideoSelect, 
  selectedVideo, 
  previewUrl, 
  onClear 
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      return
    }
    const url = URL.createObjectURL(file)
    onVideoSelect(file, url)
  }, [onVideoSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  if (selectedVideo && previewUrl) {
    return (
      <div className="relative aspect-[9/16] max-h-[60vh] bg-secondary rounded-xl overflow-hidden">
        <video
          src={previewUrl}
          className="h-full w-full object-contain"
          controls
          playsInline
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
          onClick={onClear}
        >
          <X className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative aspect-[9/16] max-h-[60vh] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleInputChange}
      />
      
      <div className="size-16 rounded-full bg-secondary flex items-center justify-center">
        <Upload className="size-8 text-muted-foreground" />
      </div>
      
      <div className="text-center px-4">
        <p className="font-medium text-foreground">
          Drag and drop a video
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse
        </p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Video className="size-4" />
        <span>MP4, WebM, MOV</span>
      </div>
    </div>
  )
}
