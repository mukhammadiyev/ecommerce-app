import { gsap } from "gsap";
import {
  AlertTriangle,
  Archive,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FilePen,
  Inbox as InboxIcon,
  Info,
  MailCheck,
  Menu,
  Plus,
  Reply,
  Search,
  Send,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Statik Konfiguratsiyalar ──────────────────────────────────────────────────
const LABELS = [
  { id: "primary", name: "Primary", color: "#6c63ff" },
];

const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "starred", label: "Starred", icon: Star },
  { id: "sent", label: "Sent", icon: Send },
  { id: "bin", label: "Bin", icon: Trash2 },
];

const PAGE_SIZE = 12;
const LABEL_MAP = Object.fromEntries(LABELS.map((l) => [l.id, l]));

// ─── Yordamchi Funksiyalar ────────────────────────────────────────────────────
function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = ["#6c63ff", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

// ─── Compose Modal ────────────────────────────────────────────────────────────
function ComposeModal({ onClose, onSend }) {
  const overlayRef = useRef(null);
  const boxRef = useRef(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(
      boxRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" }
    );
  }, []);

  const close = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.16 });
    gsap.to(boxRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.16,
      onComplete: onClose,
    });
  };

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) return;
    onSend(to, subject, message);
    close();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={boxRef}
        className="w-full max-w-lg bg-[#1e2436] rounded-2xl border border-white/8 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#6c63ff]">
          <span className="text-sm font-semibold text-white">New Message</span>
          <button onClick={close} className="p-1 rounded text-white/70 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          <input
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-5 py-3 bg-transparent text-sm text-white placeholder-white/25 outline-none"
          />
          <input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-5 py-3 bg-transparent text-sm text-white placeholder-white/25 outline-none"
          />
          <textarea
            rows={7}
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-5 py-4 bg-transparent text-sm text-white placeholder-white/20 outline-none resize-none"
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5">
          <div className="flex items-center gap-2">
            {[Tag, Archive, Trash2].map((Icon, i) => (
              <button
                key={i}
                className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold hover:bg-[#5a52e0] active:scale-95 transition-all"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Detail ─────────────────────────────────────────────────────────────
function EmailDetail({ email, onClose, onDelete, onArchive, onReplySuccess, onStar }) {
  const panelRef = useRef(null);
  const [replyText, setReplyText] = useState(""); 
  const [sending, setSending] = useState(false);  

  useEffect(() => {
    gsap.fromTo(panelRef.current, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, ease: "power2.out" });
  }, []);

  const label = email.label ? LABEL_MAP[email.label] : null;
  const color = avatarColor(email.from);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/contacts/admin/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({
          to: email.email,          
          subject: email.subject,    
          message: replyText         
        })
      });

      const resData = await response.json();

      if (response.ok) {
        alert("Javob foydalanuvchi emailiga muvaffaqiyatli yuborildi! ✉️");
        if (onReplySuccess) {
          onReplySuccess(email.id, replyText);
        }
        setReplyText(""); 
      } else {
        alert(`Xatolik: ${resData.message}`);
      }
    } catch (error) {
      console.error("Javob yuborishda xatolik:", error);
      alert("Tarmoq xatosi tufayli javob yuborilmadi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={panelRef} className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onStar(email.id)}
            className="p-2 rounded-lg transition-colors"
          >
            <Star 
              size={15} 
              className={`${email.starred ? "fill-amber-400 text-amber-400" : "text-white/30 hover:text-white"}`} 
            />
          </button>
          <button className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
            <Reply size={15} />
          </button>
          <button
            onClick={() => onArchive(email.id)}
            className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Archive size={15} />
          </button>
          <button
            onClick={() => onDelete(email.id)}
            className="p-2 rounded-lg text-white/30 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "none" }}>
        <h2 className="text-base font-semibold text-white leading-snug">{email.subject}</h2>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: color }}
          >
            {getInitials(email.from)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{email.from} <span className="text-white/30 text-xs">({email.email})</span></p>
            <p className="text-xs text-white/30">to me · {email.time}</p>
          </div>
        </div>
        <div className="text-sm text-white/50 leading-relaxed space-y-3 pt-2">
          <p>Hi there,</p>
          <p>{email.messageText || email.subject}</p>
          <p>Best regards,<br />{email.from}</p>
        </div>
      </div>
      
      <div className="border-t border-white/5 p-4 shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#151929] border border-white/8 focus-within:border-[#6c63ff]/40 transition-colors">
          <input
            placeholder={sending ? "Sending..." : "Reply..."}
            disabled={sending}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReplySubmit()} 
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none disabled:opacity-40"
          />
          <button 
            onClick={handleReplySubmit}
            disabled={sending || !replyText.trim()}
            className="p-1.5 rounded-lg bg-[#6c63ff] text-white hover:bg-[#5a52e0] transition-colors disabled:opacity-30"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({ activeFolder, onFolder, onCompose, onClose, counts }) {
  return (
    <div className="flex flex-col h-full">
      {onClose && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="p-3 border-b border-white/5 shrink-0">
        <button
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold
            hover:bg-[#5a52e0] active:scale-[0.98] transition-all shadow-lg shadow-[#6c63ff]/25"
        >
          <Plus size={15} /> Compose
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "none" }}>
        <p className="px-2 pb-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">My Email</p>
        {FOLDERS.map((folder) => {
          const Icon = folder.icon;
          const active = activeFolder === folder.id;
          const count = counts[folder.id] || 0;
          return (
            <button
              key={folder.id}
              onClick={() => {
                onFolder(folder.id);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-colors
                ${active ? "bg-[#6c63ff] text-white" : "text-white/45 hover:text-white hover:bg-white/5"}`}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 text-left font-medium">{folder.label}</span>
              {count > 0 && (
                <span className={`text-xs tabular-nums ${active ? "text-white/70" : "text-white/25"}`}>
                  {count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile Sidebar Drawer ────────────────────────────────────────────────────
function MobileSidebarDrawer({ open, onClose, activeFolder, onFolder, onCompose, counts }) {
  const overlayRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!overlayRef.current || !drawerRef.current) return;
    if (open) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(drawerRef.current, { x: "-100%" }, { x: "0%", duration: 0.28, ease: "power2.out" });
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
      gsap.to(drawerRef.current, { x: "-100%", duration: 0.22, ease: "power2.in" });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div ref={overlayRef} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div ref={drawerRef} className="relative w-72 h-full bg-[#1a1f2e] border-r border-white/5 shadow-2xl">
        <SidebarContent
          activeFolder={activeFolder}
          onFolder={handleFolder}
          onCompose={onCompose}
          onClose={onClose}
          counts={counts}
        />
      </div>
    </div>
  );
}

// ─── Email Row ────────────────────────────────────────────────────────────────
function EmailRow({ email, selected, checked, onSelect, onCheck, onStar, index }) {
  const rowRef = useRef(null);
  const color = avatarColor(email.from);

  useEffect(() => {
    gsap.fromTo(
      rowRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", delay: index * 0.025 }
    );
  }, []);

  return (
    <div
      ref={rowRef}
      onClick={() => onSelect(email)}
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-white/4 cursor-pointer transition-colors
        ${selected ? "bg-[#6c63ff]/10" : email.read ? "hover:bg-white/2" : "bg-white/2.5 hover:bg-white/4"}`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onCheck(email.id);
        }}
        className="shrink-0"
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => { }}
          className="w-4 h-4 rounded accent-[#6c63ff] cursor-pointer pointer-events-none"
        />
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          onStar(email.id);
        }}
        className="shrink-0"
      >
        <Star
          size={14}
          className={`transition-colors cursor-pointer ${email.starred ? "fill-amber-400 text-amber-400" : "text-white/15 hover:text-white/40"}`}
        />
      </div>

      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0"
        style={{ background: color }}
      >
        {getInitials(email.from)}
      </div>

      <span className={`text-sm shrink-0 w-28 hidden sm:block truncate ${email.read ? "text-white/50 font-normal" : "text-white font-semibold"}`}>
        {email.from}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:hidden mb-0.5 truncate ${email.read ? "text-white/50" : "text-white font-semibold"}`}>
          {email.from}
        </p>
        <p className={`text-sm truncate ${email.read ? "text-white/40" : "text-white/75"}`}>{email.subject}</p>
      </div>

      <span className="text-xs text-white/25 shrink-0 whitespace-nowrap">{email.time}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [composing, setComposing] = useState(false);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const headerRef = useRef(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/contacts/admin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });

      const resData = await response.json();

      if (response.ok) {
        const rawMessages = Array.isArray(resData.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];

        // 🌟 Xotiradan kerakli ro'yxatlarni o'qiymiz
        const binIds = JSON.parse(localStorage.getItem("bin_messages") || "[]");
        const starredIds = JSON.parse(localStorage.getItem("starred_messages") || "[]");
        const repliedMessages = JSON.parse(localStorage.getItem("replied_messages") || "{}");

        const formattedEmails = rawMessages.map((item) => {
          const isInBin = binIds.includes(item.id);
          const isStarred = starredIds.includes(item.id);
          const hasReply = repliedMessages[item.id]; // Javob yozilganmi?

          return {
            id: item.id,
            from: item.name || "Noma'lum foydalanuvchi",
            email: item.email,
            phone: item.phone,
            label: "primary",
            // 🆕 Agar javob yozilgan bo'lsa "sent" bo'ladi, savatda bo'lsa "bin", aks holda "inbox"
            folder: hasReply ? "sent" : (isInBin ? "bin" : "inbox"), 
            subject: hasReply ? (hasReply.subject || item.subject) : (item.subject || "Mavzu ko'rsatilmagan"),
            messageText: hasReply ? hasReply.message : (item.message || ""),
            time: item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Yaqinda",
            starred: isStarred, // 🆕 refreshda ham saqlanadi
            read: false,
          };
        });

        setEmails(formattedEmails);
      } else {
        console.error("Backend xatolik qaytardi:", resData.message);
        setEmails([]);
      }
    } catch (error) {
      console.error("Tarmoq xatoligi:", error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    gsap.fromTo(headerRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
  }, []);

  const folderCounts = {
    inbox: emails.filter((e) => e.folder === "inbox").length,
    starred: emails.filter((e) => e.starred).length,
    sent: emails.filter((e) => e.folder === "sent").length,
    bin: emails.filter((e) => e.folder === "bin").length,
  };

  const filtered = emails.filter((e) => {
    const matchesSearch =
      e.from.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase());

    if (activeFolder === "starred") return matchesSearch && e.starred;
    return matchesSearch && e.folder === activeFolder;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDeleteMessage = async (id) => {
    if (activeFolder === "bin") {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/contacts/admin/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
          }
        });

        const resData = await response.json();

        if (response.ok) {
          const deletedIds = JSON.parse(localStorage.getItem("bin_messages") || "[]");
          const updatedIds = deletedIds.filter(binId => binId !== id);
          localStorage.setItem("bin_messages", JSON.stringify(updatedIds));

          // Javoblar va Yulduzchalar ro'yxatidan ham tozalab tashlaymiz
          const starredIds = JSON.parse(localStorage.getItem("starred_messages") || "[]").filter(i => i !== id);
          localStorage.setItem("starred_messages", JSON.stringify(starredIds));
          
          const replied = JSON.parse(localStorage.getItem("replied_messages") || "{}");
          delete replied[id];
          localStorage.setItem("replied_messages", JSON.stringify(replied));

          setEmails((prevEmails) => prevEmails.filter((email) => email.id !== id));
          setSelected(null);
          alert("Xabar bazadan butunlay o'chirildi! 🗑️");
        } else {
          alert(`O'chirishning iloji bo'lmadi: ${resData.message}`);
        }
      } catch (error) {
        console.error("O'chirishda tarmoq xatoligi:", error);
        alert("Tarmoq xatosi tufayli xabarni o'chirib bo'lmadi.");
      }
    } 
    else {
      const deletedIds = JSON.parse(localStorage.getItem("bin_messages") || "[]");
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem("bin_messages", JSON.stringify(deletedIds));
      }

      setEmails((prevEmails) =>
        prevEmails.map((e) => (e.id === id ? { ...e, folder: "bin" } : e))
      );
      setSelected(null);
      alert("Xabar savatga ko'chirildi. 📁");
    }
  };

  const handleSelectEmail = (email) => {
    setSelected(email);
    setEmails((es) => es.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
  };

  // 🆕 Yulduzcha bosilganda localStorage ga yozish mantiqi qo'shildi
  const toggleStar = (id) => {
    let starredIds = JSON.parse(localStorage.getItem("starred_messages") || "[]");
    if (starredIds.includes(id)) {
      starredIds = starredIds.filter(i => i !== id);
    } else {
      starredIds.push(id);
    }
    localStorage.setItem("starred_messages", JSON.stringify(starredIds));

    setEmails((es) => es.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  };

  const toggleCheck = (id) =>
    setChecked((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const allChecked = paginated.length > 0 && paginated.every((e) => checked.has(e.id));

  const toggleAll = () => {
    setChecked((s) => {
      const n = new Set(s);
      paginated.forEach((e) => (allChecked ? n.delete(e.id) : n.add(e.id)));
      return n;
    });
  };

  const deleteChecked = async () => {
    if (activeFolder === "bin") {
      try {
        const token = localStorage.getItem("token");
        
        const deletePromises = Array.from(checked).map(id =>
          fetch(`http://localhost:5000/api/contacts/admin/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(token && { "Authorization": `Bearer ${token}` })
            }
          })
        );

        await Promise.all(deletePromises);
        
        const deletedIds = JSON.parse(localStorage.getItem("bin_messages") || "[]");
        const updatedIds = deletedIds.filter(id => !checked.has(id));
        localStorage.setItem("bin_messages", JSON.stringify(updatedIds));

        setEmails((es) => es.filter((e) => !checked.has(e.id)));
        alert("Tanlangan xabarlar bazadan butunlay o'chirildi! 🗑️");
      } catch (error) {
        console.error("Guruhli o'chirishda xatolik:", error);
        alert("Ba'zi xabarlarni o'chirishda muammo bo'ldi.");
      }
    } 
    else {
      const deletedIds = JSON.parse(localStorage.getItem("bin_messages") || "[]");
      
      checked.forEach(id => {
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
        }
      });
      localStorage.setItem("bin_messages", JSON.stringify(deletedIds));

      setEmails((es) => es.map((e) => (checked.has(e.id) ? { ...e, folder: "bin" } : e)));
      alert("Tanlangan xabarlar savatga ko'chirildi. 📁");
    }
    setChecked(new Set());
    setSelected(null);
  };

  const archiveChecked = () => {
    setEmails((es) => es.map((e) => (checked.has(e.id) ? { ...e, folder: "archive" } : e)));
    setChecked(new Set());
    setSelected(null);
  };

  const archiveSingle = (id) => {
    setEmails((es) => es.map((e) => (e.id === id ? { ...e, folder: "archive" } : e)));
    setSelected(null);
  };

  const markCheckedAsRead = () => {
    setEmails((es) => es.map((e) => (checked.has(e.id) ? { ...e, read: true } : e)));
    setChecked(new Set());
  };

  const handleSendEmail = (to, subject, message) => {
    const newEmail = {
      id: Date.now(),
      from: to,
      label: "work",
      folder: "sent",
      subject: subject,
      messageText: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      starred: false,
      read: true,
    };
    setEmails([newEmail, ...emails]);
    setActiveFolder("sent");
  };

  const handleFolder = (id) => {
    setActiveFolder(id);
    setSelected(null);
    setChecked(new Set());
    setPage(1);
  };

  const unreadCount = emails.filter((e) => e.folder === "inbox" && !e.read).length;

  return (
    <div className="flex flex-col h-full gap-4" style={{ minHeight: 0 }}>
      {/* Page Header */}
      <div ref={headerRef} className="flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 capitalize">
              <InboxIcon size={18} className="text-[#6c63ff]" /> {activeFolder}
            </h1>
            {activeFolder === "inbox" && (
              <p className="text-xs sm:text-sm text-white/35 mt-0.5">{unreadCount} unread messages</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setComposing(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold
            hover:bg-[#5a52e0] active:scale-95 transition-all shadow-lg shadow-[#6c63ff]/25 shrink-0"
        >
          <Edit3 size={14} /> <span className="hidden sm:inline">Compose</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex gap-4 flex-1 min-h-0">
        <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 bg-[#1a1f2e] rounded-2xl border border-white/5 overflow-hidden">
          <SidebarContent
            activeFolder={activeFolder}
            onFolder={handleFolder}
            onCompose={() => setComposing(true)}
            counts={folderCounts}
          />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col bg-[#1a1f2e] rounded-2xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-white/40">
              <span className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-[#6c63ff] rounded-full mb-2"></span>
              <p className="text-sm">Xabarlar yuklanmoqda...</p>
            </div>
          ) : selected ? (
            <EmailDetail
              email={selected}
              onClose={() => setSelected(null)}
              onDelete={handleDeleteMessage}
              onArchive={archiveSingle}
              onReplySuccess={(id, replyMessage) => {
                // 🆕 Javob yozilgan xat ma'lumotlarini localStorage ga saqlaymiz
                const repliedMessages = JSON.parse(localStorage.getItem("replied_messages") || "{}");
                const currentEmail = emails.find(e => e.id === id);
                
                repliedMessages[id] = {
                  subject: currentEmail?.subject.startsWith("Re:") ? currentEmail.subject : `Re: ${currentEmail?.subject}`,
                  message: replyMessage
                };
                localStorage.setItem("replied_messages", JSON.stringify(repliedMessages));

                setEmails((prevEmails) =>
                  prevEmails.map((e) =>
                    e.id === id
                      ? {
                          ...e,
                          folder: "sent",               
                          messageText: replyMessage,     
                          subject: repliedMessages[id].subject, 
                          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), 
                          read: true,
                        }
                      : e
                  )
                );
                setSelected(null);         
                setActiveFolder("sent");   
              }}
              onStar={(id) => {
                toggleStar(id);
                setSelected((prev) => (prev && prev.id === id ? { ...prev, starred: !prev.starred } : prev));
              }}
            />
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-white/5 shrink-0">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-[#6c63ff] cursor-pointer shrink-0"
                />

                <div className="flex items-center gap-2 flex-1 min-w-0 h-8 sm:h-9 px-3 rounded-xl bg-[#151929] border border-white/8 focus-within:border-[#6c63ff]/50 transition-colors">
                  <Search size={13} className="text-white/25 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search mail"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-white/20 outline-none w-full"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-white/25 hover:text-white/60 shrink-0">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {checked.size > 0 && (
                    <>
                      <span className="text-xs text-white/30 px-1 hidden sm:block">{checked.size}</span>
                      <button
                        onClick={archiveChecked}
                        className="p-1.5 sm:p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                        title="Archive"
                      >
                        <Archive size={14} />
                      </button>
                      <button
                        onClick={markCheckedAsRead}
                        className="p-1.5 sm:p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
                        title="Mark read"
                      >
                        <MailCheck size={14} />
                      </button>
                      <button
                        onClick={deleteChecked}
                        className="p-1.5 sm:p-2 rounded-lg text-white/30 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {paginated.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <InboxIcon size={32} className="text-white/10 mb-3" />
                    <p className="text-sm text-white/25 text-center px-4">
                      {search ? "No messages match your search." : "This folder is empty."}
                    </p>
                  </div>
                ) : (
                  paginated.map((email, idx) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      index={idx}
                      selected={selected?.id === email.id}
                      checked={checked.has(email.id)}
                      onSelect={handleSelectEmail}
                      onCheck={toggleCheck}
                      onStar={toggleStar}
                    />
                  ))
                )}
              </div>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 text-xs text-white/30 shrink-0">
                  <span>
                    {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 transition-colors disabled:opacity-20"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 transition-colors disabled:opacity-20"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      <MobileSidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeFolder={activeFolder}
        onFolder={handleFolder}
        onCompose={() => setComposing(true)}
        counts={folderCounts}
      />

      {composing && <ComposeModal onClose={() => setComposing(false)} onSend={handleSendEmail} />}
    </div>
  );
}