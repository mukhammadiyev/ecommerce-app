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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const LABELS = [
  { id: "primary", name: "Primary", color: "#6c63ff" },
  { id: "social", name: "Social", color: "#3b82f6" },
  { id: "work", name: "Work", color: "#f59e0b" },
  { id: "friends", name: "Friends", color: "#10b981" },
];

const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: InboxIcon, count: 1253 },
  { id: "starred", label: "Starred", icon: Star, count: 245 },
  { id: "sent", label: "Sent", icon: Send, count: 24532 },
  { id: "draft", label: "Draft", icon: FilePen, count: 9 },
  { id: "spam", label: "Spam", icon: AlertTriangle, count: 14 },
  { id: "important", label: "Important", icon: Info, count: 18 },
  { id: "bin", label: "Bin", icon: Trash2, count: 9 },
];

const EMAILS = [
  {
    id: 1,
    from: "Jullu Jalal",
    label: "primary",
    subject: "Our Bachelor of Commerce program is ACBSP-accredited.",
    time: "8:38 AM",
    starred: false,
    read: false,
  },
  {
    id: 2,
    from: "Minerva Barnett",
    label: "work",
    subject: "Get Best Advertiser In Your Side Pocket",
    time: "8:13 AM",
    starred: false,
    read: false,
  },
  {
    id: 3,
    from: "Peter Lewis",
    label: "friends",
    subject: "Vacation Home Rental Success",
    time: "7:52 PM",
    starred: false,
    read: true,
  },
  {
    id: 4,
    from: "Anthony Briggs",
    label: null,
    subject: "Free Classifieds Using Them To Promote Your Stuff Online",
    time: "7:52 PM",
    starred: true,
    read: true,
  },
  {
    id: 5,
    from: "Clifford Morgan",
    label: "social",
    subject: "Enhance Your Brand Potential With Giant Advertising Blimps",
    time: "4:13 PM",
    starred: false,
    read: true,
  },
  {
    id: 6,
    from: "Cecilia Webster",
    label: "friends",
    subject: "Always Look On The Bright Side Of Life",
    time: "3:52 PM",
    starred: false,
    read: true,
  },
  {
    id: 7,
    from: "Harvey Manning",
    label: null,
    subject: "Curling Irons Are As Individual As The Women Who Use Them",
    time: "2:30 PM",
    starred: true,
    read: true,
  },
  {
    id: 8,
    from: "Willie Blake",
    label: "primary",
    subject: "Our Bachelor of Commerce program is ACBSP-accredited.",
    time: "8:38 AM",
    starred: false,
    read: false,
  },
  {
    id: 9,
    from: "Minerva Barnett",
    label: "work",
    subject: "Get Best Advertiser In Your Side Pocket",
    time: "8:13 AM",
    starred: false,
    read: true,
  },
  {
    id: 10,
    from: "Fanny Weaver",
    label: null,
    subject: "Free Classifieds Using Them To Promote Your Stuff Online",
    time: "7:52 PM",
    starred: true,
    read: true,
  },
  {
    id: 11,
    from: "Olga Hogan",
    label: "social",
    subject: "Enhance Your Brand Potential With Giant Advertising Blimps",
    time: "4:13 PM",
    starred: false,
    read: true,
  },
  {
    id: 12,
    from: "Lora Houston",
    label: "friends",
    subject: "Vacation Home Rental Success",
    time: "7:52 PM",
    starred: false,
    read: true,
  },
];

const PAGE_SIZE = 12;
const LABEL_MAP = Object.fromEntries(LABELS.map((l) => [l.id, l]));

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
const AVATAR_COLORS = [
  "#6c63ff",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

// ─── Compose Modal ────────────────────────────────────────────────────────────
function ComposeModal({ onClose }) {
  const overlayRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
    );
    gsap.fromTo(
      boxRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" },
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
          <button
            onClick={close}
            className="p-1 rounded text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {["To", "Subject"].map((ph) => (
            <input
              key={ph}
              placeholder={ph}
              className="w-full px-5 py-3 bg-transparent text-sm text-white placeholder-white/25 outline-none"
            />
          ))}
          <textarea
            rows={7}
            placeholder="Write your message..."
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold hover:bg-[#5a52e0] active:scale-95 transition-all">
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Detail ─────────────────────────────────────────────────────────────
function EmailDetail({ email, onClose }) {
  const panelRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      panelRef.current,
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.28, ease: "power2.out" },
    );
  }, []);

  const label = email.label ? LABEL_MAP[email.label] : null;
  const color = avatarColor(email.from);

  return (
    <div ref={panelRef} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-1">
          {[Reply, Archive, Trash2].map((Icon, i) => (
            <button
              key={i}
              className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>
      {/* Body */}
      <div
        className="flex-1 overflow-y-auto p-5 space-y-4"
        style={{ scrollbarWidth: "none" }}
      >
        <h2 className="text-base font-semibold text-white leading-snug">
          {email.subject}
        </h2>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: color }}
          >
            {getInitials(email.from)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{email.from}</p>
            <p className="text-xs text-white/30">to me · {email.time}</p>
          </div>
          {label && (
            <span
              className="ml-auto shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ background: label.color + "22", color: label.color }}
            >
              {label.name}
            </span>
          )}
        </div>
        <div className="text-sm text-white/50 leading-relaxed space-y-3 pt-2">
          <p>Hi there,</p>
          <p>
            {email.subject}. We wanted to reach out and share some exciting
            updates with you. Our team has been working hard to bring you the
            best experience possible.
          </p>
          <p>
            Please take a moment to review the information below and let us know
            if you have any questions.
          </p>
          <p>
            Best regards,
            <br />
            {email.from}
          </p>
        </div>
      </div>
      {/* Reply */}
      <div className="border-t border-white/5 p-4 shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#151929] border border-white/8 focus-within:border-[#6c63ff]/40 transition-colors">
          <input
            placeholder="Reply..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
          />
          <button className="p-1.5 rounded-lg bg-[#6c63ff] text-white hover:bg-[#5a52e0] transition-colors">
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar content (shared between drawer + desktop) ────────────────────────
function SidebarContent({ activeFolder, onFolder, onCompose, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Mobile close button */}
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

      {/* Compose */}
      <div className="p-3 border-b border-white/5 shrink-0">
        <button
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold
            hover:bg-[#5a52e0] active:scale-[0.98] transition-all shadow-lg shadow-[#6c63ff]/25"
        >
          <Plus size={15} /> Compose
        </button>
      </div>

      {/* Nav */}
      <div
        className="flex-1 overflow-y-auto px-2 py-2"
        style={{ scrollbarWidth: "none" }}
      >
        <p className="px-2 pb-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
          My Email
        </p>
        {FOLDERS.map((folder) => {
          const Icon = folder.icon;
          const active = activeFolder === folder.id;
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
              <span className="flex-1 text-left font-medium">
                {folder.label}
              </span>
              {folder.count > 0 && (
                <span
                  className={`text-xs tabular-nums ${active ? "text-white/70" : "text-white/25"}`}
                >
                  {folder.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}

        <p className="px-2 pt-4 pb-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
          Label
        </p>
        {LABELS.map((lbl) => (
          <button
            key={lbl.id}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-sm text-white/45 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ background: lbl.color }}
            />
            <span className="font-medium">{lbl.name}</span>
          </button>
        ))}
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors mt-1">
          <Plus size={13} /> <span>Create New Label</span>
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Sidebar Drawer ────────────────────────────────────────────────────
function MobileSidebarDrawer({
  open,
  onClose,
  activeFolder,
  onFolder,
  onCompose,
}) {
  const overlayRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!overlayRef.current || !drawerRef.current) return;
    if (open) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 },
      );
      gsap.fromTo(
        drawerRef.current,
        { x: "-100%" },
        { x: "0%", duration: 0.28, ease: "power2.out" },
      );
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
      gsap.to(drawerRef.current, {
        x: "-100%",
        duration: 0.22,
        ease: "power2.in",
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className="relative w-72 h-full bg-[#1a1f2e] border-r border-white/5 shadow-2xl"
      >
        <SidebarContent
          activeFolder={activeFolder}
          onFolder={onFolder}
          onCompose={onCompose}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

// ─── Email Row ────────────────────────────────────────────────────────────────
function EmailRow({
  email,
  selected,
  checked,
  onSelect,
  onCheck,
  onStar,
  index,
}) {
  const rowRef = useRef(null);
  const label = email.label ? LABEL_MAP[email.label] : null;
  const color = avatarColor(email.from);

  useEffect(() => {
    gsap.fromTo(
      rowRef.current,
      { opacity: 0, y: 6 },
      {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
        delay: index * 0.025,
      },
    );
  }, []);

  return (
    <div
      ref={rowRef}
      onClick={() => onSelect(email)}
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-white/4 cursor-pointer transition-colors
        ${selected ? "bg-[#6c63ff]/10" : email.read ? "hover:bg-white/2" : "bg-white/2.5 hover:bg-white/4"}`}
    >
      {/* Checkbox */}
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
          onChange={() => {}}
          className="w-4 h-4 rounded accent-[#6c63ff] cursor-pointer pointer-events-none"
        />
      </div>

      {/* Star */}
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

      {/* Avatar */}
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0"
        style={{ background: color }}
      >
        {getInitials(email.from)}
      </div>

      {/* From — fixed width on desktop, full on mobile */}
      <span
        className={`text-sm shrink-0 w-28 hidden sm:block truncate
        ${email.read ? "text-white/50 font-normal" : "text-white font-semibold"}`}
      >
        {email.from}
      </span>

      {/* Label badge */}
      {label && (
        <span
          className="hidden sm:inline-block shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: label.color + "28", color: label.color }}
        >
          {label.name}
        </span>
      )}

      {/* Subject + sender on mobile */}
      <div className="flex-1 min-w-0">
        {/* Mobile: show sender above subject */}
        <p
          className={`text-xs sm:hidden mb-0.5 truncate ${email.read ? "text-white/50" : "text-white font-semibold"}`}
        >
          {email.from}
          {label && (
            <span
              className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: label.color + "28", color: label.color }}
            >
              {label.name}
            </span>
          )}
        </p>
        <p
          className={`text-sm truncate ${email.read ? "text-white/40" : "text-white/75"}`}
        >
          {email.subject}
        </p>
      </div>

      {/* Time */}
      <span className="text-xs text-white/25 shrink-0 whitespace-nowrap">
        {email.time}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Inbox() {
  const [emails, setEmails] = useState(EMAILS);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [composing, setComposing] = useState(false);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
    );
  }, []);

  const filtered = emails.filter(
    (e) =>
      e.from.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleStar = (id) =>
    setEmails((es) =>
      es.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)),
    );
  const toggleCheck = (id) =>
    setChecked((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const allChecked =
    paginated.length > 0 && paginated.every((e) => checked.has(e.id));
  const toggleAll = () => {
    if (allChecked)
      setChecked((s) => {
        const n = new Set(s);
        paginated.forEach((e) => n.delete(e.id));
        return n;
      });
    else
      setChecked((s) => {
        const n = new Set(s);
        paginated.forEach((e) => n.add(e.id));
        return n;
      });
  };
  const deleteChecked = () => {
    setEmails((es) => es.filter((e) => !checked.has(e.id)));
    setChecked(new Set());
    setSelected(null);
  };
  const handleFolder = (id) => {
    setActiveFolder(id);
    setSelected(null);
    setPage(1);
  };

  const unread = emails.filter((e) => !e.read).length;

  return (
    <div className="flex flex-col h-full gap-4" style={{ minHeight: 0 }}>
      {/* ── Page header ── */}
      <div
        ref={headerRef}
        className="flex items-center justify-between shrink-0 gap-3"
      >
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <InboxIcon size={18} className="text-[#6c63ff]" /> Inbox
            </h1>
            <p className="text-xs sm:text-sm text-white/35 mt-0.5">
              {unread} unread messages
            </p>
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

      {/* ── Body ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 bg-[#1a1f2e] rounded-2xl border border-white/5 overflow-hidden">
          <SidebarContent
            activeFolder={activeFolder}
            onFolder={handleFolder}
            onCompose={() => setComposing(true)}
          />
        </aside>

        {/* Main panel */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#1a1f2e] rounded-2xl border border-white/5 overflow-hidden">
          {selected ? (
            <EmailDetail email={selected} onClose={() => setSelected(null)} />
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
                    <button
                      onClick={() => setSearch("")}
                      className="text-white/25 hover:text-white/60 shrink-0"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {checked.size > 0 && (
                    <span className="text-xs text-white/30 px-1 hidden sm:block">
                      {checked.size}
                    </span>
                  )}
                  <button
                    className="p-1.5 sm:p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    title="Archive"
                  >
                    <Archive size={14} />
                  </button>
                  <button
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
                </div>
              </div>

              {/* Email list */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {paginated.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <InboxIcon size={32} className="text-white/10 mb-3" />
                    <p className="text-sm text-white/25 text-center px-4">
                      {search
                        ? "No messages match your search."
                        : "This folder is empty."}
                    </p>
                  </div>
                ) : (
                  paginated.map((email, i) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      index={i}
                      selected={selected?.id === email.id}
                      checked={checked.has(email.id)}
                      onSelect={setSelected}
                      onCheck={toggleCheck}
                      onStar={toggleStar}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 shrink-0">
                <p className="text-xs text-white/25 hidden sm:block">
                  Showing{" "}
                  {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length.toLocaleString()}
                </p>
                <p className="text-xs text-white/25 sm:hidden">
                  {page}/{totalPages || 1}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <MobileSidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeFolder={activeFolder}
        onFolder={handleFolder}
        onCompose={() => {
          setComposing(true);
          setDrawerOpen(false);
        }}
      />

      {/* Compose modal */}
      {composing && <ComposeModal onClose={() => setComposing(false)} />}
    </div>
  );
}
