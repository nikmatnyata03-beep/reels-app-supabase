"use client"

import { useState, useEffect } from "react"
import { Settings, LogOut } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FollowersDialog } from "./followers-dialog"
import { useUser } from "@/components/providers/app-provider"
import {
  getFollowerCount,
  getFollowingCount,
  isFollowing,
  followUser,
  unfollowUser,
} from "@/lib/store/follow-store"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface ProfileHeaderProps {
  user: User
  videoCount: number
  isOwnProfile: boolean
}

export function ProfileHeader({ user, videoCount, isOwnProfile }: ProfileHeaderProps) {
  const { currentUser, signOut } = useUser()
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [following, setFollowing] = useState(false)
  const [showFollowersDialog, setShowFollowersDialog] = useState(false)
  const [dialogType, setDialogType] = useState<"followers" | "following">("followers")

  useEffect(() => {
    async function loadCounts() {
      const [fc, fwc, fw] = await Promise.all([
        getFollowerCount(user.id),
        getFollowingCount(user.id),
        currentUser && !isOwnProfile
          ? isFollowing(currentUser.id, user.id)
          : Promise.resolve(false),
      ])
      setFollowerCount(fc)
      setFollowingCount(fwc)
      setFollowing(fw)
    }
    loadCounts()
  }, [user.id, currentUser, isOwnProfile])

  const handleFollow = async () => {
    if (!currentUser) { toast.error("Silakan masuk terlebih dahulu"); return }
    if (following) {
      await unfollowUser(currentUser.id, user.id)
      setFollowerCount((p) => p - 1)
      toast.success(`Berhenti follow @${user.username}`)
    } else {
      await followUser(currentUser.id, user.id)
      setFollowerCount((p) => p + 1)
      toast.success(`Mengikuti @${user.username}`)
    }
    setFollowing(!following)
  }

  const handleLogout = async () => {
    await signOut()
    toast.success("Berhasil keluar")
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-6">
        <Avatar className="size-24 ring-4 ring-primary/20">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback className="text-2xl">{user.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">{user.displayName}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>

        {user.bio && (
          <p className="text-sm text-foreground text-center max-w-xs">{user.bio}</p>
        )}

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{videoCount}</p>
            <p className="text-xs text-muted-foreground">Video</p>
          </div>
          <button onClick={() => { setDialogType("followers"); setShowFollowersDialog(true) }} className="text-center">
            <p className="text-lg font-bold text-foreground">{followerCount}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button onClick={() => { setDialogType("following"); setShowFollowersDialog(true) }} className="text-center">
            <p className="text-lg font-bold text-foreground">{followingCount}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isOwnProfile ? (
            <>
              <Button variant="outline" className="gap-2">
                <Settings className="size-4" />
                Edit Profil
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant={following ? "outline" : "default"} onClick={handleFollow} className="min-w-[100px]">
                {following ? "Following" : "Follow"}
              </Button>
              <Button variant="outline">Pesan</Button>
            </>
          )}
        </div>
      </div>

      <FollowersDialog
        userId={user.id}
        type={dialogType}
        open={showFollowersDialog}
        onOpenChange={setShowFollowersDialog}
      />
    </>
  )
}
