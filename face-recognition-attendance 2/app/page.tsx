import { Suspense } from "react"
import LiveClass from "@/components/live-class"
import TimeTable from "@/components/time-table"
import ClientSearch from "@/components/client-search"
import DashboardStats from "@/components/dashboard-stats"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Face Recognition Attendance System</h1>

      {/* Dashboard Stats */}
      <div className="mb-8">
        <Suspense fallback={<div className="p-8 text-center">Loading statistics...</div>}>
          <DashboardStats />
        </Suspense>
      </div>

      {/* Live Class Section */}
      <div className="mb-8">
        <Suspense fallback={<div className="p-8 text-center">Loading live class data...</div>}>
          <LiveClass />
        </Suspense>
      </div>

      {/* Time Table Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sample Time Table</h2>
        <Suspense fallback={<div className="p-8 text-center">Loading timetable...</div>}>
          <TimeTable />
        </Suspense>
      </div>

      {/* Students Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Students</h2>
        <ClientSearch />
      </div>
    </div>
  )
}

