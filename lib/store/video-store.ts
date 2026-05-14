"use client"

import { createClient } from "@/lib/supabase/client"
import type { Video } from "@/lib/types"

const supabase = createClient()

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapVideo(row: Record<string, unknown>): Video {
  const profile = row.profiles as Record<string, unknown> | null
  return {
    id: row.id as string,
    url: row.url as string,
    thumbnailUrl: row.thumbnail_url as string | undefined,
    caption: row.caption as string,
    audioUrl: row.audio_url as string | undefined,
    userId: row.user_id as string,
    username: (profile?.username as string) ?? "",
    userAvatar: (profile?.avatar as string) ?? "",
    createdAt: row.created_at as string,
    duration: row.duration as number | undefined,
    views: (row.views as number) ?? 0,
  }
}

// ── Feed ─────────────────────────────────────────────────────────────────────

export async function getFeedVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*, profiles(username, avatar)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => mapVideo(r as Record<string, unknown>))
}

export async function getUserVideos(userId: string): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select("*, profiles(username, avatar)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => mapVideo(r as Record<string, unknown>))
}

export async function getSavedVideosList(userId: string): Promise<Video[]> {
  const { data, error } = await supabase
    .from("saved_videos")
    .select("video_id, videos(*, profiles(username, avatar))")
    .eq("user_id", userId)

  if (error) throw error
  return (data ?? [])
    .map((r) => {
      const v = (r as Record<string, unknown>).videos as Record<string, unknown> | null
      return v ? mapVideo(v) : null
    })
    .filter(Boolean) as Video[]
}

// ── Views ─────────────────────────────────────────────────────────────────────

export async function incrementViews(videoId: string): Promise<void> {
  await supabase.rpc("increment_video_views", { video_id: videoId })
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export async function getLikeCount(videoId: string): Promise<number> {
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("video_id", videoId)
  return count ?? 0
}

export async function isVideoLiked(videoId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("video_id", videoId)
    .eq("user_id", userId)
    .maybeSingle()
  return !!data
}

export async function likeVideo(videoId: string, userId: string): Promise<void> {
  await supabase.from("likes").insert({ video_id: videoId, user_id: userId })
}

export async function unlikeVideo(videoId: string, userId: string): Promise<void> {
  await supabase
    .from("likes")
    .delete()
    .eq("video_id", videoId)
    .eq("user_id", userId)
}

// ── Saved ─────────────────────────────────────────────────────────────────────

export async function isVideoSaved(videoId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("saved_videos")
    .select("id")
    .eq("video_id", videoId)
    .eq("user_id", userId)
    .maybeSingle()
  return !!data
}

export async function saveVideo(videoId: string, userId: string): Promise<void> {
  await supabase.from("saved_videos").insert({ video_id: videoId, user_id: userId })
}

export async function unsaveVideo(videoId: string, userId: string): Promise<void> {
  await supabase
    .from("saved_videos")
    .delete()
    .eq("video_id", videoId)
    .eq("user_id", userId)
}

// ── Insert ────────────────────────────────────────────────────────────────────

export async function insertVideo(payload: {
  url: string
  thumbnail_url?: string
  caption: string
  audio_url?: string
  user_id: string
  duration?: number
}): Promise<Video> {
  const { data, error } = await supabase
    .from("videos")
    .insert(payload)
    .select("*, profiles(username, avatar)")
    .single()

  if (error) throw error
  return mapVideo(data as Record<string, unknown>)
}
