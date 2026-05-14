"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VideoGrid } from "@/components/profile/video-grid"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { AuthModal } from "@/components/auth/auth-modal"
import { useUser } from "@/components/providers/app-provider"
import { getSavedVideosList } from "@/lib/store/video-store"
import type { Video } from "@/lib/types"

export default function SavedPage() {
  const router = useRouter()
  const { currentUser } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [savedVideosList, setSavedVideosList] = useState<Video[]>([])

  useEffect(() => {
    if (!currentUser) { setShowAuthModal(true); return }
    getSavedVideosList(currentUser.id).then(setSavedVideosList)
  }, [currentUser])

  if (!currentUser) {
    return (
      <main className="min-h-dvh bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center h-14 px-4 gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="size-5" /></Button>
            <h1 className="font-semibold text-foreground">Tersimpan</h1>
          </div>
        </header>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Silakan masuk untuk melihat video tersimpan</p>
        </div>
        <BottomNav />
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="size-5" /></Button>
          <h1 className="font-semibold text-foreground">Tersimpan</h1>
        </div>
      </header>

      {savedVideosList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="size-16 rounded-full bg-secondary flex items-center justify-center">
            <Bookmark className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Belum ada video tersimpan</p>
            <p className="text-sm text-muted-foreground mt-1">Video yang Anda simpan akan muncul di sini</p>
          </div>
        </div>
      ) : (
        <VideoGrid videos={savedVideosList} />
      )}
      <BottomNav />
    </main>
  )
}
