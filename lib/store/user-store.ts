"use client"

// Re-export from app-provider for backward compat
export { useUser, UserContext } from "@/components/providers/app-provider"

import { createClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"

const supabase = createClient()

function mapProfile(raw: Record<string, unknown>): User {
  return {
    id: raw.id as string,
    username: raw.username as string,
    displayName: raw.display_name as string,
    avatar: raw.avatar as string,
    bio: (raw.bio as string) || "",
    createdAt: raw.created_at as string,
  }
}

export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()
  if (error || !data) return null
  return mapProfile(data as Record<string, unknown>)
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle()
  if (error || !data) return null
  return mapProfile(data as Record<string, unknown>)
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []).map((r) => mapProfile(r as Record<string, unknown>))
}

export async function searchUsers(query: string): Promise<User[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20)
  return (data ?? []).map((r) => mapProfile(r as Record<string, unknown>))
}
