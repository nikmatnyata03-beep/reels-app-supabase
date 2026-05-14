"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChatWindow } from "@/components/messages/chat-window"
import { MessageInput } from "@/components/messages/message-input"
import { useUser } from "@/components/providers/app-provider"
import { getUser } from "@/lib/store/user-store"
import {
  getMessages,
  sendMessage,
  markConversationAsRead,
  subscribeToMessages,
  unsubscribeChannel,
} from "@/lib/store/message-store"
import type { Message, User } from "@/lib/types"

interface PageProps {
  params: Promise<{ chatId: string }>
}

export default function ChatPage({ params }: PageProps) {
  const { chatId } = use(params)
  const router = useRouter()
  const { currentUser } = useUser()
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      router.push("/messages")
      return
    }

    async function init() {
      setIsLoading(true)
      try {
        const [msgs] = await Promise.all([
          getMessages(chatId),
          markConversationAsRead(chatId, currentUser!.id),
        ])
        setMessages(msgs)

        // We need the other participant — fetch from participants
        // For now, load messages and infer sender
        const otherSenderId = msgs.find((m) => m.senderId !== currentUser!.id)?.senderId
        if (otherSenderId) {
          const u = await getUser(otherSenderId)
          setOtherUser(u)
        }
      } finally {
        setIsLoading(false)
      }
    }

    init()

    // Subscribe to realtime new messages
    const channel = subscribeToMessages(chatId, (newMsg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    })

    return () => {
      unsubscribeChannel(channel)
    }
  }, [chatId, currentUser, router])

  const handleSendMessage = async (content: string) => {
    if (!currentUser) return
    const msg = await sendMessage(chatId, currentUser.id, content, "text")
    setMessages((prev) => [...prev, msg])
  }

  if (isLoading || !currentUser) return null

  return (
    <main className="h-dvh bg-background flex flex-col">
      <header className="shrink-0 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>

          {otherUser && (
            <button
              onClick={() => router.push(`/profile/${otherUser.id}`)}
              className="flex items-center gap-3"
            >
              <Avatar className="size-9">
                <AvatarImage src={otherUser.avatar} alt={otherUser.username} />
                <AvatarFallback>{otherUser.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">{otherUser.displayName}</p>
                <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
              </div>
            </button>
          )}
        </div>
      </header>

      <ChatWindow messages={messages} currentUserId={currentUser.id} />
      <MessageInput onSend={handleSendMessage} />
    </main>
  )
}
