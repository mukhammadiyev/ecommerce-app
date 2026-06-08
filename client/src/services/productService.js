import api from "./api.js";
import { env } from "../config/env.js";
import { mockProducts, mockRequest } from "../mocks/index.js";

export async function getProducts() {
  if (env.useMock) {
    return mockRequest({ data: mockProducts });
  }
  return api.get("/products");
}

export async function getProductBySlug(slug) {
  if (env.useMock) {
    const product = mockProducts.find((item) => item.slug === slug);
    if (!product) {
      throw new Error("Product not found");
    }
    return mockRequest({ data: product });
  }
  return api.get(`/products/${slug}`);
}
