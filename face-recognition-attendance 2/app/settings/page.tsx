"use client"
import MqttSimulator from "@/components/mqtt-simulator"

export default function SettingsPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <MqttSimulator />
        </div>
      </div>
    </div>
  )
}

