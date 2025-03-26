"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MqttSimulator() {
  const [name, setName] = useState("")
  const [regNumber, setRegNumber] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const simulateMqttMessage = async () => {
    if (!name || !regNumber) {
      setResult("Please fill in all fields")
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const currentTime = `${hours}:${minutes}`

      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, "0")
      const day = now.getDate().toString().padStart(2, "0")
      const currentDate = `${year}-${month}-${day}`

      const response = await fetch("/api/mqtt/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          registration_number: regNumber,
          time: currentTime,
          date: currentDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`Success: ${data.message || "Attendance recorded"}`)
        // Clear form
        setName("")
        setRegNumber("")
      } else {
        setResult(`Error: ${data.error || "Failed to record attendance"}`)
      }
    } catch (error) {
      console.error("Error simulating MQTT message:", error)
      setResult("Error: Failed to send MQTT message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MQTT Simulator</CardTitle>
        <CardDescription>Simulate face recognition detection by sending an MQTT message</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Student Name
          </label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter student name" />
        </div>
        <div className="space-y-2">
          <label htmlFor="regNumber" className="text-sm font-medium">
            Registration Number
          </label>
          <Input
            id="regNumber"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            placeholder="Enter registration number"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <Button onClick={simulateMqttMessage} disabled={isSending || !name || !regNumber}>
          {isSending ? "Sending..." : "Simulate Detection"}
        </Button>

        {result && (
          <div className={`text-sm ${result.startsWith("Success") ? "text-green-500" : "text-red-500"}`}>{result}</div>
        )}
      </CardFooter>
    </Card>
  )
}

