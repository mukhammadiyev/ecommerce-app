import { useEffect, useRef, useState } from "react";
import { getProducts } from "../../services/productService.js";
import ProductCard from "./ProductCard";

function ProductGrid() {
  const productCardsRef = useRef(null);
  useEffect(() => {
    getProducts()
      .then((response) => setProducts(response.data.slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);
  const [products, setProducts] = useState([]);
  return (
    <section className="w-full ">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
          Suggested Products
        </h2>
      </div>

      {/* Cards grid — stagger target */}
      <div
        ref={productCardsRef}
        className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            imageSrc={product.imageSrc}
            name={product.name}
            price={product.price}
            discount={product.discount}
            href={product.href}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
