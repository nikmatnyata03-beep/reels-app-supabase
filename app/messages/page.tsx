"use client"

import { useState, useEffect } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatList } from "@/components/messages/chat-list"
import { NewChatDialog } from "@/components/messages/new-chat-dialog"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { AuthModal } from "@/components/auth/auth-modal"
import { useUser } from "@/components/providers/app-provider"
import { getConversations } from "@/lib/store/message-store"
import { createClient } from "@/lib/supabase/client"
import type { Conversation } from "@/lib/types"

export default function MessagesPage() {
  const { currentUser } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }

    getConversations(currentUser.id).then(setConversations)

    // Realtime: refresh conversation list when new message arrives
    const supabase = createClient()
    const channel = supabase
      .channel("conversation-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => {
        getConversations(currentUser.id).then(setConversations)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser])

  if (!currentUser) {
    return (
      <main className="min-h-dvh bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          </div>
        </header>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Silakan masuk untuk melihat pesan</p>
        </div>
        <BottomNav />
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowNewChatDialog(true)}>
            <Edit className="size-5" />
          </Button>
        </div>
      </header>

      <ChatList conversations={conversations} currentUserId={currentUser.id} />
      <BottomNav />

      <NewChatDialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog} />
    </main>
  )
}
