import { ReelsFeed } from "@/components/reels/reels-feed"
import { BottomNav } from "@/components/navigation/bottom-nav"

export default function HomePage() {
  return (
    <main className="h-dvh w-full bg-background overflow-hidden">
      <ReelsFeed />
      <BottomNav />
    </main>
  )
}
