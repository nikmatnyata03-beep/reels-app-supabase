import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "videos/" })
    
    const videos = blobs
      .filter(blob => blob.pathname.endsWith(".mp4") || blob.pathname.endsWith(".webm"))
      .map(blob => ({
        id: blob.pathname.replace("videos/", "").replace(/\.(mp4|webm)$/, ""),
        url: blob.url,
        pathname: blob.pathname,
        uploadedAt: blob.uploadedAt,
        size: blob.size,
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Error listing videos:", error)
    return NextResponse.json({ videos: [], error: "Failed to list videos" }, { status: 500 })
  }
}
