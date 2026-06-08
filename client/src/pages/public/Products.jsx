import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((response) => setProducts(response.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Products</h1>
      <p className="mt-2 text-slate-600">Loaded from mock API for now.</p>

      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold">${product.price}</span>
                <span className="text-sm text-slate-500">
                  {product.stock} in stock
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
