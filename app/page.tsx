"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Code2, Lock, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");     
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // LOGIN FUNCTION
  // -----------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!role) {
      setError("Рөлді таңдаңыз");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            role,
          }),
        }
      );

      if (!response.ok) throw new Error("Invalid");

      const data = await response.json();

      // Save token + role + user id
      sessionStorage.setItem("auth_token", data.token);
      sessionStorage.setItem("user_id", data.user_id);
      sessionStorage.setItem("role", data.role);

      // Redirect by role
      if (data.role === "student") router.push("/student");
      if (data.role === "teacher") router.push("/teacher");
      if (data.role === "superadmin") router.push("/admin");

    } catch (err) {
      setError("Қате логин немесе құпиясөз");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-screen flex flex-col justify-center items-center 
        px-4 py-10 relative overflow-hidden
        bg-gradient-to-br from-[#7028e4] via-[#9b4cff] to-[#4facfe] 
        text-white
      "
    >
      {/* BACKGROUND BLUR BALLS */}
      <div className="absolute -top-20 right-10 w-72 h-72 bg-purple-400 opacity-30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-400 opacity-40 blur-3xl rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400 opacity-20 blur-3xl rounded-full"></div>

      {/* NAVBAR */}
      <div className="absolute top-6 left-6 flex items-center gap-3 animate-fade-in">
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xl 
        border border-white/25 shadow-lg flex items-center justify-center hover:scale-110 transition">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold drop-shadow-lg tracking-wide">
          EduAI
        </span>
      </div>

      {/* HERO TEXT */}
      <div className="text-center max-w-3xl space-y-6 mb-10 animate-slide-down">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full 
          bg-white/20 border border-white/25 backdrop-blur-xl shadow-lg animate-pulse-slow">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">
            Информатика сабағын автоматтандыратын интеллектуалды жүйе
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight drop-shadow-xl">
          EduAI платформасына кіру
        </h1>

        <p className="text-lg text-white/90 leading-relaxed drop-shadow">
          EduAI — тапсырмаларды автоматты тексеретін және мұғалім жұмысын 
          оңтайландыратын интеллектуалды платформа.
        </p>
      </div>

      {/* LOGIN CARD */}
      <Card
        className="
          w-full max-w-md p-8 
          rounded-3xl
          bg-white/20 backdrop-blur-2xl 
          border border-white/30 shadow-2xl
          text-white space-y-6
          transform hover:scale-[1.02] transition-all duration-300
        "
      >
        {/* ICON */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/30 
        backdrop-blur-xl border border-white/30 flex items-center 
        justify-center shadow-lg mb-4 animate-pop">
          <Lock className="w-8 h-8 text-white drop-shadow" />
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* ROLE SELECT */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
              w-full p-3 rounded-xl 
              bg-white/30 text-white border border-white/40 
              focus:ring-2 focus:ring-white/70 
              backdrop-blur-xl shadow-inner
            "
          >
            <option value="" className="text-black">Рөлді таңдаңыз</option>
            <option value="student" className="text-black">Оқушы</option>
            <option value="teacher" className="text-black">Мұғалім</option>
            <option value="superadmin" className="text-black">Админ</option>
          </select>

          {/* EMAIL */}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="
              h-12 rounded-xl bg-white/30 text-white placeholder-white/70 
              border border-white/40 backdrop-blur-xl shadow-inner
            "
          />

          {/* PASSWORD */}
          <Input
            type="password"
            placeholder="Құпиясөз"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="
              h-12 rounded-xl bg-white/30 text-white placeholder-white/70 
              border border-white/40 backdrop-blur-xl shadow-inner
            "
          />

          {/* ERROR */}
          {error && (
            <p className="text-center text-red-300 text-sm font-semibold animate-shake">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <Button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 text-lg font-semibold 
              rounded-xl 
              bg-white/90 text-purple-700 
              shadow-lg hover:shadow-xl 
              hover:bg-white hover:scale-[1.03] 
              transition-all animate-glow-slow
            "
          >
            {loading ? "Тексерілуде..." : "Кіру"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
