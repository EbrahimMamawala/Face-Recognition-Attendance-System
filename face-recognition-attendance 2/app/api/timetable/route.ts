import { NextResponse } from "next/server"
import { getTimeTable } from "@/lib/data"

export async function GET() {
  try {
    const timetable = await getTimeTable()
    return NextResponse.json(timetable)
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 })
  }
}

