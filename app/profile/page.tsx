"use client"

import { useState, useEffect } from "react"
import { Grid3X3, Bookmark } from "lucide-react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { VideoGrid } from "@/components/profile/video-grid"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { AuthModal } from "@/components/auth/auth-modal"
import { useUser } from "@/components/providers/app-provider"
import { getUserVideos, getSavedVideosList } from "@/lib/store/video-store"
import type { Video } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { currentUser } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"videos" | "saved">("videos")
  const [userVideos, setUserVideos] = useState<Video[]>([])
  const [savedVideosList, setSavedVideosList] = useState<Video[]>([])

  useEffect(() => {
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }
    Promise.all([
      getUserVideos(currentUser.id),
      getSavedVideosList(currentUser.id),
    ]).then(([myVideos, savedVideos]) => {
      setUserVideos(myVideos)
      setSavedVideosList(savedVideos)
    })
  }, [currentUser])

  if (!currentUser) {
    return (
      <main className="min-h-dvh bg-background pb-20">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Silakan masuk untuk melihat profil Anda</p>
        </div>
        <BottomNav />
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background pb-20">
      <ProfileHeader user={currentUser} videoCount={userVideos.length} isOwnProfile={true} />

      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("videos")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-3 transition-colors",
            activeTab === "videos" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground")}
        >
          <Grid3X3 className="size-5" />
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-3 transition-colors",
            activeTab === "saved" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground")}
        >
          <Bookmark className="size-5" />
        </button>
      </div>

      {activeTab === "videos" && <VideoGrid videos={userVideos} />}
      {activeTab === "saved" && <VideoGrid videos={savedVideosList} />}

      <BottomNav />
    </main>
  )
}
