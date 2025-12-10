"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Teacher {
  id: number;
  email: string;
}

interface Student {
  id: number;
  email: string;
  teacher?: {
    id: number;
    email: string;
  } | null;
}

export default function AdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");

  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [newStudentTeacherId, setNewStudentTeacherId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/teachers"),
        fetch("http://localhost:5000/api/admin/students"),
      ]);

      const tJson = await tRes.json();
      const sJson = await sRes.json();

      setTeachers(tJson);
      setStudents(sJson);
    } catch {
      alert("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newTeacherEmail,
          password: newTeacherPassword,
        }),
      });
      if (!res.ok) throw new Error("Ошибка");
      setNewTeacherEmail("");
      setNewTeacherPassword("");
      fetchData();
    } catch {
      alert("Не удалось добавить учителя");
    }
  }

  async function handleAddStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newStudentEmail,
          password: newStudentPassword,
          teacher_id: newStudentTeacherId || null,
        }),
      });
      if (!res.ok) throw new Error("Ошибка");
      setNewStudentEmail("");
      setNewStudentPassword("");
      setNewStudentTeacherId("");
      fetchData();
    } catch {
      alert("Не удалось добавить студента");
    }
  }

  async function handleAssign(studentId: number, teacherId: string) {
    if (!teacherId) return;
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/assign-student",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            teacher_id: Number(teacherId),
          }),
        }
      );
      if (!res.ok) throw new Error("Ошибка");
      fetchData();
    } catch {
      alert("Не удалось назначить студента");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A259FF] via-[#9B5CFF] to-[#7C3AED] flex flex-col items-center p-6 text-white relative overflow-hidden">
      {/* glowing background orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[400px] h-[400px] bg-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-[400px] h-[400px] bg-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>

      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-extrabold mt-6 mb-10 tracking-tight drop-shadow-lg flex items-center gap-3"
      >
        🎓 <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#fff] to-[#D6B6FF]">EduAI Admin Portal</span>
      </motion.h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-xl text-center"
        >
          <h3 className="text-lg font-medium">👩‍🏫 Teachers</h3>
          <p className="text-4xl font-bold mt-2">{teachers.length}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-xl text-center"
        >
          <h3 className="text-lg font-medium">🧑‍🎓 Students</h3>
          <p className="text-4xl font-bold mt-2">{students.length}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-xl text-center"
        >
          <h3 className="text-lg font-medium">📚 Ratio</h3>
          <p className="text-4xl font-bold mt-2">
            {teachers.length > 0
              ? (students.length / teachers.length).toFixed(1)
              : "—"}
          </p>
        </motion.div>
      </div>

      {/* Teachers Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-6xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl"
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          👩‍🏫 Teachers
        </h2>

        <form
          onSubmit={handleAddTeacher}
          className="flex flex-wrap gap-3 mb-6 text-black"
        >
          <input
            className="flex-1 min-w-[200px] p-2 rounded-xl border-2 border-purple-300 focus:ring-4 focus:ring-purple-500 outline-none"
            placeholder="Teacher email"
            value={newTeacherEmail}
            onChange={(e) => setNewTeacherEmail(e.target.value)}
          />
          <input
            className="flex-1 min-w-[200px] p-2 rounded-xl border-2 border-purple-300 focus:ring-4 focus:ring-purple-500 outline-none"
            placeholder="Password"
            value={newTeacherPassword}
            onChange={(e) => setNewTeacherPassword(e.target.value)}
          />
          <button className="px-6 py-2 bg-gradient-to-r from-[#B06FFF] to-[#8E2DE2] text-white font-semibold rounded-xl hover:opacity-90 shadow-lg transition">
            Add Teacher
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-white/20">
          <table className="w-full text-left border-collapse bg-white/5">
            <thead className="bg-white/10">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-white/10 hover:bg-white/10 transition"
                >
                  <td className="p-3">{t.id}</td>
                  <td className="p-3">{t.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Students Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="w-full max-w-6xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl"
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          🧑‍🎓 Students
        </h2>

        <form
          onSubmit={handleAddStudent}
          className="flex flex-wrap gap-3 mb-6 text-black"
        >
          <input
            className="flex-1 min-w-[200px] p-2 rounded-xl border-2 border-indigo-300 focus:ring-4 focus:ring-indigo-500 outline-none"
            placeholder="Student email"
            value={newStudentEmail}
            onChange={(e) => setNewStudentEmail(e.target.value)}
          />
          <input
            className="flex-1 min-w-[200px] p-2 rounded-xl border-2 border-indigo-300 focus:ring-4 focus:ring-indigo-500 outline-none"
            placeholder="Password"
            value={newStudentPassword}
            onChange={(e) => setNewStudentPassword(e.target.value)}
          />
          <select
            className="border-2 border-indigo-300 rounded-xl p-2 min-w-[200px] focus:ring-4 focus:ring-indigo-500 outline-none"
            value={newStudentTeacherId}
            onChange={(e) => setNewStudentTeacherId(e.target.value)}
          >
            <option value="">Assign teacher...</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.email}
              </option>
            ))}
          </select>
          <button className="px-6 py-2 bg-gradient-to-r from-[#7F00FF] to-[#E100FF] text-white font-semibold rounded-xl hover:opacity-90 shadow-lg transition">
            Add Student
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-white/20">
          <table className="w-full text-left border-collapse bg-white/5">
            <thead className="bg-white/10">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Email</th>
                <th className="p-3">Teacher</th>
                <th className="p-3 text-center">Assign</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-white/10 hover:bg-white/10 transition"
                >
                  <td className="p-3">{s.id}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">
                    {s.teacher ? s.teacher.email : "—"}
                  </td>
                  <td className="p-3 text-center">
                    <select
                      onChange={(e) => handleAssign(s.id, e.target.value)}
                      defaultValue=""
                      className="p-1 border-2 border-purple-300 bg-purple-100 text-purple-900 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                    >
                      <option value="">Assign...</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.email}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-white/70 text-sm">
        © 2025 <span className="font-semibold text-white">EduAI</span> — Intelligent Education System
      </footer>

      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-md text-2xl font-semibold animate-pulse">
          🔄 Loading data...
        </div>
      )}
    </div>
  );
}
