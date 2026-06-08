export const env = {
  useMock: import.meta.env.VITE_USE_MOCK === "true",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
};
