import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const Settings = () => {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const profileSectionRef = useRef(null);
  const passwordSectionRef = useRef(null);
  const buttonRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "", // 👈 Eski parol uchun state qo'shildi
    newPassword: "",
    confirmPassword: "",
  });

  // ── BACKENDDAN MA'LUMOTLARNI YUKLASH ──
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          const user = response.data.data;
          const finalName = user.name || user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
          
          setFormData({
            fullName: finalName,
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
      }
    };

    fetchUserData();
  }, []);

  // ── GSAP ANIMATIONS ──
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(titleRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0);
    tl.fromTo(descRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.15);
    tl.fromTo(profileSectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.3);
    tl.fromTo(passwordSectionRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45 }, 0.45);
    tl.fromTo(buttonRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 0.6);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ── SAQLASH (SUBMIT) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    // Agar parollardan biri yozilgan bo'lsa, hammasi to'ldirilishi shartligini tekshiramiz
    if (passwordData.oldPassword || passwordData.newPassword || passwordData.confirmPassword) {
      if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setMessage({ text: "Parolni o'zgartirish uchun barcha parol maydonlarini to'ldiring!", type: "error" });
        setLoading(false);
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ text: "Yangi parollar bir-biriga mos kelmadi!", type: "error" });
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      
      // 1. Profil ma'lumotlarini yangilash
      await axios.put("http://localhost:5000/api/users/profile", {
        name: formData.fullName
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Agar yangi parol yozilgan bo'lsa, parolni yangilash
      if (passwordData.newPassword) {
        // 🚨 MANZIL TO'G'RILANDI: /password va kalitlar backendga moslab old_password va new_password formatida yuborildi
        await axios.put("http://localhost:5000/api/users/password", {
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }

      setMessage({ text: "O'zgarishlar muvaffaqiyatli saqlandi! 📝", type: "success" });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Tizimda xatolik yuz berdi.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transform focus:scale-[1.01] transition-all duration-200";

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-27 py-8 sm:py-12 md:py-16 lg:py-20">
        
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h1 ref={titleRef} className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3">
            Account Settings
          </h1>
          <p ref={descRef} className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Profilingiz ma'lumotlarini va xavfsizlik sozlamalarini shu yerdan oson boshqaring.
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Section */}
          <div ref={profileSectionRef} className="mb-8 sm:mb-10">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 sm:mb-5">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600 font-medium pl-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" className={inputClass} required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600 font-medium pl-1">Email Address</label>
                <input type="email" name="email" value={formData.email} disabled className={`${inputClass} opacity-60 cursor-not-allowed focus:scale-100`} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mb-8 sm:mb-10" />

          {/* Password Section */}
          <div ref={passwordSectionRef} className="mb-8 sm:mb-10">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 sm:mb-5">
              Change Password
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> {/* 3 talik qator qilindi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600 font-medium pl-1">Current Password</label>
                <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} placeholder="••••••••" className={inputClass} autoComplete="current-password" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600 font-medium pl-1">New Password</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="••••••••" className={inputClass} autoComplete="new-password" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600 font-medium pl-1">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="••••••••" className={inputClass} autoComplete="new-password" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
            aria-label='save changes'
              ref={buttonRef}
              type="submit"
              disabled={loading}
              className="w-full sm:w-72 bg-gray-900 text-white text-sm font-medium py-4 rounded-full hover:bg-gray-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;