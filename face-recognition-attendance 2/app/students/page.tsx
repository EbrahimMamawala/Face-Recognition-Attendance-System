import { Suspense } from "react"
import ClientSearch from "@/components/client-search"

export default function StudentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Students Directory</h1>

      <div className="mb-6">
        <p className="text-muted-foreground">
          Search and manage all students registered in the face recognition attendance system.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center">Loading students...</div>}>
        <ClientSearch />
      </Suspense>
    </div>
  )
}

