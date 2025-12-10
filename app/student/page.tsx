"use client"

import { useRouter } from "next/navigation"
import { Code2, Trophy, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function StudentDashboard() {
  const router = useRouter()

  return (
    <div className="space-y-10 min-h-screen bg-gradient-to-br from-[#E0F2FF] via-[#F5F8FF] to-[#EAF3FF] text-slate-800 p-8 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Қош келдің, оқушы 👋
          </h2>
          <p className="text-slate-500 text-sm">
            Интерактивті тапсырмаларды орындап, Python әлемінде жаңа биіктерге жетіңіз 🚀
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div
          onClick={() => router.push("/student/tasks")}
          className="group p-6 rounded-2xl bg-white/70 border border-blue-100 shadow-md backdrop-blur-md cursor-pointer hover:shadow-xl hover:bg-blue-50/90 transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <Code2 className="w-8 h-8 text-blue-600 opacity-90 group-hover:scale-110 transition" />
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Python
            </span>
          </div>
          <h3 className="text-xl font-bold mt-3 mb-2 text-slate-800">
            Тапсырмаларды орындау
          </h3>
          <p className="text-sm text-slate-600">
            Python бойынша интерактивті тапсырмаларды орындап, ЖИ арқылы автоматты түрде тексеріңіз.
          </p>
        </div>

        <div
          onClick={() => router.push("/student/profile")}
          className="group p-6 rounded-2xl bg-white/70 border border-purple-100 shadow-md backdrop-blur-md cursor-pointer hover:shadow-xl hover:bg-purple-50/80 transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <Trophy className="w-8 h-8 text-purple-600 opacity-90 group-hover:scale-110 transition" />
            <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Progress
            </span>
          </div>
          <h3 className="text-xl font-bold mt-3 mb-2 text-slate-800">
            Менің парақшам
          </h3>
          <p className="text-sm text-slate-600">
            Өзіңіздің XP ұпайларыңызды, деңгейіңізді және жетістіктеріңізді бақылаңыз.
          </p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-8 mt-10">
        <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 shadow-sm">
          <div>
            <p className="text-sm text-slate-700 font-semibold">Орындалған тапсырмалар</p>
            <p className="text-3xl font-extrabold mt-1 text-blue-700">2 / 3</p>
          </div>
          <Trophy className="w-10 h-10 text-blue-500 opacity-80" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Курс бойынша прогресс</h3>
            <span className="text-sm font-semibold text-blue-600">67%</span>
          </div>

          <div className="relative">
            <Progress
              value={67}
              className="h-3 bg-blue-100 overflow-hidden rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all"
              style={{ width: "67%" }}
            ></div>
          </div>

          <p className="text-sm text-slate-600 mt-2">
            Сіз 3 тапсырманың 2-еуін орындадыңыз. Тамаша бастама! ✨
          </p>
        </div>
      </div>
    </div>
  )
}
