"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, Pencil, Search } from "lucide-react";

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [editStudent, setEditStudent] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const teacherId =
    typeof window !== "undefined" ? sessionStorage.getItem("user_id") : null;
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("auth_token")
      : null;

  useEffect(() => {
    if (teacherId && token) loadStudents();
  }, [teacherId, token]);

  const loadStudents = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/${teacherId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Ошибка загрузки");

      const data = await res.json();

      const mapped = data.map((s: any) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email || "—",
        xp: s.total_xp || 0,
        tasksCompleted: Math.round((s.total_xp || 0) / 100),
        attendance: s.attendance || 0,
        rating: s.rating || 0,
      }));

      setStudents(mapped);
      setFilteredStudents(mapped);
    } catch (err: any) {
      setError(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------
  // 🔍 SEARCH — фильтрация студентов
  // --------------------------------------------
  const handleSearch = (value: string) => {
    setSearchQuery(value);

    const lower = value.toLowerCase();

    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.email.toLowerCase().includes(lower)
    );

    setFilteredStudents(filtered);
  };

  const handleAddStudent = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/${teacherId}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newStudent),
        }
      );

      if (!res.ok) throw new Error("Не удалось добавить");

      setShowForm(false);
      setNewStudent({ first_name: "", last_name: "", email: "" });

      await loadStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/${teacherId}/students/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Ошибка удаления");

      await loadStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (student: any) => {
    setEditStudent({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
    });
    setEditStudentId(student.id);
    setShowEditForm(true);
  };

  const applyEdit = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teacher/${teacherId}/students/${editStudentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editStudent),
        }
      );

      if (!res.ok) throw new Error("Ошибка обновления");

      setShowEditForm(false);
      setEditStudentId(null);

      await loadStudents();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Жүктелуде...
      </div>
    );

  if (error)
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Оқушыларды басқару</h2>
          <p className="text-slate-600">Оқушылардың үлгерімі мен прогресін бақылаңыз</p>
        </div>
      </div>

      {/* 🔎 SEARCH FIELD */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Іздеу: аты, email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add student button */}
      {!showForm && !showEditForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 bg-blue-600"
        >
          <Plus className="w-4 h-4" /> Жаңа оқушы қосу
        </Button>
      )}

      {/* --- ADD FORM --- */}
      {showForm && (
        <Card className="p-6 border-2 border-blue-200">
          <h3 className="font-bold text-xl mb-4">Жаңа оқушыны тіркеу</h3>

          <div className="space-y-4">
            <Input
              placeholder="Аты"
              value={newStudent.first_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, first_name: e.target.value })
              }
            />

            <Input
              placeholder="Тегі"
              value={newStudent.last_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, last_name: e.target.value })
              }
            />

            <Input
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, email: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button onClick={handleAddStudent} className="bg-green-600">
                Қосу
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Болдырмау
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* --- EDIT STUDENT FORM --- */}
      {showEditForm && (
        <Card className="p-6 border-2 border-purple-200">
          <h3 className="font-bold text-xl mb-4">Оқушыны өзгерту</h3>

          <div className="space-y-4">
            <Input
              placeholder="Аты"
              value={editStudent.first_name}
              onChange={(e) =>
                setEditStudent({ ...editStudent, first_name: e.target.value })
              }
            />

            <Input
              placeholder="Тегі"
              value={editStudent.last_name}
              onChange={(e) =>
                setEditStudent({ ...editStudent, last_name: e.target.value })
              }
            />

            <Input
              placeholder="Email"
              value={editStudent.email}
              onChange={(e) =>
                setEditStudent({ ...editStudent, email: e.target.value })
              }
            />

            <div className="flex gap-3">
              <Button onClick={applyEdit} className="bg-purple-600">
                Сақтау
              </Button>
              <Button variant="outline" onClick={() => setShowEditForm(false)}>
                Болдырмау
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* --- LIST --- */}
      <h3 className="font-bold text-lg">Оқушылар тізімі ({filteredStudents.length})</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="p-4 border-2 border-blue-200">
            <div className="flex justify-between">
              <div>
                <h4 className="font-bold">{student.name}</h4>
                <p className="text-sm">{student.email}</p>

                <div className="mt-3 text-sm space-x-4">
                  <span className="text-blue-700 font-semibold">
                    XP: {student.xp}
                  </span>
                  <span className="text-purple-700 font-semibold">
                    Тапсырмалар: {student.tasksCompleted}
                  </span>
                </div>

                <div className="text-sm">Қатысу: {student.attendance}%</div>
                <div className="text-sm">Рейтинг: {student.rating}</div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(student)}>
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteStudent(student.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
