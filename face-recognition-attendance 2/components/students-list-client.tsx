"use client"

import Link from "next/link"
import type { Student } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface StudentsListProps {
  students: Student[]
}

export default function StudentsList({ students }: StudentsListProps) {
  if (students.length === 0) {
    return <div className="text-center p-8">No students found</div>
  }

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

