"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { searchUsers, getAllUsers } from "@/lib/store/user-store"
import type { User } from "@/lib/types"

export default function SearchPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<User[]>([])

  // Initial load — show all users
  useEffect(() => {
    getAllUsers().then(setUsers)
  }, [])

  // Debounced search
  useEffect(() => {
    if (search.trim().length < 2) {
      getAllUsers().then(setUsers)
      return
    }
    const t = setTimeout(() => {
      searchUsers(search.trim()).then(setUsers)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <main className="min-h-dvh bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengguna..."
            className="pl-10 bg-secondary border-border"
            autoFocus
          />
        </div>
      </header>

      <div className="p-4">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {search.length > 0 ? "Pengguna tidak ditemukan" : "Cari pengguna berdasarkan username atau nama"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => router.push(`/profile/${user.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Avatar className="size-12">
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
      </div>
      <BottomNav />
    </main>
  )
}
