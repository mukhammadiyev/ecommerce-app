import React, { useEffect, useState } from 'react';
import { Mail, Calendar, Search, Download, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import newsletterService from '../../services/newsletterService';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Xabar yuborish shtatlari (States) ──
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' }); // success yoki error uchun

useEffect(() => {
  const fetchSubscribers = async () => {
    try {
      const res = await newsletterService.getAllSubscribers();
      
      // 🔥 Backend to'g'ridan-to'g'ri massiv yoki res.data qaytarsa ham tekshirib oladi
      if (Array.isArray(res)) {
        setSubscribers(res);
      } else if (res && res.success) {
        setSubscribers(res.data || []);
      } else if (res && res.data && Array.isArray(res.data)) {
        setSubscribers(res.data);
      }
    } catch (err) {
      console.error("Yuklashda xatolik:", err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchSubscribers();
}, []);

  // Email bo'yicha qidirish filtri
  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔥 XABAR YUBORISH FUNKSIYASI
  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return alert("Iltimos, barcha maydonlarni to'ldiring!");

    setSending(true);
    setStatusMessage({ type: '', text: '' });

    try {
      // Backend xizmatiga sarlavha va matn jo'natiladi
      // Eslatma: newsletterService ichida sendNewsletter funksiyasi yozilgan bo'lishi kerak
      const res = await newsletterService.sendNewsletter({ subject, message });
      
      if (res.success || res) {
        setStatusMessage({ 
          type: 'success', 
          text: `Xabar ${filteredSubscribers.length} ta obunachiga muvaffaqiyatli yuborildi! 🚀` 
        });
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      console.error("Yuborishda xatolik:", err.message);
      setStatusMessage({ 
        type: 'error', 
        text: err.message || "Xabar yuborishda xatolik yuz berdi. Backendni tekshiring." 
      });
    } finally {
      setSending(false);
    }
  };

  // Excel yuklash funksiyasi
  const exportToExcel = () => {
    if (filteredSubscribers.length === 0) return alert("Yuklab olish uchun ma'lumot yo'q!");

    let excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head>
      <body>
        <table border="1">
          <tr style="background-color: #6c63ff; color: white; font-weight: bold;">
            <th>ID</th>
            <th>Email Manzil</th>
            <th>Obuna Bo'lgan Sana</th>
          </tr>
    `;

    filteredSubscribers.forEach((sub, index) => {
      const id = `#${String(index + 1).padStart(4, '0')}`;
      const email = sub.email;
      const date = new Date(sub.createdAt).toLocaleDateString('uz-UZ', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      excelTemplate += `<tr><td>${id}</td><td>${email}</td><td>${date}</td></tr>`;
    });

    excelTemplate += `</table></body></html>`;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-[#151929] min-h-screen text-white">
      {/* TEPPA HEADLINE QISMI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Newsletter Dashboard</h2>
          <p className="text-sm text-white/45 mt-1">Umumiy obunachilar: {subscribers.length} ta</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={exportToExcel}
            disabled={loading || filteredSubscribers.length === 0}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#6c63ff] hover:bg-[#5b52e6] disabled:bg-white/5 disabled:text-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#6c63ff]/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Excel yuklash
          </button>

          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Email bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#6c63ff]/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ASOSIY GRID BLOKI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 📋 OBUNACHILAR JADVALI (Chap tomonda 2 qism joy oladi) */}
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-12 text-white/45">Yuklanmoqda...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-12 text-white/45">Hech qanday obunachilar topilmadi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-xs font-semibold text-white/45 uppercase tracking-wider">
                    <th className="p-4 px-6">ID</th>
                    <th className="p-4 px-6">Email Manzil</th>
                    <th className="p-4 px-6">Obuna Bo'lgan Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredSubscribers.map((sub, index) => (
                    <tr key={sub.id || index} className="hover:bg-white/1 transition-colors">
                      <td className="p-4 px-6 font-mono text-white/45">#{String(index + 1).padStart(4, '0')}</td>
                      <td className="p-4 px-6 font-medium text-white/90">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-[#6c63ff]" />
                          {sub.email}
                        </div>
                      </td>
                      <td className="p-4 px-6 text-white/45">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(sub.createdAt).toLocaleDateString('uz-UZ', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 📬 XABAR YUBORISH PANELI (O'ng tomonda 1 qism joy oladi) */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
            <Send size={18} className="text-[#6c63ff]" />
            <h3 className="text-lg font-semibold text-white">Xabar jo'natish</h3>
          </div>

          <p className="text-xs text-white/45 mb-4 leading-relaxed">
            Quyidagi formaga yozilgan kontent hozirgi ro'yxatdagi jami <span className="text-[#6c63ff] font-bold">{filteredSubscribers.length} ta</span> email manzilga yuboriladi.
          </p>

          <form onSubmit={handleSendNewsletter} className="space-y-4">
            {/* Sarlavha */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Mavzu (Subject)</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Yangi chegirmalar haqida..."
                className="w-full bg-[#151929] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors"
              />
            </div>

            {/* Matn maydoni */}
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Xabar matni</label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Salom, bizda ajoyib yangiliklar bor..."
                className="w-full bg-[#151929] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6c63ff]/50 transition-colors resize-none"
              />
            </div>

            {/* Dinamik status bildirishnomasi */}
            {statusMessage.text && (
              <div className={`flex items-start gap-2 text-xs p-3 rounded-xl border ${
                statusMessage.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Submit tugmasi */}
            <button
              type="submit"
              disabled={sending || filteredSubscribers.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#6c63ff] hover:bg-[#5b52e6] disabled:bg-white/5 disabled:text-white/20 text-white font-medium text-sm py-2.5 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={14} />
                  Barchaga yuborish
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}