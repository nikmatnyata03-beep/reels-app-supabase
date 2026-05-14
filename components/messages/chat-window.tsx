"use client"

import { useEffect, useRef, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Play } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getUser } from "@/lib/store/user-store"
import type { Message, User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  messages: Message[]
  currentUserId: string
  onVideoClick?: (videoId: string) => void
}

export function ChatWindow({ messages, currentUserId, onVideoClick }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [senders, setSenders] = useState<Record<string, User>>({})

  // Fetch unknown senders
  useEffect(() => {
    const unknownIds = [
      ...new Set(
        messages
          .filter((m) => m.senderId !== currentUserId && !senders[m.senderId])
          .map((m) => m.senderId)
      ),
    ]
    if (unknownIds.length === 0) return

    Promise.all(unknownIds.map((id) => getUser(id))).then((results) => {
      setSenders((prev) => {
        const next = { ...prev }
        results.forEach((u) => { if (u) next[u.id] = u })
        return next
      })
    })
  }, [messages, currentUserId, senders])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId
        const sender = senders[message.senderId]

        return (
          <div
            key={message.id}
            className={cn("flex gap-2 max-w-[80%]", isOwn ? "self-end flex-row-reverse" : "self-start")}
          >
            {!isOwn && sender && (
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={sender.avatar} alt={sender.username} />
                <AvatarFallback>{sender.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            )}

            <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
              {message.type === "video" && message.videoId ? (
                <button
                  onClick={() => onVideoClick?.(message.videoId!)}
                  className={cn("rounded-2xl overflow-hidden", isOwn ? "bg-primary" : "bg-secondary")}
                >
                  <div className="relative w-32 aspect-[9/16]">
                    <video
                      src={`/api/videos/${message.videoId}`}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="size-8 text-white fill-white" />
                    </div>
                  </div>
                  <p className={cn("text-sm p-3", isOwn ? "text-primary-foreground" : "text-foreground")}>
                    {message.content}
                  </p>
                </button>
              ) : (
                <div className={cn(
                  "px-4 py-2 rounded-2xl",
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                )}>
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
              <span className="text-xs text-muted-foreground px-2">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        )
      })}

      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Belum ada pesan</p>
        </div>
      )}
    </div>
  )
}
