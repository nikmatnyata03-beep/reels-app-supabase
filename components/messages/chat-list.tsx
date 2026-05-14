"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getUser } from "@/lib/store/user-store"
import type { Conversation, User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChatListProps {
  conversations: Conversation[]
  currentUserId: string
}

export function ChatList({ conversations, currentUserId }: ChatListProps) {
  const router = useRouter()
  const [otherUsers, setOtherUsers] = useState<Record<string, User>>({})

  useEffect(() => {
    const ids = conversations
      .map((c) => c.participants.find((id) => id !== currentUserId))
      .filter(Boolean) as string[]

    Promise.all(ids.map((id) => getUser(id))).then((results) => {
      const map: Record<string, User> = {}
      results.forEach((u) => { if (u) map[u.id] = u })
      setOtherUsers(map)
    })
  }, [conversations, currentUserId])

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Belum ada percakapan</p>
        <p className="text-sm text-muted-foreground mt-1">Bagikan video untuk memulai chat</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => {
        const otherUserId = conversation.participants.find((id) => id !== currentUserId)
        const otherUser = otherUserId ? otherUsers[otherUserId] : null
        if (!otherUser) return null

        return (
          <button
            key={conversation.id}
            onClick={() => router.push(`/messages/${conversation.id}`)}
            className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors border-b border-border"
          >
            <div className="relative">
              <Avatar className="size-12">
                <AvatarImage src={otherUser.avatar} alt={otherUser.username} />
                <AvatarFallback>{otherUser.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {conversation.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>

            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{otherUser.displayName}</p>
                {conversation.lastMessageAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className={cn("text-sm truncate", conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                {conversation.lastMessage || "Belum ada pesan"}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
