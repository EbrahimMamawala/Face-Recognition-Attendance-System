import mqtt from "mqtt"
import { connectToDatabase } from "./mongodb"

// MQTT Configuration
const broker = "f443c2fc8f5543c4ab88174b8ff2a522.s1.eu.hivemq.cloud"
const topic = "attendance/detection"
const username = "hivemq.webclient.1741525685527"
const password = "&<C;0,1D3AI9KerqJsdt"

// Type for MQTT attendance message
interface AttendanceMessage {
  name: string
  registration_number: string
  time: string
  date: string
}

let client: mqtt.MqttClient | null = null

export async function initMqttClient() {
  if (client) return client

  try {
    console.log("Initializing MQTT client...")

    client = mqtt.connect(`mqtts://${broker}:8883`, {
      username,
      password,
      protocol: "mqtts",
      rejectUnauthorized: false,
    })

    client.on("connect", () => {
      console.log("Connected to MQTT broker")
      client?.subscribe(topic, (err) => {
        if (err) {
          console.error("Error subscribing to topic:", err)
        } else {
          console.log(`Subscribed to topic: ${topic}`)
        }
      })
    })

    client.on("message", async (topic, message) => {
      try {
        console.log(`Received message on topic ${topic}: ${message.toString()}`)
        const attendanceData: AttendanceMessage = JSON.parse(message.toString())
        await processAttendanceData(attendanceData)
      } catch (error) {
        console.error("Error processing MQTT message:", error)
      }
    })

    client.on("error", (err) => {
      console.error("MQTT client error:", err)
    })

    client.on("close", () => {
      console.log("MQTT client disconnected")
    })

    return client
  } catch (error) {
    console.error("Failed to initialize MQTT client:", error)
    throw error
  }
}

async function processAttendanceData(data: AttendanceMessage) {
  try {
    const { db } = await connectToDatabase()

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
      return
    }

    // Format date as YYYY-MM-DD
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")
    const currentDate = `${year}-${month}-${day}`

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
      date: currentDate,
    })

    if (existingAttendance) {
      console.log(`Student ${data.registration_number} already marked present for ${liveClass.subject} today.`)
      return
    }

    // Record new attendance
    await db.collection("attendance").insertOne({
      studentName: data.name,
      studentRegNumber: data.registration_number,
      subject: liveClass.subject,
      date: currentDate,
      time: data.time || currentTime,
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

