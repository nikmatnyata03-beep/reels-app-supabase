"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@/components/providers/app-provider"
import { searchUsers, getAllUsers } from "@/lib/store/user-store"
import { getOrCreateConversation } from "@/lib/store/message-store"
import type { User } from "@/lib/types"

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const router = useRouter()
  const { currentUser } = useUser()
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!open || !currentUser) return
    getAllUsers().then((all) => setUsers(all.filter((u) => u.id !== currentUser.id)))
  }, [open, currentUser])

  useEffect(() => {
    if (!currentUser) return
    if (search.trim().length < 2) {
      getAllUsers().then((all) => setUsers(all.filter((u) => u.id !== currentUser.id)))
      return
    }
    setIsSearching(true)
    const timeout = setTimeout(() => {
      searchUsers(search.trim())
        .then((results) => setUsers(results.filter((u) => u.id !== currentUser.id)))
        .finally(() => setIsSearching(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, currentUser])

  const handleSelectUser = async (userId: string) => {
    if (!currentUser) return
    const conversation = await getOrCreateConversation(currentUser.id, userId)
    onOpenChange(false)
    router.push(`/messages/${conversation.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Pesan Baru</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengguna..."
              className="pl-10 bg-secondary border-border"
            />
          </div>

          <ScrollArea className="h-64">
            {isSearching ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground text-sm">Mencari...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">
                  {search ? "Pengguna tidak ditemukan" : "Belum ada pengguna lain"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
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
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
