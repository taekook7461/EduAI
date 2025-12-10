"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trophy, Zap, Flame, Target } from "lucide-react"

export default function StudentProfile() {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token")
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStudent(data))
      .catch(() => setStudent(null))
  }, [])

  // Auto scale on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 1100) setScale(width / 1300)
      else setScale(1)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600 text-white text-xl font-semibold animate-pulse">
        Жүктелуде...
      </div>
    )
  }

  const xp = Number(student.xp) || 0
  const levelProgress = xp % 1000
  const xpLeft = 1000 - levelProgress

  return (
    <div className="relative min-h-screen flex justify-center items-center bg-gradient-to-br from-[#9B5CFF] via-[#A855F7] to-[#7C3AED] overflow-hidden text-white">
      {/* Background glow */}
      <div className="absolute top-[-200px] left-[-150px] w-[350px] h-[350px] bg-fuchsia-500 rounded-full blur-[120px] opacity-25 animate-pulse" />
      <div className="absolute bottom-[-250px] right-[-150px] w-[350px] h-[350px] bg-indigo-400 rounded-full blur-[120px] opacity-25 animate-pulse" />

      {/* Auto-scaling container */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "transform 0.3s ease-in-out",
        }}
        className="flex justify-center items-center w-full"
      >
        <div className="relative w-[90vw] max-w-3xl rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.15)] p-8 md:p-10 text-center transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]">
          {/* Back button */}
          <button
            onClick={() => router.push("/student")}
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition text-white text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Артқа
          </button>

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg ring-4 ring-white/30 mb-3 animate-[pulse_3s_infinite]">
              {student.first_name?.[0] || "S"}
            </div>
            <h1 className="text-3xl font-extrabold">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-white/70 mt-1 text-base">{student.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <div className="rounded-xl p-6 bg-gradient-to-tr from-[#C084FC]/30 to-[#7C3AED]/40 border border-white/20 hover:scale-[1.03] transition transform">
              <Trophy className="mx-auto text-yellow-400 w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{student.level}</p>
              <p className="text-white/70 text-sm mt-1">Деңгей</p>
            </div>
            <div className="rounded-xl p-6 bg-gradient-to-tr from-[#60A5FA]/30 to-[#34D399]/30 border border-white/20 hover:scale-[1.03] transition transform">
              <Zap className="mx-auto text-amber-300 w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{xp}</p>
              <p className="text-white/70 text-sm mt-1">XP ұпайлары</p>
            </div>
            <div className="rounded-xl p-6 bg-gradient-to-tr from-[#FB923C]/30 to-[#FACC15]/30 border border-white/20 hover:scale-[1.03] transition transform">
              <Flame className="mx-auto text-orange-400 w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{student.streak}</p>
              <p className="text-white/70 text-sm mt-1">Серия</p>
            </div>
          </div>

          {/* Goals */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-5 flex items-center justify-center gap-2">
              <Target className="w-5 h-5" /> Мақсаттар мен жетістіктер
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl p-5 bg-white/10 border border-white/20 text-left">
                <p className="font-semibold mb-2">🧩 Келесі деңгейге жету:</p>
                <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-500 transition-all duration-700 shadow-[0_0_10px_rgba(236,72,153,0.7)]"
                    style={{
                      width: `${Math.min((levelProgress / 1000) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-white/70 mt-2">{xpLeft} XP ұпай қалды</p>
              </div>

              <div className="rounded-xl p-5 bg-white/10 border border-white/20 text-left">
                <p className="font-semibold mb-2">🔥 Күнделікті мақсат:</p>
                <p className="text-white/80 text-sm mb-3">
                  Кем дегенде 3 тапсырма орындаңыз, сонда streak ұлғаяды!
                </p>
                <div className="flex gap-1 justify-between">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                        i < (student.streak % 7)
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]"
                          : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-10 text-sm text-white/70">
            © 2025 <span className="font-semibold text-white">EduAI</span> — Intelligent Learning System
          </p>
        </div>
      </div>
    </div>
  )
}
