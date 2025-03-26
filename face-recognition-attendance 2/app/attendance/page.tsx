import { Suspense } from "react"
import AttendanceReport from "@/components/attendance-report"

export default function AttendancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Attendance Reports</h1>

      <div className="mb-6">
        <p className="text-muted-foreground">View and analyze attendance data across all subjects and students.</p>
      </div>

      <Suspense fallback={<div className="p-8 text-center">Loading attendance data...</div>}>
        <AttendanceReport />
      </Suspense>
    </div>
  )
}

