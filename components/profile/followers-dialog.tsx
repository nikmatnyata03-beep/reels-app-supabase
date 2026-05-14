"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getFollowers, getFollowing, isFollowing, followUser, unfollowUser } from "@/lib/store/follow-store"
import { getUser } from "@/lib/store/user-store"
import { useUser } from "@/components/providers/app-provider"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface FollowersDialogProps {
  userId: string
  type: "followers" | "following"
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FollowersDialog({ userId, type, open, onOpenChange }: FollowersDialogProps) {
  const router = useRouter()
  const { currentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open) return

    async function load() {
      const ids = type === "followers" ? await getFollowers(userId) : await getFollowing(userId)
      const loaded = (await Promise.all(ids.map((id) => getUser(id)))).filter(Boolean) as User[]
      setUsers(loaded)

      if (currentUser) {
        const entries = await Promise.all(
          loaded.map(async (u) => [u.id, await isFollowing(currentUser.id, u.id)] as const)
        )
        setFollowingState(Object.fromEntries(entries))
      }
    }
    load()
  }, [open, userId, type, currentUser])

  const handleFollow = async (targetUserId: string, targetUsername: string) => {
    if (!currentUser) { toast.error("Silakan masuk terlebih dahulu"); return }
    const currently = followingState[targetUserId]
    if (currently) {
      await unfollowUser(currentUser.id, targetUserId)
      toast.success(`Berhenti follow @${targetUsername}`)
    } else {
      await followUser(currentUser.id, targetUserId)
      toast.success(`Mengikuti @${targetUsername}`)
    }
    setFollowingState((prev) => ({ ...prev, [targetUserId]: !currently }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-80">
          {users.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">
                {type === "followers" ? "Belum ada followers" : "Belum mengikuti siapapun"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <button
                    onClick={() => { onOpenChange(false); router.push(`/profile/${user.id}`) }}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="size-10">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </button>
                  {currentUser && currentUser.id !== user.id && (
                    <Button
                      size="sm"
                      variant={followingState[user.id] ? "outline" : "default"}
                      onClick={() => handleFollow(user.id, user.username)}
                    >
                      {followingState[user.id] ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
