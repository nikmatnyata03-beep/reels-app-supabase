import { list } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "audio/" })
    
    const audioFiles = blobs
      .filter(blob => 
        blob.pathname.endsWith(".mp3") || 
        blob.pathname.endsWith(".wav") || 
        blob.pathname.endsWith(".m4a")
      )
      .map(blob => ({
        id: blob.pathname.replace("audio/", "").replace(/\.(mp3|wav|m4a)$/, ""),
        url: blob.url,
        pathname: blob.pathname,
        name: blob.pathname.split("/").pop()?.replace(/\.(mp3|wav|m4a)$/, "") || "Unknown",
        uploadedAt: blob.uploadedAt,
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ audio: audioFiles })
  } catch (error) {
    console.error("Error listing audio:", error)
    return NextResponse.json({ audio: [], error: "Failed to list audio" }, { status: 500 })
  }
}
