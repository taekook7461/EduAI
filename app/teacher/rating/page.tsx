"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Award, TrendingUp, Users } from "lucide-react";

interface StudentData {
  id: number;
  first_name: string;
  last_name: string;
  attendance: number;
  taskPoints: number;
  rating: number;
}

export default function RatingPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем teacherId и токен
  const teacherId =
    typeof window !== "undefined" ? sessionStorage.getItem("user_id") : null;
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("auth_token")
      : null;

  useEffect(() => {
    const loadData = async () => {
      if (!teacherId || !token) {
        setError("Авторизация қажет. Жүйеге кіріңіз.");
        setLoading(false);
        return;
      }

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"}/api/teacher/${teacherId}/students`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.message || `HTTP ${res.status}`);
        }

        const realData = await res.json();

        // Добавляем моковые данные (attendance, taskPoints, rating)
        const dataWithMockStats: StudentData[] = realData.map((s: any) => ({
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          attendance: Math.floor(70 + Math.random() * 30), // 70–100%
          taskPoints: Math.floor(60 + Math.random() * 40), // 60–100 баллов
          rating: Math.floor(60 + Math.random() * 40), // 60–100 общий рейтинг
        }));

        setStudents(dataWithMockStats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teacherId, token]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl">
        Рейтинг жүктелуде...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 text-xl">
        Оқушылар табылмады.
      </div>
    );
  }

  const averageRating = (
    students.reduce((sum, s) => sum + s.rating, 0) / students.length
  ).toFixed(1);
  const topStudent = students.reduce(
    (top, curr) => (curr.rating > top.rating ? curr : top),
    students[0]
  );

  const chartData = students.map((s) => ({
    name: `${s.first_name} ${s.last_name}`,
    rating: s.rating,
    attendance: s.attendance,
    taskPoints: s.taskPoints,
  }));

  return (
    <div className="space-y-8 p-8 min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div>
        <h2 className="text-3xl font-bold mb-2">
          Оқушылардың рейтингтер көрсеткіштері
        </h2>
        <p className="text-muted-foreground">
          Үлгерім мен қатысу көрсеткіштерін талдау
        </p>
      </div>

      {/* Инфо карточки */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-blue-950/20 border-blue-500/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Орташа рейтинг</p>
              <p className="text-3xl font-bold">{averageRating}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6 bg-purple-950/20 border-purple-500/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Үздік оқушы</p>
              <p className="text-lg font-bold">
                {topStudent.first_name} {topStudent.last_name}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-6 bg-cyan-950/20 border-cyan-500/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Жалпы оқушылар саны
              </p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <Users className="w-8 h-8 text-cyan-400" />
          </div>
        </Card>
      </div>

      {/* Диаграмма по рейтингам */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Жалпы рейтинг (0.4 қатысу + 0.6 тапсырма)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rating" fill="#7c3aed" name="Рейтинг" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Диаграмма по қатысу мен тапсырмалар */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Қатысу мен тапсырма ұпайлары</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#22c55e" name="Қатысу (%)" />
                <Bar dataKey="taskPoints" fill="#3b82f6" name="Тапсырма ұпайы" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
