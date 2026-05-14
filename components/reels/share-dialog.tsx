"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Send, Link2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@/lib/store/user-store"
import { getAllUsers } from "@/lib/store/user-store"
import { getOrCreateConversation, sendMessage } from "@/lib/store/message-store"
import type { Video, User } from "@/lib/types"
import { toast } from "sonner"

interface ShareDialogProps {
  video: Video
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ video, open, onOpenChange }: ShareDialogProps) {
  const { currentUser } = useUser()
  const [copied, setCopied] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open && currentUser) {
      const allUsers = getAllUsers().filter(u => u.id !== currentUser.id)
      setUsers(allUsers)
      setSentTo(new Set())
    }
  }, [open, currentUser])

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/reel/${video.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleShareToUser = (userId: string) => {
    if (!currentUser) {
      toast.error("Please sign in to share videos")
      return
    }

    const conversation = getOrCreateConversation(currentUser.id, userId)
    sendMessage(conversation.id, currentUser.id, video.caption || "Check out this video!", "video", video.id)
    
    setSentTo(prev => new Set(prev).add(userId))
    toast.success("Video shared!")
  }

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/reel/${video.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this Reel!",
          text: video.caption,
          url,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Share Video</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Quick actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleNativeShare}
            >
              <Link2 className="size-4" />
              Share
            </Button>
          </div>

          {/* Send to users */}
          {currentUser && users.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Send to</p>
              <ScrollArea className="h-48">
                <div className="flex flex-col gap-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback>
                            {user.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.displayName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={sentTo.has(user.id) ? "secondary" : "default"}
                        onClick={() => handleShareToUser(user.id)}
                        disabled={sentTo.has(user.id)}
                      >
                        {sentTo.has(user.id) ? (
                          <Check className="size-4" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {currentUser && users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users to share with yet
            </p>
          )}

          {!currentUser && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sign in to share videos with friends
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
