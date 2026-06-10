import { env } from "../config/env.js";
import { mockAdmin, mockRequest, mockUser } from "../mocks/index.js";
import api from "./api.js";

export async function login(email, password) {
  if (env.useMock) {
    const user = email.includes("admin") ? mockAdmin : mockUser;
    const token = `mock-token-${user.id}`;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return mockRequest({ data: { user, token } });
  }
  const response = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
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
  const response = await api.post("/auth/register", { name, email, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response;
}
