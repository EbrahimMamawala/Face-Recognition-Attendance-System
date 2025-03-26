import { getTimeTable } from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function TimeTable() {
  const timeTable = await getTimeTable()

  // Get unique time slots from the timetable
  const timeSlots = Array.from(new Set(timeTable.map((entry) => `${entry.start_time}-${entry.end_time}`))).sort()

  // Get all days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  // Create a structured timetable
  const structuredTimeTable: Record<string, Record<string, string>> = {}

  days.forEach((day) => {
    structuredTimeTable[day] = {}
    timeSlots.forEach((slot) => {
      structuredTimeTable[day][slot] = ""
    })
  })

  // Fill in the timetable with subjects
  timeTable.forEach((entry) => {
    const timeSlot = `${entry.start_time}-${entry.end_time}`
    if (timeSlots.includes(timeSlot) && days.includes(entry.day)) {
      structuredTimeTable[entry.day][timeSlot] = entry.subject
    }
  })

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Day</TableHead>
            {timeSlots.map((slot) => (
              <TableHead key={slot}>{slot}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => (
            <TableRow key={day}>
              <TableCell className="font-medium">{day}</TableCell>
              {timeSlots.map((slot) => (
                <TableCell key={`${day}-${slot}`}>{structuredTimeTable[day][slot]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

