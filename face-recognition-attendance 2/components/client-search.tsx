"use client"

import { useState, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Student } from "@/lib/data"
import StudentsList from "./students-list-client"
import { debounce } from "@/lib/utils"

export default function ClientSearch() {
  const [query, setQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStudents = useCallback(async (searchQuery: string) => {
    setLoading(true)
    try {
      const url = searchQuery ? `/api/students?query=${encodeURIComponent(searchQuery)}` : "/api/students"

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error searching students:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce the search to avoid too many requests
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetchStudents(value)
    }, 300),
    [fetchStudents],
  )

  useEffect(() => {
    debouncedSearch(query)
    // Initial fetch when component mounts
    if (students.length === 0) {
      fetchStudents("")
    }
  }, [query, debouncedSearch, fetchStudents, students.length])

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="search"
          placeholder="Search students by name..."
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <StudentsList students={students} />
      )}
    </div>
  )
}

