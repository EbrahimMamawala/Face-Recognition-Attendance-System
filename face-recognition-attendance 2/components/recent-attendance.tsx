import { getAllAttendance } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function RecentAttendance() {
  const attendanceRecords = await getAllAttendance()

  // Group records by date
  const recordsByDate = attendanceRecords.reduce(
    (acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = []
      }
      acc[record.date].push(record)
      return acc
    },
    {} as Record<string, typeof attendanceRecords>,
  )

  // Sort dates in descending order
  const sortedDates = Object.keys(recordsByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="space-y-8">
      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle>Attendance for {formatDate(date)}</CardTitle>
              <CardDescription>{recordsByDate[date].length} students marked present</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsByDate[date].map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.studentName}</TableCell>
                      <TableCell>{record.studentRegNumber}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>{record.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center p-8">
          <p>No attendance records found.</p>
          <p className="text-muted-foreground mt-2">
            Attendance records will appear here when students are detected by the face recognition system.
          </p>
        </div>
      )}
    </div>
  )
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

