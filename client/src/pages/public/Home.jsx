import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService.js";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((response) => setProducts(response.data.slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
            Frontend dev mode
          </p>
          <h1 className="mt-2 max-w-2xl text-4xl font-bold tracking-tight">
            Build the storefront while backend catches up
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Mock data is enabled. Pages, layouts, and services are wired so you
            can ship UI now and switch to the real API later.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Browse products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Featured products</h2>
        {loading ? (
          <p className="mt-6 text-slate-500">Loading mock products...</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h3 className="font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {product.category}
                </p>
                <p className="mt-4 text-lg font-bold">${product.price}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
