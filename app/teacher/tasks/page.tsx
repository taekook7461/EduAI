"use client";

import React, { useEffect, useState } from "react";
import { teacherAPI } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Send,
  CheckCircle,
  Brain,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "difficulty">("date");

  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  const [showAIAnalysis, setShowAIAnalysis] = useState<number | null>(null);
  const [showStudentAnswers, setShowStudentAnswers] = useState<number | null>(null);

  const [assignedSet, setAssignedSet] = useState<Set<number>>(new Set());

  // ✅ загрузка задач
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await teacherAPI.getTasks();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading tasks:", err);
        alert("❌ Серверге қосыла алмадым");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // ✅ тағайындау
  const handleAssign = async (taskId: number) => {
    try {
      setAssignedSet((prev) => new Set(prev.add(taskId)));
      await teacherAPI.assignTask(taskId);

      alert("✓ Тапсырма оқушыларға жіберілді!");

      setTimeout(() => {
        setAssignedSet((prev) => {
          const updated = new Set(prev);
          updated.delete(taskId);
          return updated;
        });
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("❌ Тапсырманы тағайындау қате");
    }
  };

  // ✅ жою
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Бұл тапсырманы жоюға сенімдісіз бе?")) return;

    try {
      await teacherAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      alert("✓ Тапсырма жойылды");
    } catch (err) {
      console.error(err);
      alert("❌ Жою мүмкін болмады");
    }
  };

  // ✅ генерация AI
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAI(true);

    try {
      const result = await teacherAPI.generateTask(aiPrompt);

      if (result && result.task_id) {
        // получаем только что созданный таск
        const newList = await teacherAPI.getTasks();
        setTasks(newList);
      }

      setOpenAIDialog(false);
      setAIPrompt("");
    } catch (err) {
      console.error(err);
      alert("❌ ЖИ тапсырма құра алмады");
    } finally {
      setGeneratingAI(false);
    }
  };

  // сортировка
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "date") {
      return (a.created_at || "").localeCompare(b.created_at || "");
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="w-full text-center mt-20 text-lg text-slate-600">
        Жүктелуде...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Python бойынша тапсырмалар</h2>
        <p className="text-muted-foreground">
          Тапсырмаларды басқарыңыз, жауаптарды қарап шығыңыз, ЖИ-мен жаңа тапсырмалар жасаңыз
        </p>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="bg-white border mb-4">
          <TabsTrigger value="tasks">Барлық тапсырмалар</TabsTrigger>
          <TabsTrigger value="filter">Күн бойынша</TabsTrigger>
          <TabsTrigger value="analysis">ЖИ талдауы</TabsTrigger>
          <TabsTrigger value="aigenerate">
            <Sparkles className="w-4 h-4 mr-2" />
            ЖИ генераторы
          </TabsTrigger>
        </TabsList>

        {/* ✅ LIST VIEW */}
        <TabsContent value="tasks">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setSortBy("date")}
              variant={sortBy === "date" ? "default" : "outline"}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Күндер бойынша
            </Button>
          </div>

          <div className="grid gap-4">
            {sortedTasks.map((task) => (
              <Card key={task.id} className="p-6 hover:bg-blue-50 border-blue-100">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <Badge>{task.difficulty || "—"}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleAssign(task.id)}
                      className={
                        assignedSet.has(task.id)
                          ? "bg-green-600 text-white"
                          : "bg-purple-600 text-white"
                      }
                    >
                      {assignedSet.has(task.id) ? "✓ Жіберілді" : "Тағайындау"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        setShowAIAnalysis(
                          showAIAnalysis === task.id ? null : task.id
                        )
                      }
                    >
                      <Brain className="w-4 h-4" />
                      ЖИ талдауы
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Жою
                    </Button>
                  </div>
                </div>

                {showAIAnalysis === task.id && (
                  <div className="mt-4 p-4 bg-blue-50 rounded border">
                    <p>{task.ai_analysis || "ЖИ талдауы әзірше жоқ"}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
                  {/* ✅ FILTER VIEW */}
        <TabsContent value="filter">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {tasks.length > 0 &&
              [...new Set(tasks.map((t) => t.created_at))]
                .filter((d) => !!d) // 🔹 убираем пустые даты
                .map((date, index) => (
                  <Button
                    key={`${date}-${index}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {date
                      ? new Date((date || "").replace(" ", "T")).toLocaleDateString("kk-KZ", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "(уақыт көрсетілмеген)"}
                  </Button>
                ))}
          </div>

          <div className="grid gap-4">
            {tasks
              .filter((t) => t.created_at === selectedDate)
              .map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex justify-between">
                    <h4>{task.title}</h4>
                    <Button
                      size="sm"
                      className="bg-purple-600 text-white"
                      onClick={() => handleAssign(task.id)}
                    >
                      Тағайындау
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* ✅ ANALYSIS VIEW */}
        <TabsContent value="analysis">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4 mb-3">
              <h4 className="font-bold">{task.title}</h4>
              <p className="mt-2 text-sm">
                {task.ai_analysis || "ЖИ талдауы әзірше жоқ"}
              </p>
            </Card>
          ))}
        </TabsContent>

        {/* ✅ AI GENERATE */}
        <TabsContent value="aigenerate">
          <Dialog open={openAIDialog} onOpenChange={setOpenAIDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                ЖИ көмегімен жаңа тапсырма
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>ЖИ генерациясы</DialogTitle>
                <DialogDescription>
                  Тапсырманың сипаттамасын жазыңыз — ЖИ жаңа нұсқа жасайды.
                </DialogDescription>
              </DialogHeader>

              <Textarea
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="Мысалы: «Циклдер бойынша тапсырма жаса»"
              />

              <Button
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className="bg-blue-600 text-white w-full mt-2"
              >
                {generatingAI ? "🤖 Генерациялануда..." : "✨ Генерациялау"}
              </Button>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
