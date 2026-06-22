import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import couponService from "../../services/couponService"; // 👈 API xizmati

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]); // 👈 Test kuponlar butunlay olib tashlandi (bo'sh massiv)
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", type: "percentage", value: "", expiry: "" });

  // 1. Backend'dan real kuponlarni yuklash
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAllCoupons();
      // Backend formatiga qarab res yoki res.data ni o'rnatamiz
      setCoupons(res.data || res);
    } catch (error) {
      console.error("Kuponlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Animatsiya ma'lumotlar kelgandan keyin ishlaydi
  useEffect(() => {
    if (!loading && coupons.length > 0) {
      gsap.fromTo(
        ".animate-fade",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, overwrite: "auto" }
      );
    }
  }, [loading, coupons]);

  // 2. Yangi kupon yaratish
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value || !newCoupon.expiry) return;

    try {
      const payload = {
        code: newCoupon.code.toUpperCase().trim(),
        type: newCoupon.type,
        value: Number(newCoupon.value),
        expiry: newCoupon.expiry,
      };

      await couponService.createCoupon(payload);
      
      setNewCoupon({ code: "", type: "percentage", value: "", expiry: "" });
      setShowModal(false);
      fetchCoupons(); // Ro'yxatni yangilash
    } catch (error) {}
  };

  // 3. Kuponni o'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Ushbu kuponni o'chirishni xohlaysizmi?")) return;
    
    try {
      await couponService.deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-[#111124] text-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Coupons Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">Do'koningizdagi chegirma kuponlarini boshqaring</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <span>+ Kupon Qo'shish</span>
          </button>
        </div>

        {/* Statistika kartalari */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade">
          <div className="bg-[#1a1a3a] p-5 rounded-2xl border border-gray-800/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-2xl font-bold">{loading ? "..." : coupons.length}</p>
              <p className="text-xs text-gray-400 mt-1">Jami Kuponlar</p>
            </div>
            <div className="p-3 bg-[#4f46e5]/10 rounded-xl text-[#4f46e5]">🎫</div>
          </div>
          <div className="bg-[#1a1a3a] p-5 rounded-2xl border border-gray-800/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-2xl font-bold">{loading ? "..." : coupons.filter(c => c.status === "Active").length}</p>
              <p className="text-xs text-gray-400 mt-1">Faol Kuponlar</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">🟢</div>
          </div>
          <div className="bg-[#1a1a3a] p-5 rounded-2xl border border-gray-800/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-2xl font-bold">{loading ? "..." : coupons.filter(c => c.status === "Expired").length}</p>
              <p className="text-xs text-gray-400 mt-1">Muddati O'tganlar</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">🔴</div>
          </div>
        </div>

        {/* Jadval yoki Yuklanish holati */}
        {loading ? (
          <div className="text-center py-20 bg-[#1a1a3a] rounded-2xl border border-gray-800/40 text-xs text-gray-400">
            Kuponlar yuklanmoqda...
          </div>
        ) : (
          <div className="bg-[#1a1a3a] rounded-2xl border border-gray-800/40 overflow-hidden shadow-md animate-fade">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-[#222248]/30">
                    <th className="py-4 px-6">Kupon Kodi</th>
                    <th className="py-4 px-6">Turi</th>
                    <th className="py-4 px-6">Qiymati</th>
                    <th className="py-4 px-6">Amal Qilish Muddati</th>
                    <th className="py-4 px-6">Holati</th>
                    <th className="py-4 px-6 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-xs text-gray-300">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-500">Hech qanday kupon topilmadi.</td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-[#222248]/20 transition-colors">
                        <td className="py-4 px-6 font-bold text-white tracking-wide">{coupon.code}</td>
                        <td className="py-4 px-6 capitalize">
                          <span className="px-2.5 py-1 rounded-md bg-[#2d2d5a] text-[#a78bfa] text-[10px] font-medium">
                            {coupon.type === "percentage" ? "Foizli (%)" : "Ruxsat etilgan ($)"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {coupon.type === "percentage" ? `${parseInt(coupon.value)}%` : `$${coupon.value}`}
                        </td>
                        <td className="py-4 px-6 text-gray-400">{coupon.expiry}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            coupon.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {coupon.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => handleDelete(coupon.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            title="O'chirish"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Oyna */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a3a] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Yangi Kupon Yaratish</h3>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Kupon Kodi</label>
                <input 
                  type="text" 
                  placeholder="Masalan: NEWYEAR50"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
                  className="w-full bg-[#111124] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Turi</label>
                  <select 
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}
                    className="w-full bg-[#111124] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                  >
                    <option value="percentage">Foiz (%)</option>
                    <option value="fixed">Qiymat ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Chegirma Miqdori</label>
                  <input 
                    type="number" 
                    placeholder={newCoupon.type === "percentage" ? "10" : "5.00"}
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                    className="w-full bg-[#111124] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Amal qilish muddati</label>
                <input 
                  type="date" 
                  value={newCoupon.expiry}
                  onChange={(e) => setNewCoupon({...newCoupon, expiry: e.target.value})}
                  className="w-full bg-[#111124] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  Yopish
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}