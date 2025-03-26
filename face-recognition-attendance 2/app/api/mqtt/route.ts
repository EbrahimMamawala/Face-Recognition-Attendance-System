import { NextResponse } from "next/server"
import { initMqttClient } from "@/lib/mqtt-service"

let mqttInitialized = false

export async function GET() {
  try {
    if (!mqttInitialized) {
      await initMqttClient()
      mqttInitialized = true
      return NextResponse.json({ status: "MQTT client initialized successfully" })
    }

    return NextResponse.json({ status: "MQTT client already initialized" })
  } catch (error) {
    console.error("Error initializing MQTT client:", error)
    return NextResponse.json({ error: "Failed to initialize MQTT client" }, { status: 500 })
  }
}

