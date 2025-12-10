"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Home, User } from "lucide-react"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token")
    const role = sessionStorage.getItem("role")

    if (!token || role !== "student") {
      router.push("/")
    } else {
      setIsAuthenticated(true)
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    sessionStorage.clear()
    router.push("/")
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Жүктелуде...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A855F7] via-[#8B5CF6] to-[#6D28D9] text-white">
      {/* Навигация */}
      <nav className="border-b border-white/10 bg-white/10 backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">P8</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Оқушы порталы</h1>
              <p className="text-xs text-white/70">Орындалған тапсырмалар</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/student/profile")}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Парақша</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Басты бет</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-white/80 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Шығу</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Негізгі контент */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
