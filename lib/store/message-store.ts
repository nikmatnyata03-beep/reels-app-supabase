"use client"

import { createClient } from "@/lib/supabase/client"
import type { Message, Conversation } from "@/lib/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

const supabase = createClient()

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    content: row.content as string,
    type: row.type as "text" | "video",
    videoId: row.video_id as string | undefined,
    createdAt: row.created_at as string,
  }
}

function mapConversation(
  row: Record<string, unknown>,
  participants: string[],
  unreadCount: number
): Conversation {
  return {
    id: row.id as string,
    participants,
    lastMessage: row.last_message as string | undefined,
    lastMessageAt: row.last_message_at as string | undefined,
    unreadCount,
  }
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id, unread_count, conversations(*)")
    .eq("user_id", userId)
    .order("conversation_id")

  if (error) throw error

  const results: Conversation[] = []
  for (const row of data ?? []) {
    const conv = row.conversations as Record<string, unknown>
    // fetch all participants for this conversation
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", row.conversation_id)

    const participants = (parts ?? []).map((p) => p.user_id)
    results.push(mapConversation(conv, participants, row.unread_count))
  }

  return results.sort((a, b) => {
    if (!a.lastMessageAt) return 1
    if (!b.lastMessageAt) return -1
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  })
}

export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<Conversation> {
  const { data: convId, error } = await supabase.rpc("get_or_create_conversation", {
    user1_id: userId1,
    user2_id: userId2,
  })
  if (error) throw error

  const { data: conv } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", convId)
    .single()

  const { data: parts } = await supabase
    .from("conversation_participants")
    .select("user_id, unread_count")
    .eq("conversation_id", convId)

  const participants = (parts ?? []).map((p) => p.user_id)
  const myRecord = (parts ?? []).find((p) => p.user_id === userId1)

  return mapConversation(
    conv as Record<string, unknown>,
    participants,
    myRecord?.unread_count ?? 0
  )
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map((r) => mapMessage(r as Record<string, unknown>))
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  type: "text" | "video" = "text",
  videoId?: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type,
      video_id: videoId,
    })
    .select()
    .single()

  if (error) throw error

  // Update conversation last message
  await supabase
    .from("conversations")
    .update({
      last_message: type === "video" ? "Shared a video" : content,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId)

  return mapMessage(data as Record<string, unknown>)
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await supabase
    .from("conversation_participants")
    .update({ unread_count: 0 })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export function subscribeToMessages(
  conversationId: string,
  onMessage: (msg: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(mapMessage(payload.new as Record<string, unknown>))
      }
    )
    .subscribe()

  return channel
}

export function unsubscribeChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}
