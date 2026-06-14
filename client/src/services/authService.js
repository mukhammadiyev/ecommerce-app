import { env } from "../config/env.js";
import { mockAdmin, mockRequest, mockUser } from "../mocks/index.js";
import api from "./api.js";

// Login funksiyasini obyekt qabul qiladigan qilamiz
export async function login({ identifier, password }) {
  if (env.useMock) {
    const user = identifier.includes("admin") ? mockAdmin : mockUser;
    const token = `mock-token-${user.id}`;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return mockRequest({ data: { user, token } });
  }

  // 🔥 DIQQAT: Backend faqat 'email' kutayotgan bo'lsa, 
  // frontenddagi 'identifier'ni 'email' kalitiga o'tkazib yuboramiz!
  const response = await api.post("/auth/login", { 
    email: identifier, 
    password: password 
  });
  
  // Backend ApiResponse.send orqali ma'lumot qaytarsa, u .data ichida bo'ladi
  const responseData = response.data?.data || response.data;

  if (responseData && responseData.token) {
    localStorage.setItem("token", responseData.token);
    localStorage.setItem("user", JSON.stringify(responseData.user));
  }
  return responseData; 
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

export async function register({ name, email, password }) {
  if (env.useMock) {
    const user = { ...mockUser, name, email };
    const token = `mock-token-${user.id}`;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return mockRequest({ data: { user, token } });
  }

  // 🔥 Backend aynan 'name' deb kutmoqda, ortiqcha first_name/last_name larni olib tashlaymiz!
  const response = await api.post("/auth/register", { 
    name, 
    email, 
    password 
  });
  
  const responseData = response.data?.data || response.data;

  if (responseData && responseData.token) {
    localStorage.setItem("token", responseData.token);
    localStorage.setItem("user", JSON.stringify(responseData.user));
  }
  return responseData;
}

export function isAdmin() {
  return getCurrentUser()?.role === "admin";
}