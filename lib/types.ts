export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  createdAt: string
}

export interface Video {
  id: string
  url: string
  thumbnailUrl?: string
  caption: string
  audioUrl?: string
  userId: string
  username: string
  userAvatar: string
  createdAt: string
  duration?: number
}

export interface VideoMeta {
  videoId: string
  likes: number
  comments: number
  shares: number
  views: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: "text" | "video"
  videoId?: string
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

export interface FollowData {
  [userId: string]: string[] // userId -> array of userIds they follow
}

export interface SavedVideos {
  [userId: string]: string[] // userId -> array of videoIds
}

export interface LikedVideos {
  [videoId: string]: string[] // videoId -> array of userIds who liked
}
