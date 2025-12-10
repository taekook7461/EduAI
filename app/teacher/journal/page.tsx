"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Calendar } from "@/components/calendar";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  total_xp?: number;
  current_level?: number;
  streak?: number;
}

interface AttendanceRecord {
  id: number;
  name: string;
  present: boolean;
  reason?: string;
  time?: string;
}

export default function JournalPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord[]>>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reasonForm, setReasonForm] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const teacherId = typeof window !== "undefined" ? sessionStorage.getItem("user_id") : null;
  const token = typeof window !== "undefined" ? sessionStorage.getItem("auth_token") : null;

  const dateKey = selectedDate.toISOString().split("T")[0];

  // ✅ Fetch students from backend
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teacher/${teacherId}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error("Ошибка загрузки студентов");
        }

        const data = await res.json();

        const normalized = data.map((s: Student) => ({
          ...s,
          name: `${s.first_name} ${s.last_name}`
        }));

        setStudents(normalized);
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId && token) {
      loadStudents();
    }
  }, [teacherId, token]);

  // ✅ Generate attendance for selected date
  const todayAttendance: AttendanceRecord[] =
    attendanceData[dateKey] ||
    students.map((s) => ({
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      present: false,
      reason: "",
      time: "",
    }));

  // ✅ Toggle present/absent
  const toggleAttendance = (studentId: number) => {
    const updated = todayAttendance.map((s) =>
      s.id === studentId
        ? {
            ...s,
            present: !s.present,
            reason: !s.present ? "" : s.reason,
            time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          }
        : s
    );

    setAttendanceData((prev) => ({
      ...prev,
      [dateKey]: updated
    }));
  };

  // ✅ Set reason for absence
  const setReason = (studentId: number, reason: string) => {
    const updated = todayAttendance.map((s) =>
      s.id === studentId ? { ...s, present: false, reason } : s
    );

    setAttendanceData((prev) => ({
      ...prev,
      [dateKey]: updated
    }));

    setReasonForm(null);
  };

  const ABSENCE_REASONS = ["Ауыруда", "Себепсіз қатыспау", "Кешігу", "Ерте кету", "Басқа себеп"];

  // ✅ Save
  const handleSave = () => {
    setSaved(true);
    alert("✓ Қатысу деректері сақталды (локально)!");
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <div className="p-8 text-xl text-center">Загрузка студентов...</div>;
  }

  const presentCount = todayAttendance.filter((s) => s.present).length;
  const absentCount = todayAttendance.filter((s) => !s.present && s.reason).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold">Сабаққа қатысу журналы</h2>
        <p className="text-muted-foreground">Студенттердің сабаққа қатысуын күндер бойынша белгілеңіз</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* ✅ Calendar */}
        <div className="lg:col-span-1">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            markedDates={Object.keys(attendanceData).map((k) => new Date(k))}
          />
        </div>

        {/* ✅ Main */}
        <div className="lg:col-span-3 space-y-6">
          {/* Info cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-sm text-muted-foreground">Күні</p>
              <p className="text-lg font-bold">{selectedDate.toLocaleDateString("ru-RU")}</p>
            </Card>

            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-sm text-muted-foreground">Қатысқандар</p>
              <p className="text-lg font-bold text-green-700">
                {presentCount}/{students.length}
              </p>
            </Card>

            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-sm text-muted-foreground">Қатыспағандар</p>
              <p className="text-lg font-bold text-red-700">{absentCount}</p>
            </Card>
          </div>

          {/* ✅ Table */}
          <Card className="overflow-hidden border-blue-100 shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead />
                  <TableHead>Аты-жөні</TableHead>
                  <TableHead>Күйі</TableHead>
                  <TableHead>Себебі</TableHead>
                  <TableHead>Уақыт</TableHead>
                  <TableHead>Әрекет</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {todayAttendance.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={student.present}
                        onCheckedChange={() => toggleAttendance(student.id)}
                      />
                    </TableCell>

                    <TableCell>{student.name}</TableCell>

                    <TableCell>
                      {student.present ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" /> Қатысуда
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-700">
                          <AlertCircle className="w-4 h-4 mr-1" /> Қатыспады
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {student.reason && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                          {student.reason}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>{student.time || "—"}</TableCell>

                    <TableCell>
                      {!student.present && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReasonForm(reasonForm === student.id ? null : student.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>

                          {reasonForm === student.id && (
                            <div className="absolute top-6 bg-white border p-2 rounded shadow-md z-10">
                              {ABSENCE_REASONS.map((reason) => (
                                <div
                                  key={reason}
                                  className="cursor-pointer text-sm p-2 hover:bg-blue-100 rounded"
                                  onClick={() => setReason(student.id, reason)}
                                >
                                  {reason}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
              {saved ? "✓ Сақталды" : "Сақтау"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const updated = { ...attendanceData };
                delete updated[dateKey];
                setAttendanceData(updated);
              }}
            >
              Тазалау
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
