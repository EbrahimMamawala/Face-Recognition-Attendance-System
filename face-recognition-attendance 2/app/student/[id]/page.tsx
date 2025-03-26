import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getStudentById, getStudentAttendance } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function StudentPage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id)
  const attendanceHistory = await getStudentAttendance(params.id)

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Student Not Found</h1>
          <p>The student you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  // Group attendance history by subject
  const historyBySubject = attendanceHistory.reduce(
    (acc, record) => {
      if (!acc[record.subject]) {
        acc[record.subject] = []
      }
      acc[record.subject].push(record)
      return acc
    },
    {} as Record<string, typeof attendanceHistory>,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Student Details</h1>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="font-medium">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Registration Number</p>
              <p className="font-medium">{student.regNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Attendance Summary</TabsTrigger>
            <TabsTrigger value="history">Attendance History</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Summary of attendance across all subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Total Classes</TableHead>
                      <TableHead>Classes Attended</TableHead>
                      <TableHead>Attendance Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.attendance.length > 0 ? (
                      student.attendance.map((record) => (
                        <TableRow key={record.subject}>
                          <TableCell className="font-medium">{record.subject}</TableCell>
                          <TableCell>{record.totalClasses}</TableCell>
                          <TableCell>{record.attended}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    record.percentage >= 75 ? "bg-green-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${record.percentage}%` }}
                                ></div>
                              </div>
                              <span>{record.percentage}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Detailed history of attendance for each class</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(historyBySubject).length > 0 ? (
                  Object.entries(historyBySubject).map(([subject, records]) => (
                    <div key={subject} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{subject}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {records.map((record) => (
                            <TableRow key={record._id}>
                              <TableCell>{record.date}</TableCell>
                              <TableCell>{record.time}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p>No attendance history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

