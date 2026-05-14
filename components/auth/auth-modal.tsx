"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/components/providers/app-provider"
import { toast } from "sonner"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const { signIn, signUp } = useUser()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === "signup") {
        if (!displayName.trim() || !username.trim()) {
          toast.error("Isi semua field yang diperlukan")
          return
        }
        if (username.length < 3) {
          toast.error("Username minimal 3 karakter")
          return
        }
        await signUp(email.trim(), password, username.trim().toLowerCase(), displayName.trim())
        toast.success("Akun berhasil dibuat! Silakan cek email untuk verifikasi.")
      } else {
        await signIn(email.trim(), password)
        toast.success("Berhasil masuk!")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === "signin" ? "Masuk ke Reels" : "Buat Akun Baru"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "signin"
              ? "Masuk untuk upload video, follow kreator, dan lainnya."
              : "Bergabung dengan Reels sekarang."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="displayName">Nama Tampilan</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                    placeholder="johndoe"
                    className="bg-secondary border-border pl-8"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="bg-secondary border-border"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading
              ? mode === "signup" ? "Membuat akun..." : "Masuk..."
              : mode === "signup" ? "Buat Akun" : "Masuk"}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-sm text-muted-foreground text-center hover:text-foreground transition-colors"
          >
            {mode === "signin"
              ? "Belum punya akun? Daftar sekarang"
              : "Sudah punya akun? Masuk"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
