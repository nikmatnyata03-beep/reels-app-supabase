// localStorage utility functions with SSR safety

export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent("storage-update", { detail: { key, value } }))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Failed to remove from localStorage:", error)
  }
}

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: "reels_current_user",
  USERS: "reels_users",
  FOLLOWS: "reels_follows",
  MESSAGES: "reels_messages",
  CONVERSATIONS: "reels_conversations",
  SAVED: "reels_saved",
  VIDEO_META: "reels_video_meta",
  LIKES: "reels_likes",
} as const
