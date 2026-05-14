"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileHeader } from "@/components/profile/profile-header"
import { VideoGrid } from "@/components/profile/video-grid"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { getUser } from "@/lib/store/user-store"
import { getUserVideos } from "@/lib/store/video-store"
import { useUser } from "@/components/providers/app-provider"
import type { Video, User } from "@/lib/types"

interface PageProps {
  params: Promise<{ userId: string }>
}

export default function UserProfilePage({ params }: PageProps) {
  const { userId } = use(params)
  const router = useRouter()
  const { currentUser } = useUser()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [userVideos, setUserVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (currentUser && userId === currentUser.id) {
      router.replace("/profile")
      return
    }

    async function load() {
      setIsLoading(true)
      const [user, videos] = await Promise.all([
        getUser(userId),
        getUserVideos(userId),
      ])
      setProfileUser(user)
      setUserVideos(videos)
      setIsLoading(false)
    }

    load()
  }, [userId, currentUser, router])

  if (isLoading) return null

  if (!profileUser) {
    return (
      <main className="min-h-dvh bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center h-14 px-4 gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="font-semibold text-foreground">Profil</h1>
          </div>
        </header>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Pengguna tidak ditemukan</p>
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="font-semibold text-foreground">@{profileUser.username}</h1>
        </div>
      </header>

      <ProfileHeader user={profileUser} videoCount={userVideos.length} isOwnProfile={false} />

      <div className="flex border-b border-border">
        <div className="flex-1 flex items-center justify-center gap-2 py-3 text-foreground border-b-2 border-foreground">
          <Grid3X3 className="size-5" />
        </div>
      </div>

      <VideoGrid videos={userVideos} />
      <BottomNav />
    </main>
  )
}
