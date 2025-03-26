"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Calendar, Clock, Settings, Menu, X, Moon, Sun, History } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Students", href: "/students", icon: Users },
    { name: "Timetable", href: "/timetable", icon: Calendar },
    { name: "Attendance Reports", href: "/attendance", icon: Clock },
    { name: "Recent Attendance", href: "/attendance/recent", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Attendance System</h2>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full justify-start px-4 py-2"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="mr-3 h-5 w-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-3 h-5 w-5" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Spacer for desktop */}
      <div className="hidden md:block w-64 shrink-0" />
    </>
  )
}

