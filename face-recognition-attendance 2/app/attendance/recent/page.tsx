import { Suspense } from "react"
import RecentAttendance from "@/components/recent-attendance"

export default function RecentAttendancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Recent Attendance</h1>

      <div className="mb-6">
        <p className="text-muted-foreground">View the most recent attendance records captured via face recognition.</p>
      </div>

      <Suspense fallback={<div className="p-8 text-center">Loading recent attendance data...</div>}>
        <RecentAttendance />
      </Suspense>
    </div>
  )
}

