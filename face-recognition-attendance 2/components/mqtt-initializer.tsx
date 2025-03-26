"use client"

import { useEffect, useState } from "react"

export default function MqttInitializer() {
  const [status, setStatus] = useState<string>("Initializing MQTT...")

  useEffect(() => {
    const initMqtt = async () => {
      try {
        const response = await fetch("/api/mqtt")
        const data = await response.json()
        setStatus(data.status || "MQTT initialized")
        console.log("MQTT initialization response:", data)
      } catch (error) {
        console.error("Failed to initialize MQTT:", error)
        setStatus("Failed to initialize MQTT")
      }
    }

    initMqtt()
  }, [])

  // This component doesn't render anything visible
  return null
}

