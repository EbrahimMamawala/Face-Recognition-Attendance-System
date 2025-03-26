import { NextResponse } from "next/server"
import { getStudents, searchStudents } from "@/lib/data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (query) {
      const students = await searchStudents(query)
      return NextResponse.json(students)
    } else {
      const students = await getStudents()
      return NextResponse.json(students)
    }
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

