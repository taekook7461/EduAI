"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  Calendar,
  Brain,
} from "lucide-react"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token")
    const role = sessionStorage.getItem("role")

    if (!token || role !== "teacher") {
      router.push("/")
      return
    }

    setIsAuth(true)
  }, [router])

  const handleLogout = () => {
    sessionStorage.clear()
    router.push("/")
  }

  if (!isAuth) {
    return <div className="p-8">Загрузка...</div>
  }

  const navItems = [
    { href: "/teacher", label: "Басты бет", icon: Home },
    { href: "/teacher/students", label: "Оқушылар", icon: Users },
    { href: "/teacher/tasks", label: "Тапсырмалар", icon: BookOpen },
    { href: "/teacher/journal", label: "Журнал", icon: Calendar },
    { href: "/teacher/rating", label: "Рейтинг", icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-purple-700">EduAI: Python System</h1>
              <p className="text-xs text-gray-600">Информатика сабағының автоматтандырылған жүйесі</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3 text-base"
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Шығу
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}

