import { useEffect, useRef, useState } from "react";
import { getProducts } from "../../services/productService.js";
import ProductCard from "./ProductCard";

function ProductGrid() {
  const productCardsRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((response) => {
        const actualData = response?.data?.data || response?.data || [];
        console.log("Backenddan kelgan mahsulotlar (Grid):", actualData);

        if (Array.isArray(actualData)) {
          setProducts(actualData.slice(0, 4));
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error("Xatolik:", err);
      })
      .finally(() => {
        setLoading(false); // 🔥 TO'G'RILANDI: Loading endi o'chadi va kartochkalar chiqadi!
      });
  }, []);

  return (
    <section className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
          Suggested Products
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 animate-pulse">
              <div className="w-full h-44 sm:h-56 rounded-2xl bg-gray-200" />
              <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
              <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={productCardsRef}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              discount={product.discount}
              image={product.image_url || product.image}
              stock={product.stock} // 🚀 To'g'ri ulandi!
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductGrid;