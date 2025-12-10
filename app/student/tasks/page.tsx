"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Lightbulb,
  Code,
  Trophy,
  Zap,
  Flame,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Assignment {
  id: number
  topic: string
  difficulty: string
  task: string
  example: string
  hints: string[]
  xp: number
}

const ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    topic: "Айнымалылар",
    difficulty: "Бастапқы деңгей",
    task: "Атың мен жасыңды сақтайтын айнымалыларды құрып, оларды экранға шығар.",
    example: `name = "Айгерім"
age = 15
print(f"Менің атым {name}, менің жасым {age} жаста")`,
    hints: [
      "Мәтінді форматтау үшін f-жолдарды қолдан",
      "Айнымалыны = арқылы тағайындауға болады",
      "print() функциясы мәтінді экранға шығарады",
    ],
    xp: 100,
  },
  {
    id: 2,
    topic: "Шартты операторлар",
    difficulty: "Бастапқы деңгей",
    task: "Берілген санның жұп немесе тақ екенін тексеріп, нәтижені шығар.",
    example: `number = 10
if number % 2 == 0:
    print("Жұп сан")
else:
    print("Тақ сан")`,
    hints: [
      "% — қалдық табу операторы",
      "if/else — шартты тексеру құрылымы",
      "Қалдық 0 болса, сан жұп",
    ],
    xp: 150,
  },
  {
    id: 3,
    topic: "Циклдар",
    difficulty: "Орта деңгей",
    task: "1-ден 10-ға дейінгі сандарды бір жолға шығаратын бағдарлама жаз.",
    example: `for i in range(1, 11):
    print(i, end=" ")`,
    hints: [
      "range(1, 11) — 1-ден 10-ға дейін сандар тізімін жасайды",
      "end=' ' — жолды ауыстырмайды",
      "for — қайталануды орындайды",
    ],
    xp: 200,
  },
]

export default function StudentTasksPage() {
  const [currentTask, setCurrentTask] = useState(0)
  const [code, setCode] = useState("")
  const [checkResult, setCheckResult] = useState<{
    status: "success" | "error" | null
    message: string
  }>({ status: null, message: "" })
  const [copied, setCopied] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set())
  const [totalXP, setTotalXP] = useState(250)
  const [streak, setStreak] = useState(3)

  const handleCheck = () => {
    if (!code.trim()) {
      setCheckResult({ status: "error", message: "Кодты жазып көр!" })
      return
    }

    const isCorrect = Math.random() > 0.3
    if (isCorrect) {
      const xpReward = ASSIGNMENTS[currentTask].xp
      setCheckResult({
        status: "success",
        message: `✅ Дұрыс! +${xpReward} XP | Керемет жұмыс!`,
      })
      setTotalXP((prev) => prev + xpReward)
      setCompletedTasks((prev) => new Set([...prev, ASSIGNMENTS[currentTask].id]))
      setStreak((prev) => prev + 1)
    } else {
      setCheckResult({
        status: "error",
        message: "Қате! Кодты қайта қарап көр!",
      })
      setStreak(1)
    }
  }

  const handleCopyExample = () => {
    navigator.clipboard.writeText(ASSIGNMENTS[currentTask].example)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const task = ASSIGNMENTS[currentTask]
  const completionPercentage = Math.round((completedTasks.size / ASSIGNMENTS.length) * 100)
  const currentLevel = Math.floor(totalXP / 500) + 1

  return (
    <div className="space-y-8 bg-gradient-to-br from-[#A855F7] via-[#8B5CF6] to-[#6D28D9] min-h-screen p-8 text-white">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-300 animate-pulse" />
          Менің тапсырмаларым
        </h2>
        <p className="text-white/80">
          Python тілінде бағдарламалау дағдыларыңызды арттырыңыз 🧠
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/5 rounded-xl shadow-lg backdrop-blur-md text-center hover:bg-white/10 transition-all">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
          <p className="text-sm text-white/80">Деңгей</p>
          <p className="text-2xl font-bold">{currentLevel}</p>
        </Card>
        <Card className="p-4 bg-white/5 rounded-xl shadow-lg backdrop-blur-md text-center hover:bg-white/10 transition-all">
          <Zap className="w-6 h-6 text-blue-300 mx-auto mb-1" />
          <p className="text-sm text-white/80">XP ұпай</p>
          <p className="text-2xl font-bold">{totalXP}</p>
        </Card>
        <Card className="p-4 bg-white/5 rounded-xl shadow-lg backdrop-blur-md text-center hover:bg-white/10 transition-all">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
          <p className="text-sm text-white/80">Серия</p>
          <p className="text-2xl font-bold">{streak} күн</p>
        </Card>
        <Card className="p-4 bg-white/5 rounded-xl shadow-lg backdrop-blur-md text-center hover:bg-white/10 transition-all">
          <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <p className="text-sm text-white/80">Прогресс</p>
          <p className="text-2xl font-bold">{completionPercentage}%</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-4 bg-white/5 rounded-xl backdrop-blur-md shadow-md">
        <div className="flex justify-between items-center mb-2 text-sm">
          <p className="text-white/80">Ағымдағы деңгейдің прогресі</p>
          <p className="text-white/60">{totalXP % 500}/500 XP</p>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-yellow-400 via-fuchsia-500 to-purple-700 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all"
            style={{ width: `${((totalXP % 500) / 500) * 100}%` }}
          ></div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="bg-white/5 backdrop-blur-md rounded-xl p-1">
          <TabsTrigger value="tasks" className="text-white data-[state=active]:bg-fuchsia-600/80 data-[state=active]:text-yellow-200 rounded-lg transition">
            Тапсырмалар
          </TabsTrigger>
          <TabsTrigger value="hints" className="text-white data-[state=active]:bg-fuchsia-600/80 data-[state=active]:text-yellow-200 rounded-lg transition">
            Кеңестер
          </TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks" className="space-y-5">
          {/* Task Buttons */}
          <div className="flex gap-2 flex-wrap mb-4">
            {ASSIGNMENTS.map((assignment, idx) => (
              <Button
                key={assignment.id}
                variant={currentTask === idx ? "default" : "outline"}
                onClick={() => {
                  setCurrentTask(idx)
                  setCode("")
                  setCheckResult({ status: null, message: "" })
                }}
                className={`${
                  currentTask === idx
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white"
                    : completedTasks.has(assignment.id)
                      ? "bg-green-300 text-green-900"
                      : "bg-white/10 text-white hover:bg-white/20"
                } rounded-full border-0 hover:scale-105 transition`}
              >
                {completedTasks.has(assignment.id) && <CheckCircle2 className="w-4 h-4 mr-1" />}
                {idx + 1}-тапсырма
              </Button>
            ))}
          </div>

          {/* Task Card */}
          <Card className="p-6 bg-white/5 rounded-xl backdrop-blur-md shadow-md">
            <h3 className="text-lg font-semibold mb-2">📘 {task.topic}</h3>
            <p className="text-white/80">{task.task}</p>
            <div className="flex gap-2 mt-3">
              <Badge className="bg-fuchsia-600/30 text-yellow-200 border-0">
                {task.difficulty}
              </Badge>
              <Badge className="bg-blue-500/30 text-blue-100 border-0">
                +{task.xp} XP
              </Badge>
            </div>
          </Card>

          {/* Code area */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="💻 Мұнда Python кодын жаз..."
            className="w-full h-64 p-4 bg-white/5 text-white font-mono text-sm rounded-xl border-0 focus:ring-2 focus:ring-fuchsia-400 placeholder-white/60 resize-none backdrop-blur-md"
          />

          {/* Result */}
          {checkResult.status && (
            <Card
              className={`p-4 flex items-start gap-3 rounded-xl ${
                checkResult.status === "success"
                  ? "bg-green-500/10 text-green-200"
                  : "bg-red-500/10 text-red-200"
              }`}
            >
              {checkResult.status === "success" ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5" />
              )}
              <p className="text-sm">{checkResult.message}</p>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCheck}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:opacity-90 text-white flex-1 font-semibold"
            >
              Тексеру
            </Button>
            <Button
              variant="outline"
              onClick={() => setCode("")}
              className="bg-white/10 text-white border-0 hover:bg-white/20"
            >
              Тазалау
            </Button>
          </div>

          {/* Example */}
          <Card className="p-4 bg-white/5 rounded-xl backdrop-blur-md relative">
            <pre className="text-white font-mono text-sm overflow-auto whitespace-pre-wrap">
              {task.example}
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={handleCopyExample}
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied ? "Көшірілді" : "Көшіру"}
            </Button>
          </Card>
        </TabsContent>

        {/* Hints */}
        <TabsContent value="hints" className="space-y-4">
          {ASSIGNMENTS.map((assignment, idx) => (
            <Card key={assignment.id} className="p-4 bg-white/5 rounded-xl backdrop-blur-md shadow-md">
              <h4 className="font-semibold mb-3 text-white">
                💡 {idx + 1}-тапсырма: {assignment.topic}
              </h4>
              <div className="space-y-2">
                {assignment.hints.map((hint, hintIdx) => (
                  <div
                    key={hintIdx}
                    className="flex gap-2 p-3 bg-yellow-500/10 rounded-lg text-yellow-100"
                  >
                    <Lightbulb className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="text-sm">{hint}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
