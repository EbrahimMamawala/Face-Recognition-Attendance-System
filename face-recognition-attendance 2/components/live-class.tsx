import { getLiveClass, getLiveAttendees } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function LiveClass() {
  const liveClass = await getLiveClass()
  const attendees = await getLiveAttendees()

  if (!liveClass) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Live Class</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There is no class in session at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LIVE: {liveClass.subject} Class</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium mb-4">Attendees:</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendees.length > 0 ? (
              attendees.map((attendee) => (
                <TableRow key={attendee._id}>
                  <TableCell className="font-medium">{attendee.name}</TableCell>
                  <TableCell>{attendee.time}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No attendees yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

