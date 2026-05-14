"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Send, Bookmark, Plus } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ShareDialog } from "./share-dialog"
import { useUser } from "@/components/providers/app-provider"
import {
  isVideoLiked,
  likeVideo,
  unlikeVideo,
  getLikeCount,
  isVideoSaved,
  saveVideo,
  unsaveVideo,
} from "@/lib/store/video-store"
import { isFollowing, followUser, unfollowUser } from "@/lib/store/follow-store"
import type { Video } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface VideoActionsProps {
  video: Video
}

export function VideoActions({ video }: VideoActionsProps) {
  const { currentUser } = useUser()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  useEffect(() => {
    async function loadState() {
      const [lc, lk, sv, fw] = await Promise.all([
        getLikeCount(video.id),
        currentUser ? isVideoLiked(video.id, currentUser.id) : Promise.resolve(false),
        currentUser ? isVideoSaved(video.id, currentUser.id) : Promise.resolve(false),
        currentUser ? isFollowing(currentUser.id, video.userId) : Promise.resolve(false),
      ])
      setLikeCount(lc)
      setLiked(lk)
      setSaved(sv)
      setFollowing(fw)
    }
    loadState()
  }, [video.id, video.userId, currentUser])

  const handleLike = async () => {
    if (!currentUser) { toast.error("Silakan masuk terlebih dahulu"); return }
    if (liked) {
      await unlikeVideo(video.id, currentUser.id)
      setLikeCount((p) => p - 1)
    } else {
      await likeVideo(video.id, currentUser.id)
      setLikeCount((p) => p + 1)
    }
    setLiked(!liked)
  }

  const handleSave = async () => {
    if (!currentUser) { toast.error("Silakan masuk terlebih dahulu"); return }
    if (saved) {
      await unsaveVideo(video.id, currentUser.id)
      toast.success("Dihapus dari tersimpan")
    } else {
      await saveVideo(video.id, currentUser.id)
      toast.success("Disimpan ke koleksi")
    }
    setSaved(!saved)
  }

  const handleFollow = async () => {
    if (!currentUser) { toast.error("Silakan masuk terlebih dahulu"); return }
    if (currentUser.id === video.userId) return
    if (following) {
      await unfollowUser(currentUser.id, video.userId)
      toast.success(`Berhenti follow @${video.username}`)
    } else {
      await followUser(currentUser.id, video.userId)
      toast.success(`Mengikuti @${video.username}`)
    }
    setFollowing(!following)
  }

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return String(n)
  }

  const isOwnVideo = currentUser?.id === video.userId

  return (
    <>
      <div className="relative">
        <Avatar className="size-12 ring-2 ring-white">
          <AvatarImage src={video.userAvatar} alt={video.username} />
          <AvatarFallback>{video.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        {!isOwnVideo && (
          <button
            onClick={handleFollow}
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 size-6 rounded-full flex items-center justify-center transition-colors",
              following ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            <Plus className={cn("size-4", following && "rotate-45")} />
          </button>
        )}
      </div>

      <button onClick={handleLike} className="flex flex-col items-center gap-1">
        <div className={cn("size-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center", liked && "animate-in zoom-in duration-200")}>
          <Heart className={cn("size-7 transition-colors", liked ? "fill-primary text-primary" : "text-white")} />
        </div>
        <span className="text-white text-xs font-medium drop-shadow-lg">{fmt(likeCount)}</span>
      </button>

      <button className="flex flex-col items-center gap-1">
        <div className="size-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <MessageCircle className="size-7 text-white" />
        </div>
        <span className="text-white text-xs font-medium drop-shadow-lg">0</span>
      </button>

      <button onClick={() => setShowShareDialog(true)} className="flex flex-col items-center gap-1">
        <div className="size-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Send className="size-7 text-white" />
        </div>
        <span className="text-white text-xs font-medium drop-shadow-lg">Share</span>
      </button>

      <button onClick={handleSave} className="flex flex-col items-center gap-1">
        <div className={cn("size-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center", saved && "animate-in zoom-in duration-200")}>
          <Bookmark className={cn("size-7 transition-colors", saved ? "fill-white text-white" : "text-white")} />
        </div>
        <span className="text-white text-xs font-medium drop-shadow-lg">Save</span>
      </button>

      <ShareDialog video={video} open={showShareDialog} onOpenChange={setShowShareDialog} />
    </>
  )
}
