export { mockProducts } from "./products.js";
export { mockUser, mockAdmin } from "./users.js";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRequest(data, ms) {
  await delay(ms);
  return data;
}
