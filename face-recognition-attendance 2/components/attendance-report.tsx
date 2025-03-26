import { getStudents } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AttendanceReport() {
  const students = await getStudents()

  // Get all unique subjects
  const allSubjects = new Set<string>()
  students.forEach((student) => {
    student.attendance?.forEach((record) => {
      allSubjects.add(record.subject)
    })
  })

  const subjects = Array.from(allSubjects)

  // Calculate subject-wise attendance
  const subjectAttendance = subjects.map((subject) => {
    let totalStudents = 0
    let totalAttendance = 0

    students.forEach((student) => {
      const record = student.attendance?.find((r) => r.subject === subject)
      if (record) {
        totalStudents++
        totalAttendance += record.percentage
      }
    })

    const averageAttendance = totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0

    return {
      subject,
      averageAttendance,
      totalStudents,
    }
  })

  // Sort by average attendance (descending)
  subjectAttendance.sort((a, b) => b.averageAttendance - a.averageAttendance)

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
          <CardDescription>Average attendance percentage across all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Average Attendance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectAttendance.map((item) => (
                <TableRow key={item.subject}>
                  <TableCell className="font-medium">{item.subject}</TableCell>
                  <TableCell>{item.totalStudents}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className={`h-2.5 rounded-full ${
                            item.averageAttendance >= 75
                              ? "bg-green-500"
                              : item.averageAttendance >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${item.averageAttendance}%` }}
                        ></div>
                      </div>
                      <span>{item.averageAttendance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.averageAttendance >= 75 ? (
                      <span className="text-green-500">Good</span>
                    ) : item.averageAttendance >= 60 ? (
                      <span className="text-yellow-500">Average</span>
                    ) : (
                      <span className="text-red-500">Poor</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students with Low Attendance</CardTitle>
          <CardDescription>Students with attendance below 75% in any subject</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Registration Number</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students
                .flatMap((student) =>
                  (student.attendance || [])
                    .filter((record) => record.percentage < 75)
                    .map((record) => ({
                      studentId: student._id,
                      studentName: student.name,
                      regNumber: student.regNumber,
                      subject: record.subject,
                      attendance: record.percentage,
                    })),
                )
                .sort((a, b) => a.attendance - b.attendance)
                .map((item, index) => (
                  <TableRow key={`${item.studentId}-${item.subject}-${index}`}>
                    <TableCell className="font-medium">{item.studentName}</TableCell>
                    <TableCell>{item.regNumber}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div className="h-2.5 rounded-full bg-red-500" style={{ width: `${item.attendance}%` }}></div>
                        </div>
                        <span>{item.attendance}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

