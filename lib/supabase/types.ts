export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar: string
          bio: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar?: string
          bio?: string
          created_at?: string
        }
        Update: {
          username?: string
          display_name?: string
          avatar?: string
          bio?: string
        }
      }
      videos: {
        Row: {
          id: string
          url: string
          thumbnail_url: string | null
          caption: string
          audio_url: string | null
          user_id: string
          duration: number | null
          views: number
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          thumbnail_url?: string | null
          caption?: string
          audio_url?: string | null
          user_id: string
          duration?: number | null
          views?: number
          created_at?: string
        }
        Update: {
          caption?: string
          thumbnail_url?: string | null
          audio_url?: string | null
          duration?: number | null
          views?: number
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          video_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          created_at?: string
        }
        Update: never
      }
      saved_videos: {
        Row: {
          id: string
          user_id: string
          video_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          created_at?: string
        }
        Update: never
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: never
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          last_message: string | null
          last_message_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          last_message?: string | null
          last_message_at?: string | null
        }
        Update: {
          last_message?: string | null
          last_message_at?: string | null
        }
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
          unread_count: number
        }
        Insert: {
          conversation_id: string
          user_id: string
          unread_count?: number
        }
        Update: {
          unread_count?: number
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          type: "text" | "video"
          video_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          type?: "text" | "video"
          video_id?: string | null
          created_at?: string
        }
        Update: never
      }
    }
    Functions: {
      increment_video_views: {
        Args: { video_id: string }
        Returns: void
      }
      get_or_create_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
    }
  }
}
