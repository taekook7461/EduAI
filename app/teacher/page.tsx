"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeacherDashboard() {
  const router = useRouter();

  // ⇢ динамические данные
  const [stats, setStats] = useState({
    activeStudents: 0,
    avgProgress: "0%",
    newTasks: 0,
  });

  const [loading, setLoading] = useState(true);

  // ✅ Загружаем статистику из нового эндпоинта /teacher/:id/stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const teacherId = sessionStorage.getItem("user_id");
        const token = sessionStorage.getItem("auth_token");

        if (!teacherId || !token) {
          console.error("Missing teacherId or token");
          return;
        }

        const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/${teacherId}/stats`, 

          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          console.error("Failed to load stats:", res.status);
          return;
        }

        const data = await res.json();

        setStats({
          activeStudents: data.active_students || 0,
          avgProgress: `${data.avg_success || 0}%`,
          newTasks: data.new_tasks || 0,
        });
      } catch (err) {
        console.error("Error loading teacher stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // 🔄 автообновление каждые 30 секунд
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Секции интерфейса
  const sections = [
    {
      title: "Сабаққа қатысу журналы",
      description:
        "Оқушылардың сабақтағы қатысуын нақты уақыт режимінде белгілеңіз",
      icon: BarChart3,
      href: "/teacher/journal",
    },
    {
      title: "Python бойынша тапсырмалар",
      description: "Интерактивті тапсырмаларды оқушыларға беріңіз",
      icon: BookOpen,
      href: "/teacher/tasks",
    },
    {
      title: "Рейтинг және статистика",
      description: "Тақырыптарға қарай үлгерімді қараңыз және талдаңыз",
      icon: TrendingUp,
      href: "/teacher/rating",
    },
  ];

  if (loading)
    return (
      <div className="text-center text-slate-600 mt-20 text-lg">
        Жүктелуде...
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Қош келдіңіз, Мұғалім</h2>
        <p className="text-muted-foreground">
          Сыныбыңызды басқарып, оқушылардың үлгерімін бақылаңыз
        </p>
      </div>

      {/* 📊 Статистика блоктары */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          label="Белсенді оқушылар"
          value={stats.activeStudents}
          icon={Users}
        />
        <StatCard
          label="Жалпы үлгерім"
          value={stats.avgProgress}
          icon={TrendingUp}
        />
        <StatCard
          label="Жаңа тапсырмалар"
          value={stats.newTasks}
          icon={Zap}
        />
      </div>

      {/* 🔹 Разделы */}
      <div className="grid md:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.href}
              onClick={() => router.push(section.href)}
              className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200/50 hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer group"
            >
              <Icon className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 mb-2">
                {section.title}
              </h3>
              <p className="text-sm text-slate-600">
                {section.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* 👩‍🏫 Управление студентами */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900 mb-2">
              Оқушыларды басқару
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Оқушылардың профильдерін жасап, қолжетімділігін басқарыңыз
            </p>
            <Button
              onClick={() => router.push("/teacher/students")}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Users className="w-4 h-4" />
              Оқушыларды басқару
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Компонент карточки статистики
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: any;
  icon: any;
}) {
  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50 hover:shadow-md transition-all">
      <p className="text-sm text-slate-600 font-semibold">{label}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  );
}
