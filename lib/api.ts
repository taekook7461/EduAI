// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

// универсальный вызов API
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("auth_token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ✅ ВСЕ запросы теперь идут в /api
 const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${response.status} ${text}`);
  }

  return response.json();
};

// LOGIN
export const authAPI = {
  login: (username: string, password: string, role: "teacher" | "student") =>
    apiCall(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password, role }),
    }),
};

// TEACHER
export const teacherAPI = {
  getStudents: () => {
    const teacherId = sessionStorage.getItem("user_id");
    return apiCall(`/teacher/${teacherId}/students`);
  },

  getTasks: () => {
    const teacherId = sessionStorage.getItem("user_id");
    return apiCall(`/teacher/${teacherId}/tasks`);
  },

  createTask: (taskData: any) => {
    const teacherId = sessionStorage.getItem("user_id");
    return apiCall(`/teacher/${teacherId}/tasks`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  deleteTask: (taskId: number) => {
    const teacherId = sessionStorage.getItem("user_id");
    return apiCall(`/teacher/${teacherId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },

  assignTask: (taskId: number) => {
    const teacherId = sessionStorage.getItem("user_id");
    return apiCall(`/teacher/${teacherId}/tasks/${taskId}/assign`, {
      method: "POST",
    });
  },

  generateTask: (prompt: string) => {
    const teacherId = sessionStorage.getItem("user_id");
    return apiCall(`/teacher/${teacherId}/tasks/generate`, {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  },
};

// STUDENT
export const studentAPI = {
  getTasks: () => apiCall(`/student/tasks`),
  getProfile: () => apiCall(`/student/profile`),
};
