import React, { useEffect, useState } from 'react';
import adminOrderService from '../../services/OrderService'; 

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminOrderService.getMyOrders();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      setError(err.message || "Buyurtmalarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Haqiqatan ham ushbu buyurtmani bekor qilmoqchimisiz?")) return;
    try {
      const res = await adminOrderService.cancelMyOrder(orderId);
      if (res.success) {
        alert("Buyurtma muvaffaqiyatli bekor qilindi! ❌");
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || "Bekor qilishda xatolik yuz berdi.");
    }
  };

  // Statuslarni chiroyli o'zbekcha matn va ranglar bilan formatlash
  const getStatusDetails = (status) => {
    const statuses = {
      pending: { text: "Kutilmoqda", style: "bg-amber-50 text-amber-700 border-amber-200" },
      processing: { text: "Tayyorlanmoqda", style: "bg-blue-50 text-blue-700 border-blue-200" },
      shipped: { text: "Yo'lda / Yuborilgan", style: "bg-purple-50 text-purple-700 border-purple-200" },
      delivered: { text: "Yetkazib berildi", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      cancelled: { text: "Bekor qilingan", style: "bg-rose-50 text-rose-700 border-rose-200" }
    };
    return statuses[status] || { text: status, style: "bg-gray-50 text-gray-700 border-gray-200" };
  };

  if (loading) return <div className="p-12 text-center text-gray-400 font-oxygen text-sm tracking-wide animate-pulse">Buyurtmalar yuklanmoqda...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-oxygen bg-rose-50 rounded-xl max-w-md mx-auto my-6 border border-rose-100 text-sm">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 font-oxygen max-w-4xl mx-auto">
      {/* Sahifa sarlavhasi */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Buyurtmalar tarixi</h2>
          <p className="text-xs text-gray-500 mt-1">Xarid qilgan mahsulotlaringiz va ularning holati</p>
        </div>
        <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-semibold text-gray-600">
          Jami: {orders.length} ta buyurtma
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
          <span className="text-3xl block mb-2">📦</span>
          <p className="text-gray-400 text-sm font-medium">Sizda hali hech qanday buyurtma mavjud emas.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusDetails(order.status);
            return (
              <div key={order.id} className="border border-gray-200/80 rounded-2xl p-5 hover:shadow-md hover:border-gray-300/70 transition-all bg-white overflow-hidden">
                
                {/* 1. Karta tepasi: ID va Status */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      ID: #{String(order.id).padStart(5, '0')}
                    </span>
                    <span className="text-xs text-gray-400 block mt-1">
                      Sana: {new Date(order.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`text-[11px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${statusInfo.style}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* 2. Mahsulotlar ro'yxati qismi */}
                <div className="space-y-3 mb-4 bg-gray-50/40 p-3 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-1">Xarid qilingan mahsulotlar</p>
                  {order.order_items?.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center text-sm gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">▫️</span>
                        <span className="text-gray-800 font-medium">
                          {item.product?.name || "O'chirilgan mahsulot"} 
                          <span className="text-gray-400 text-xs font-normal bg-gray-100 px-1.5 py-0.5 rounded ml-2">x{item.quantity}</span>
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold shrink-0">
                        {(parseFloat(item.price) * item.quantity).toLocaleString()} so'm
                      </span>
                    </div>
                  ))}
                </div>

                {/* 3. Yetkazib berish ma'lumotlari */}
                <div className="text-xs text-gray-600 bg-slate-50 rounded-xl p-3 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-100">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-tight">Etkazib berish manzili</span>
                    <span className="text-gray-700 font-medium">{order.shipping_address}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-tight">Bog'lanish telefoni</span>
                    <span className="text-gray-700 font-medium">{order.phone_number}</span>
                  </div>
                </div>

                {/* 4. Karta pastki qismi: Jami to'lov va tugma */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-3">
                  <div>
                    <span className="text-xs text-gray-400 block">Umumiy to'lov (kuryerlik bilan):</span>
                    <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                      {parseFloat(order.total_price).toLocaleString()} <span className="text-sm font-normal text-gray-500">so'm</span>
                    </span>
                  </div>

                  {/* Faqat pending va processing holatidagina bekor qilish mumkin */}
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 text-xs font-bold border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 active:bg-rose-100 transition-all cursor-pointer bg-white shadow-sm hover:shadow-none"
                    >
                      Bekor qilish ❌
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}