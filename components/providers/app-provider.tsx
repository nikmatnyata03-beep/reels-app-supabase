"use client"

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"
import { Toaster } from "sonner"

interface UserContextType {
  currentUser: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

export const UserContext = createContext<UserContextType | null>(null)

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUser must be used within AppProvider")
  return context
}

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single()
    if (!error && data) {
      setCurrentUser(mapProfile(data as Record<string, unknown>))
    }
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          await fetchProfile(session.user)
        } else {
          setCurrentUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile, supabase.auth])

  const signUp = useCallback(async (email: string, password: string, username: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: displayName } },
    })
    if (error) throw error
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setSession(null)
  }, [supabase])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!currentUser) return
    const dbUpdates: Record<string, unknown> = {}
    if (updates.username) dbUpdates.username = updates.username
    if (updates.displayName) dbUpdates.display_name = updates.displayName
    if (updates.avatar) dbUpdates.avatar = updates.avatar
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio
    const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", currentUser.id)
    if (error) throw error
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null))
  }, [currentUser, supabase])

  return (
    <UserContext.Provider value={{ currentUser, session, isLoading, signUp, signIn, signOut, updateProfile }}>
      {children}
      <Toaster position="top-center" theme="dark" />
    </UserContext.Provider>
  )
}
