import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

// Types
export type LiveClass = {
  _id: string
  subject: string
  startTime: string
  endTime: string
}

export type Attendee = {
  _id: string
  name: string
  time: string
}

export type TimeTableEntry = {
  _id: string
  day: string
  start_time: string
  end_time: string
  subject: string
}

export type AttendanceRecord = {
  subject: string
  totalClasses: number
  attended: number
  percentage: number
}

export type Student = {
  _id: string
  name: string
  regNumber: string
  attendance: AttendanceRecord[]
}

export type AttendanceEntry = {
  _id: string
  studentName: string
  studentRegNumber: string
  subject: string
  date: string
  time: string
  createdAt: Date
}

// Get current live class
export async function getLiveClass(): Promise<LiveClass | null> {
  try {
    const { db } = await connectToDatabase()

    // Get current time
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const currentTime = `${hours}:${minutes}`

    // Get current day
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDay = days[now.getDay()]

    // Find class that is currently in session
    const liveClass = await db.collection("timetable").findOne({
      day: currentDay,
      start_time: { $lte: currentTime },
      end_time: { $gte: currentTime },
    })

    if (!liveClass) return null
    
    return {
      _id: liveClass._id.toString(),
      subject: liveClass.subject,
      startTime: liveClass.start_time,
      endTime: liveClass.end_time,
    }

  } catch (error) {
    console.error("Error getting live class:", error)
    return null
  }
}

// Get attendees for the current live class
export async function getLiveAttendees(): Promise<Attendee[]> {
  try {
    const { db } = await connectToDatabase()
    const liveClass = await getLiveClass()

    if (!liveClass) return []

    // Get current date
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")
    const currentDate = `${year}-${month}-${day}`

    // Find attendees for the current class
    const attendees = await db
      .collection("attendance")
      .find({
        subject: liveClass.subject,
        date: currentDate,
      })
      .toArray()

    return attendees.map((attendee) => ({
      _id: attendee._id.toString(),
      name: attendee.studentName,
      time: attendee.time,
    }))

  } catch (error) {
    console.error("Error getting live attendees:", error)
    return []
  }
}

// Get timetable
export async function getTimeTable(): Promise<TimeTableEntry[]> {
  try {
    const { db } = await connectToDatabase()

    const timetable = await db.collection("timetable").find({}).toArray()

    return timetable.map((entry) => ({
      _id: entry._id.toString(),
      day: entry.day,
      start_time: entry.start_time,
      end_time: entry.end_time,
      subject: entry.subject,
    }))
  } catch (error) {
    console.error("Error getting timetable:", error)
    return []
  }
}

// Get all students
export async function getStudents(): Promise<Student[]> {
  try {
    const { db } = await connectToDatabase()

    const students = await db.collection("students").find({}).toArray()

    return students.map((student) => ({
      _id: student._id.toString(),
      name: student.name,
      regNumber: student.regNumber,
      attendance: student.attendance || [],
    }))
  } catch (error) {
    console.error("Error getting students:", error)
    return []
  }
}

// Get student by ID
export async function getStudentById(id: string): Promise<Student | null> {
  try {
    const { db } = await connectToDatabase()

    const student = await db.collection("students").findOne({
      _id: new ObjectId(id),
    })

    if (!student) return null

    return {
      _id: student._id.toString(),
      name: student.name,
      regNumber: student.regNumber,
      attendance: student.attendance || [],
    }
  } catch (error) {
    console.error("Error getting student by ID:", error)
    return null
  }
}

// Search students by name
export async function searchStudents(query: string): Promise<Student[]> {
  try {
    const { db } = await connectToDatabase()

    const students = await db
      .collection("students")
      .find({
        name: { $regex: query, $options: "i" },
      })
      .toArray()

    return students.map((student) => ({
      _id: student._id.toString(),
      name: student.name,
      regNumber: student.regNumber,
      attendance: student.attendance || [],
    }))
  } catch (error) {
    console.error("Error searching students:", error)
    return []
  }
}

// Get all attendance records
export async function getAllAttendance(): Promise<AttendanceEntry[]> {
  try {
    const { db } = await connectToDatabase()

    const attendance = await db.collection("attendance").find({}).sort({ createdAt: -1 }).limit(100).toArray()

    return attendance.map((entry) => ({
      _id: entry._id.toString(),
      studentName: entry.studentName,
      studentRegNumber: entry.studentRegNumber,
      subject: entry.subject,
      date: entry.date,
      time: entry.time,
      createdAt: entry.createdAt,
    }))
  } catch (error) {
    console.error("Error getting attendance records:", error)
    return []
  }
}

// Get attendance records for a specific student
export async function getStudentAttendance(studentId: string): Promise<AttendanceEntry[]> {
  try {
    const { db } = await connectToDatabase()

    const student = await db.collection("students").findOne({
      _id: new ObjectId(studentId),
    })

    if (!student) return []

    const attendance = await db
      .collection("attendance")
      .find({
        studentRegNumber: student.regNumber,
      })
      .sort({ createdAt: -1 })
      .toArray()

    return attendance.map((entry) => ({
      _id: entry._id.toString(),
      studentName: entry.studentName,
      studentRegNumber: entry.studentRegNumber,
      subject: entry.subject,
      date: entry.date,
      time: entry.time,
      createdAt: entry.createdAt,
    }))
  } catch (error) {
    console.error("Error getting student attendance:", error)
    return []
  }
}

// Get attendance records for a specific subject
export async function getSubjectAttendance(subject: string): Promise<AttendanceEntry[]> {
  try {
    const { db } = await connectToDatabase()

    const attendance = await db
      .collection("attendance")
      .find({
        subject: subject,
      })
      .sort({ createdAt: -1 })
      .toArray()

    return attendance.map((entry) => ({
      _id: entry._id.toString(),
      studentName: entry.studentName,
      studentRegNumber: entry.studentRegNumber,
      subject: entry.subject,
      date: entry.date,
      time: entry.time,
      createdAt: entry.createdAt,
    }))
  } catch (error) {
    console.error("Error getting subject attendance:", error)
    return []
  }
}

