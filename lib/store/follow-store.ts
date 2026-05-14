"use client"

import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export async function getFollowing(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
  return (data ?? []).map((r) => r.following_id)
}

export async function getFollowers(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId)
  return (data ?? []).map((r) => r.follower_id)
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle()
  return !!data
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId })
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
}

export async function getFollowerCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId)
  return count ?? 0
}

export async function getFollowingCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId)
  return count ?? 0
}
