"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { VideoUploader } from "@/components/upload/video-uploader"
import { AudioEditor } from "@/components/upload/audio-editor"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { AuthModal } from "@/components/auth/auth-modal"
import { useUser } from "@/components/providers/app-provider"
import { insertVideo } from "@/lib/store/video-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Step = "video" | "audio" | "details"

export default function UploadPage() {
  const router = useRouter()
  const { currentUser } = useUser()
  const [step, setStep] = useState<Step>("video")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [videoVolume, setVideoVolume] = useState(100)
  const [audioVolume, setAudioVolume] = useState(80)
  const [caption, setCaption] = useState("")

  const handleVideoSelect = useCallback((file: File, previewUrl: string) => {
    setVideoFile(file)
    setVideoPreviewUrl(previewUrl)
  }, [])

  const handleClearVideo = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
    setVideoFile(null); setVideoPreviewUrl(null)
    setAudioFile(null); setAudioPreviewUrl(null)
    setStep("video")
  }, [videoPreviewUrl, audioPreviewUrl])

  const handleAudioSelect = useCallback((file: File | null, previewUrl: string | null) => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl)
    setAudioFile(file)
    setAudioPreviewUrl(previewUrl)
  }, [audioPreviewUrl])

  const handleUpload = async () => {
    if (!currentUser) { setShowAuthModal(true); return }
    if (!videoFile) { toast.error("Pilih video terlebih dahulu"); return }

    setIsUploading(true)
    try {
      // Upload video to Vercel Blob via existing API route
      const videoFormData = new FormData()
      videoFormData.append("file", videoFile)
      videoFormData.append("type", "video")

      const videoRes = await fetch("/api/upload", { method: "POST", body: videoFormData })
      if (!videoRes.ok) throw new Error("Gagal upload video")
      const videoData = await videoRes.json()

      // Upload audio if provided
      let audioUrl: string | undefined
      if (audioFile) {
        const audioFormData = new FormData()
        audioFormData.append("file", audioFile)
        audioFormData.append("type", "audio")
        const audioRes = await fetch("/api/upload", { method: "POST", body: audioFormData })
        if (audioRes.ok) {
          const audioData = await audioRes.json()
          audioUrl = audioData.url
        }
      }

      // Save metadata to Supabase
      await insertVideo({
        url: videoData.url,
        caption,
        audio_url: audioUrl,
        user_id: currentUser.id,
      })

      toast.success("Video berhasil diposting!")
      router.push("/")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Gagal mengupload video")
    } finally {
      setIsUploading(false)
    }
  }

  const steps = ["video", "audio", "details"] as const

  return (
    <main className="min-h-dvh bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <Button
            variant="ghost" size="icon"
            onClick={() => {
              if (step === "audio") setStep("video")
              else if (step === "details") setStep("audio")
              else router.back()
            }}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="font-semibold text-foreground">
            {step === "video" && "Pilih Video"}
            {step === "audio" && "Tambah Suara"}
            {step === "details" && "Detail Postingan"}
          </h1>
          <div className="w-9" />
        </div>
        <div className="flex gap-1 px-4 pb-3">
          {steps.map((s, i) => (
            <div key={s} className={cn("h-1 flex-1 rounded-full transition-colors",
              steps.indexOf(step) >= i ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {step === "video" && (
          <div className="flex flex-col gap-6">
            <VideoUploader
              onVideoSelect={handleVideoSelect}
              selectedVideo={videoFile}
              previewUrl={videoPreviewUrl}
              onClear={handleClearVideo}
            />
            {videoFile && (
              <Button onClick={() => setStep("audio")} className="gap-2">
                Lanjut: Tambah Suara <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        )}

        {step === "audio" && videoPreviewUrl && (
          <div className="flex flex-col gap-6">
            <AudioEditor
              videoUrl={videoPreviewUrl}
              onAudioSelect={handleAudioSelect}
              selectedAudio={audioFile}
              audioPreviewUrl={audioPreviewUrl}
              videoVolume={videoVolume}
              audioVolume={audioVolume}
              onVideoVolumeChange={setVideoVolume}
              onAudioVolumeChange={setAudioVolume}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("video")} className="flex-1">Kembali</Button>
              <Button onClick={() => setStep("details")} className="flex-1 gap-2">Lanjut <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="flex flex-col gap-6">
            {videoPreviewUrl && (
              <div className="aspect-[9/16] max-h-[30vh] bg-secondary rounded-xl overflow-hidden mx-auto">
                <video src={videoPreviewUrl} className="h-full w-full object-contain" muted playsInline />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tulis caption..."
                className="bg-secondary border-border resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("audio")} className="flex-1">Kembali</Button>
              <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
                {isUploading ? <><Loader2 className="size-4 animate-spin mr-2" />Mengupload...</> : "Posting"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={() => { setShowAuthModal(false); handleUpload() }} />
    </main>
  )
}
