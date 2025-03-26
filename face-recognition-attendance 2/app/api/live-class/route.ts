import { NextResponse } from "next/server"
import { getLiveClass, getLiveAttendees } from "@/lib/data"

export async function GET() {
  try {
    const liveClass = await getLiveClass()
    const attendees = await getLiveAttendees()

    return NextResponse.json({
      liveClass,
      attendees,
    })
  } catch (error) {
    console.error("Error fetching live class data:", error)
    return NextResponse.json({ error: "Failed to fetch live class data" }, { status: 500 })
  }
}

