import { NextResponse } from "next/server"
import { getStudentById } from "@/lib/data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const student = await getStudentById(params.id)

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

