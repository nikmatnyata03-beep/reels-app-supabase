"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Search, PlusSquare, MessageCircle, User } from "lucide-react"
import { useUser } from "@/components/providers/app-provider"
import { getTotalUnreadCount } from "@/lib/store/message-store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/upload", icon: PlusSquare, label: "Upload" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { currentUser } = useUser()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (currentUser) {
      setUnreadCount(getTotalUnreadCount(currentUser.id))
    }
  }, [currentUser])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon
          const showBadge = item.href === "/messages" && unreadCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors relative",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "size-6",
                  isActive && "fill-current"
                )} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 size-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs sr-only">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
