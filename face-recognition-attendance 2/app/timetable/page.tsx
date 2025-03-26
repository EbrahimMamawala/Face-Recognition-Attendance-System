import { Suspense } from "react"
import TimeTable from "@/components/time-table"

export default function TimetablePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Class Timetable</h1>

      <div className="mb-6">
        <p className="text-muted-foreground">Weekly schedule of all classes with their respective time slots.</p>
      </div>

      <Suspense fallback={<div className="p-8 text-center">Loading timetable...</div>}>
        <TimeTable />
      </Suspense>
    </div>
  )
}

