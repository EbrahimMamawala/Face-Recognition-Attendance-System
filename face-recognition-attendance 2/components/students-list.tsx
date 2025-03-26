import Link from "next/link"
import { getStudents } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function StudentsList() {
  const students = await getStudents()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => (
        <Card key={student._id} className="overflow-hidden">
          <CardContent className="p-0">
            <Link href={`/student/${student._id}`}>
              <Button variant="ghost" className="w-full h-full p-6 justify-start">
                <div className="text-left">
                  <h3 className="font-medium">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.regNumber}</p>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

