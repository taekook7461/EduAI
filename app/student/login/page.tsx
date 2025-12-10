"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function StudentLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Қате: логин немесе пароль дұрыс емес")
      }

      // ✅ Сохраняем токен
      localStorage.setItem("token", data.token)

      // 🔁 Переход на страницу заданий
      router.push("/student/tasks")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-700 to-purple-800 p-4">
      <Card className="max-w-md w-full p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">🎓 Оқушы кіру</h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/20 border-0 focus:ring-2 focus:ring-fuchsia-400 text-white"
              placeholder="student1@edu.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white/80">Құпия сөз</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/20 border-0 focus:ring-2 focus:ring-fuchsia-400 text-white"
              placeholder="Student123!"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90 text-white font-semibold mt-4"
          >
            Кіру
          </Button>
        </form>
      </Card>
    </div>
  )
}
