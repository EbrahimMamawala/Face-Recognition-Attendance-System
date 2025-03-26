import { getStudents, getTimeTable } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Clock, UserCheck } from "lucide-react"

export default async function DashboardStats() {
  const students = await getStudents()
  const timetable = await getTimeTable()

  // Calculate total subjects
  const subjects = new Set(timetable.map((entry) => entry.subject))

  // Calculate average attendance
  let totalAttendance = 0
  let totalRecords = 0

  students.forEach((student) => {
    student.attendance?.forEach((record) => {
      totalAttendance += record.percentage
      totalRecords++
    })
  })

  const averageAttendance = totalRecords > 0 ? Math.round(totalAttendance / totalRecords) : 0

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      description: "Registered in the system",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Subjects",
      value: subjects.size,
      description: "Across all semesters",
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      title: "Weekly Classes",
      value: timetable.length,
      description: "Scheduled this week",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "Average Attendance",
      value: `${averageAttendance}%`,
      description: "Across all subjects",
      icon: UserCheck,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

