import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Type for MQTT attendance message
interface AttendanceMessage {
  name: string
  registration_number: string
  time: string
  date: string
}

export async function POST(request: Request) {
  try {
    const data: AttendanceMessage = await request.json()

    // Validate required fields
    if (!data.name || !data.registration_number) {
      return NextResponse.json({ error: "Name and registration number are required" }, { status: 400 })
    }

    // Process the attendance data directly (simulating MQTT processing)
    const result = await processAttendanceData(data)

    if (result) {
      return NextResponse.json({
        message: `Attendance recorded for ${data.name}`,
        success: true,
      })
    } else {
      return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error simulating MQTT message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processAttendanceData(data: AttendanceMessage) {
  try {
    const { db } = await connectToDatabase()

    // Get current time if not provided
    if (!data.time) {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      data.time = `${hours}:${minutes}`
    }

    // Get current date if not provided
    if (!data.date) {
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, "0")
      const day = now.getDate().toString().padStart(2, "0")
      data.date = `${year}-${month}-${day}`
    }

    // Get current live class
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const currentTime = `${hours}:${minutes}`

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDay = days[now.getDay()]

    // Find class that is currently in session
    const liveClass = await db.collection("timetable").findOne({
      day: currentDay,
      start_time: { $lte: currentTime },
      end_time: { $gte: currentTime },
    })

    if (!liveClass) {
      console.log("No live class in session. Attendance not recorded.")
      return false
    }

    // Check if student exists, if not create a new student record
    const existingStudent = await db.collection("students").findOne({
      regNumber: data.registration_number,
    })

    if (!existingStudent) {
      console.log(`New student detected: ${data.name} (${data.registration_number}). Creating record...`)

      // Create new student record
      await db.collection("students").insertOne({
        name: data.name,
        regNumber: data.registration_number,
        attendance: [],
        createdAt: new Date(),
      })
    }

    // Check if student already has attendance for this class today
    const existingAttendance = await db.collection("attendance").findOne({
      studentRegNumber: data.registration_number,
      subject: liveClass.subject,
      date: data.date,
    })

    if (existingAttendance) {
      console.log(`Student ${data.registration_number} already marked present for ${liveClass.subject} today.`)
      return true
    }

    // Record new attendance
    await db.collection("attendance").insertOne({
      studentName: data.name,
      studentRegNumber: data.registration_number,
      subject: liveClass.subject,
      date: data.date,
      time: data.time,
      createdAt: new Date(),
    })

    console.log(`Attendance recorded for ${data.name} (${data.registration_number}) in ${liveClass.subject}`)

    // Update student's attendance records
    await updateStudentAttendanceStats(data.registration_number, liveClass.subject)

    return true
  } catch (error) {
    console.error("Error processing attendance data:", error)
    return false
  }
}

async function updateStudentAttendanceStats(regNumber: string, subject: string) {
  try {
    const { db } = await connectToDatabase()

    // Get all attendance records for this student and subject
    const attendanceRecords = await db
      .collection("attendance")
      .find({
        studentRegNumber: regNumber,
        subject: subject,
      })
      .toArray()

    // Get total classes for this subject
    const totalClasses = await db.collection("timetable").countDocuments({
      subject: subject,
    })

    // Calculate attendance percentage
    const attended = attendanceRecords.length
    const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0

    // Update student's attendance stats
    const student = await db.collection("students").findOne({
      regNumber: regNumber,
    })

    if (student) {
      const attendance = student.attendance || []
      const existingSubjectIndex = attendance.findIndex((a: any) => a.subject === subject)

      if (existingSubjectIndex >= 0) {
        // Update existing subject attendance
        attendance[existingSubjectIndex] = {
          subject,
          totalClasses,
          attended,
          percentage,
        }
      } else {
        // Add new subject attendance
        attendance.push({
          subject,
          totalClasses,
          attended,
          percentage,
        })
      }

      // Update student record
      await db.collection("students").updateOne({ _id: student._id }, { $set: { attendance: attendance } })

      console.log(`Updated attendance stats for ${regNumber} in ${subject}: ${percentage}%`)
    }
  } catch (error) {
    console.error("Error updating student attendance stats:", error)
  }
}

