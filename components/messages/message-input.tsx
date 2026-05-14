"use client"

import { useState, useCallback } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MessageInputProps {
  onSend: (content: string) => void
  placeholder?: string
}

export function MessageInput({ onSend, placeholder = "Message..." }: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmed = message.trim()
    if (!trimmed) return

    onSend(trimmed)
    setMessage("")
  }, [message, onSend])

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t border-border bg-background"
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-secondary border-border"
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={!message.trim()}
      >
        <Send className="size-4" />
      </Button>
    </form>
  )
}
