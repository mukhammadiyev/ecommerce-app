function CartSummary({ items, shipping }) {
  // item.product.price va item.quantity'dan foydalanamiz
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.product?.price || 0) * i.quantity), 0);
  const total = subtotal + shipping;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
      {/* ... Sarlavha qismlari ... */}
      <div className="divide-y divide-dashed divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-3 py-3 items-center">
            <span className="text-sm text-gray-500 leading-snug">
              {item.product?.name} {/* Backend'dan kelgan nomi */}
            </span>
            <span className="text-sm text-gray-400 text-center w-12">
              {String(item.quantity).padStart(2, "0")}
            </span>
            <span className="text-sm font-medium text-gray-700 text-right w-16">
              ${parseFloat(item.product?.price || 0) * item.quantity}
            </span>
          </div>
        ))}
      </div>
      {/* ... Umumiy hisob (Total) qismlari ... */}
    </div>
  );
}