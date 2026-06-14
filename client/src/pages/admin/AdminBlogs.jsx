import { gsap } from "gsap";
import {
  AlertTriangle,
  AlignLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Edit2,
  EyeOff,
  ImagePlus,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── API helpers ──────────────────────────────────────────────────────
const API = "/api";

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || res.statusText);
  }
  return res.json();
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(dateStr);
}

const EMPTY_BLOG = {
  title: "",
  content: "",
  image_url: "",
  images: ["", "", ""],
  author_name: "",
  author_image: "",
  is_published: true,
};

// ── Loader ───────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: "power3.out" },
    );
    const t = setTimeout(() => {
      gsap.to(ref.current, {
        y: 24,
        opacity: 0,
        duration: 0.2,
        onComplete: onDone,
      });
    }, 2800);
    return () => clearTimeout(t);
  }, []);
  const colors =
    type === "error"
      ? "bg-[#ff6584] shadow-[#ff6584]/25"
      : "bg-[#6c63ff] shadow-[#6c63ff]/25";
  return (
    <div
      ref={ref}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-100 px-5 py-3 rounded-2xl text-white text-sm font-medium shadow-lg ${colors}`}
    >
      {message}
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    );
  }, []);
  return (
    <div
      ref={ref}
      className="bg-[#1e2436] rounded-2xl p-4 flex items-center gap-3 border border-white/5"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-white leading-none truncate">
          {value}
        </p>
        <p className="text-[11px] text-white/35 mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

// ── ImageDropzone (single) ────────────────────────────────────────────
function ImageDropzone({ value, onChange, compact = false }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current.click()}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-200 overflow-hidden
        flex flex-col items-center justify-center
        ${compact ? "h-24" : "h-36"}
        ${drag ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-white/10 hover:border-[#6c63ff]/50 bg-[#151929]"}`}
    >
      {value ? (
        <>
          <img
            src={value}
            alt="preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center
              text-white/70 hover:text-white hover:bg-black/90 transition-colors z-10"
          >
            <X size={10} />
          </button>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white text-xs font-medium">Replace</p>
          </div>
        </>
      ) : (
        <>
          <ImagePlus size={compact ? 16 : 24} className="text-white/20 mb-2" />
          {!compact && (
            <p className="text-xs text-white/30">Drop image or tap to upload</p>
          )}
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ── AvatarDropzone ────────────────────────────────────────────────────
function AvatarDropzone({ value, onChange }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current.click()}
      className={`relative cursor-pointer rounded-full border-2 border-dashed transition-colors duration-200 overflow-hidden
        flex items-center justify-center w-16 h-16 shrink-0
        ${drag ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-white/10 hover:border-[#6c63ff]/50 bg-[#151929]"}`}
    >
      {value ? (
        <>
          <img
            src={value}
            alt="author"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center
              text-white/70 hover:text-white hover:bg-black/90 transition-colors z-10"
          >
            <X size={8} />
          </button>
        </>
      ) : (
        <User size={20} className="text-white/20" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ── GalleryDropzone (3-slot grid) ─────────────────────────────────────
function GalleryDropzone({ values, onChange }) {
  const slots = [0, 1, 2];

  const handleChange = (idx, val) => {
    const next = [...values];
    next[idx] = val;
    onChange(next);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <ImageDropzone
            value={values[idx] || ""}
            onChange={(v) => handleChange(idx, v)}
            compact
          />
          <p className="text-center text-[10px] text-white/20">{idx + 1}</p>
        </div>
      ))}
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────
function FormField({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-white/40 mb-1.5 uppercase tracking-wide">
        {Icon && <Icon size={11} />} {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-[#ff6584] mt-1">{error}</p>}
    </div>
  );
}

function InputField({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full h-10 px-3 rounded-xl bg-[#151929] border border-white/8 text-sm text-white
        placeholder-white/20 outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/20
        transition-colors ${className}`}
    />
  );
}

// ── Blog Modal ────────────────────────────────────────────────────────
function BlogModal({ blog, onSave, onClose }) {
  const [form, setForm] = useState(
    blog
      ? {
          ...EMPTY_BLOG,
          ...blog,
          author_name: blog.author_name || blog.author?.name || "",
          author_image: blog.author_image || blog.author?.image || "",
          is_published: blog.is_published ?? true,
          images: Array.isArray(blog.images)
            ? [...blog.images, "", "", ""].slice(0, 3)
            : ["", "", ""],
        }
      : { ...EMPTY_BLOG },
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
    );
    gsap.fromTo(
      modalRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" },
    );
  }, []);

  const close = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(modalRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.18,
      onComplete: onClose,
    });
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.content.trim()) e.content = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      images: form.images.filter(Boolean),
    };
    // Remove legacy author_id if present
    delete payload.author_id;
    try {
      let saved;
      if (blog?.id) {
        saved = await apiFetch(`/blogs/${blog.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        saved = await apiFetch("/blogs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSave(saved);
      close();
    } catch (e) {
      setErrors({ _api: e.message });
      setSaving(false);
    }
  };

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-xl bg-[#1e2436] rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl overflow-hidden"
      >
        {/* Handle bar mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center">
              <BookOpen size={15} className="text-[#6c63ff]" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {blog ? "Edit post" : "New post"}
            </h2>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {errors._api && (
            <div className="px-4 py-3 rounded-xl bg-[#ff6584]/10 border border-[#ff6584]/20 text-sm text-[#ff6584]">
              {errors._api}
            </div>
          )}

          {/* Title */}
          <FormField label="Title" icon={Tag} error={errors.title}>
            <InputField
              placeholder="e.g. How to build a great product"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              autoFocus
            />
          </FormField>

          {/* Content */}
          <FormField label="Content" icon={AlignLeft} error={errors.content}>
            <div className="relative">
              <textarea
                rows={6}
                placeholder="Write your blog content here…"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#151929] border border-white/8 text-sm text-white
                  placeholder-white/20 outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/20
                  transition-colors resize-none"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-white/20 pointer-events-none">
                {wordCount} words
              </span>
            </div>
          </FormField>

          {/* Author row */}
          <div className="rounded-xl border border-white/6 bg-[#151929]/50 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#3b82f6]/20 flex items-center justify-center shrink-0">
                <User size={10} className="text-[#93c5fd]" />
              </div>
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">
                Author
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Avatar dropzone */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <AvatarDropzone
                  value={
                    form.author_image?.startsWith("data:")
                      ? form.author_image
                      : ""
                  }
                  onChange={(v) => set("author_image", v)}
                />
                <p className="text-[9px] text-white/20">photo</p>
              </div>

              {/* Name + image URL */}
              <div className="flex-1 space-y-2 min-w-0">
                <InputField
                  placeholder="Author name"
                  value={form.author_name}
                  onChange={(e) => set("author_name", e.target.value)}
                />
                <InputField
                  placeholder="Author image URL (or upload left)"
                  value={
                    form.author_image?.startsWith("data:")
                      ? ""
                      : form.author_image || ""
                  }
                  onChange={(e) => set("author_image", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Published toggle */}
          <FormField label="Status">
            <button
              onClick={() => set("is_published", !form.is_published)}
              className={`w-full h-10 px-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
                ${
                  form.is_published
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-[#151929] border-white/8 text-white/40 hover:border-white/20"
                }`}
            >
              {form.is_published ? (
                <>
                  <CheckCircle size={14} /> Published
                </>
              ) : (
                <>
                  <EyeOff size={14} /> Draft
                </>
              )}
            </button>
          </FormField>

          {/* ── IMAGE SECTION ── */}
          <div className="rounded-xl border border-white/6 bg-[#151929]/50 p-3 space-y-4">
            {/* 1. Main image */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-[#6c63ff]/20 flex items-center justify-center shrink-0">
                  <Star size={10} className="text-[#a89fff]" />
                </div>
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">
                  Main image
                </span>
                <span className="text-[10px] text-white/20 ml-auto">
                  shown in listings
                </span>
              </div>
              <InputField
                placeholder="https://… or upload below"
                value={
                  form.image_url?.startsWith("data:")
                    ? ""
                    : form.image_url || ""
                }
                onChange={(e) => set("image_url", e.target.value)}
                className="mb-2"
              />
              <ImageDropzone
                value={
                  form.image_url?.startsWith("data:") ? form.image_url : ""
                }
                onChange={(v) => set("image_url", v)}
              />
            </div>

            {/* divider */}
            <div className="border-t border-white/5" />

            {/* 2. Gallery images */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-[#3b82f6]/20 flex items-center justify-center shrink-0">
                  <ImagePlus size={10} className="text-[#93c5fd]" />
                </div>
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">
                  Gallery
                </span>
                <span className="text-[10px] text-white/20 ml-auto">
                  up to 3 photos
                </span>
              </div>
              <GalleryDropzone
                values={form.images}
                onChange={(v) => set("images", v)}
              />
            </div>
          </div>
          {/* ── END IMAGE SECTION ── */}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/5">
          <button
            onClick={close}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/8 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#6c63ff] text-white
              hover:bg-[#5a52e0] disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[#6c63ff]/20"
          >
            {saving ? "Saving…" : blog ? "Save changes" : "Publish post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────
function DeleteConfirm({ blog, onConfirm, onClose }) {
  const overlayRef = useRef(null);
  const boxRef = useRef(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.18 },
    );
    gsap.fromTo(
      boxRef.current,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" },
    );
  }, []);

  const close = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.15 });
    gsap.to(boxRef.current, {
      y: 12,
      opacity: 0,
      duration: 0.15,
      onComplete: onClose,
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiFetch(`/blogs/${blog.id}`, { method: "DELETE" });
      onConfirm(blog.id);
      close();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={boxRef}
        className="w-full max-w-sm bg-[#1e2436] rounded-2xl border border-white/8 p-5 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#ff6584]/15 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-[#ff6584]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Delete post?</h3>
            <p className="text-xs text-white/35 mt-0.5">
              This can't be undone.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/50 mb-5">
          You're about to delete{" "}
          <span className="text-white font-medium">"{blog.title}"</span>.
        </p>
        <div className="flex gap-3">
          <button
            onClick={close}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/8 hover:text-white hover:bg-white/5 transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#ff6584] text-white hover:bg-[#e05070] disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Author avatar helper ──────────────────────────────────────────────
function AuthorAvatar({ blog, size = "sm" }) {
  const dim = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const img = blog.author_image || blog.author?.image;
  const name = blog.author_name || blog.author?.name || blog.author?.email;
  if (!name && !img) return null;
  return (
    <div className="flex items-center gap-1.5">
      {img ? (
        <img
          src={img}
          alt={name}
          className={`${dim} rounded-full object-cover border border-white/10`}
        />
      ) : (
        <div
          className={`${dim} rounded-full bg-[#6c63ff]/30 flex items-center justify-center shrink-0`}
        >
          <User size={size === "sm" ? 9 : 11} className="text-[#a89fff]" />
        </div>
      )}
      <span className="text-[10px] text-white/25 truncate">{name}</span>
    </div>
  );
}

// ── Blog Card (mobile) ────────────────────────────────────────────────
function BlogCard({ blog, onEdit, onDelete, index }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        delay: index * 0.05,
      },
    );
  }, []);

  return (
    <div
      ref={ref}
      className="bg-[#1e2436] rounded-2xl border border-white/5 overflow-hidden flex items-stretch"
    >
      {/* Cover */}
      <div className="w-20 shrink-0 bg-[#151929] relative">
        {blog.image_url ? (
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={20} className="text-white/15" />
          </div>
        )}
        <span
          className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full
          ${blog.is_published ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/30"}`}
        >
          {blog.is_published ? "Live" : "Draft"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white leading-tight line-clamp-1">
            {blog.title}
          </p>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(blog)}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(blog)}
              className="p-1.5 rounded-lg text-white/30 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-white/30 mt-1 line-clamp-2">
          {blog.content}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Calendar size={10} className="text-white/25" />
          <span className="text-[10px] text-white/25">
            {timeAgo(blog.created_at || blog.createdAt)}
          </span>
          {(blog.author_name || blog.author?.name) && (
            <>
              <span className="text-white/15">·</span>
              <AuthorAvatar blog={blog} size="sm" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Blog Row (desktop) ────────────────────────────────────────────────
function BlogRow({ blog, onEdit, onDelete, index }) {
  const rowRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      rowRef.current,
      { opacity: 0, x: -10 },
      {
        opacity: 1,
        x: 0,
        duration: 0.28,
        ease: "power2.out",
        delay: index * 0.04,
      },
    );
  }, []);

  return (
    <tr
      ref={rowRef}
      className="border-b border-white/4 hover:bg-white/2 transition-colors group"
    >
      {/* Title + cover */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {blog.image_url ? (
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#252b3b] flex items-center justify-center shrink-0 border border-white/5">
              <BookOpen size={14} className="text-white/20" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate max-w-50">
              {blog.title}
            </p>
            <p className="text-xs text-white/30 truncate max-w-50">
              {blog.content?.slice(0, 60)}…
            </p>
          </div>
        </div>
      </td>

      {/* Author */}
      <td className="py-3 px-4">
        <AuthorAvatar blog={blog} size="md" />
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium
          ${blog.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}
        >
          {blog.is_published ? "Published" : "Draft"}
        </span>
      </td>

      {/* Created at */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-white/25 shrink-0" />
          <span className="text-xs text-white/40">
            {formatDate(blog.created_at || blog.createdAt)}
          </span>
        </div>
        <p className="text-[10px] text-white/20 mt-0.5 pl-4.75">
          {timeAgo(blog.created_at || blog.createdAt)}
        </p>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(blog)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(blog)}
            className="p-1.5 rounded-lg text-white/40 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "published" | "draft"
  const [modal, setModal] = useState(null); // null | "add" | blog object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    );
    apiFetch("/blogs")
      .then((bl) => setBlogs(bl))
      .catch((e) => setToast({ message: e.message, type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const filtered = blogs.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.content?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "published"
        ? b.is_published
        : statusFilter === "draft"
          ? !b.is_published
          : true;
    return matchSearch && matchStatus;
  });

  const handleSave = (saved) => {
    setBlogs((bs) =>
      bs.find((b) => b.id === saved.id)
        ? bs.map((b) => (b.id === saved.id ? saved : b))
        : [saved, ...bs],
    );
    showToast(`"${saved.title}" saved`);
  };

  const handleDelete = (id) => {
    setBlogs((bs) => bs.filter((b) => b.id !== id));
    showToast("Post deleted");
  };

  const published = blogs.filter((b) => b.is_published).length;
  const drafts = blogs.length - published;
  const authorsSet = new Set(
    blogs.map((b) => b.author_name || b.author?.name).filter(Boolean),
  );

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div
        ref={headerRef}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div>
          <h1 className="text-xl font-bold text-white">Blog</h1>
          <p className="text-sm text-white/35 mt-0.5">
            {loading ? "Loading…" : `${blogs.length} posts`}
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold
            hover:bg-[#5a52e0] active:scale-95 transition-all shadow-lg shadow-[#6c63ff]/25"
        >
          <Plus size={16} />
          <span>New post</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total posts"
          value={blogs.length}
          icon={BookOpen}
          color="bg-[#6c63ff]"
        />
        <StatCard
          label="Published"
          value={published}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatCard
          label="Drafts"
          value={drafts}
          icon={EyeOff}
          color="bg-white/20"
        />
        <StatCard
          label="Authors"
          value={authorsSet.size || "—"}
          icon={User}
          color="bg-[#3b82f6]"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-35 h-10 px-3 rounded-xl bg-[#1e2436] border border-white/8 focus-within:border-[#6c63ff]/50 transition-colors">
          <Search size={14} className="text-white/25 shrink-0" />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-white/20 outline-none w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-white/25 hover:text-white/60 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-[#1e2436] border border-white/8 rounded-xl p-1">
          {[
            ["", "All"],
            ["published", "Published"],
            ["draft", "Drafts"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${statusFilter === val ? "bg-[#6c63ff] text-white shadow" : "text-white/40 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/25">
                  {search || statusFilter
                    ? "No posts match your filters."
                    : "No posts yet. Write your first one."}
                </p>
              </div>
            ) : (
              filtered.map((b, i) => (
                <BlogCard
                  key={b.id}
                  blog={b}
                  index={i}
                  onEdit={(b) => setModal(b)}
                  onDelete={(b) => setDeleteTarget(b)}
                />
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-[#1e2436] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Post", "Author", "Status", "Created", ""].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 text-[11px] font-semibold text-white/25 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <BookOpen
                          size={32}
                          className="text-white/10 mx-auto mb-3"
                        />
                        <p className="text-sm text-white/25">
                          {search || statusFilter
                            ? "No posts match your filters."
                            : "No posts yet."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b, i) => (
                      <BlogRow
                        key={b.id}
                        blog={b}
                        index={i}
                        onEdit={(b) => setModal(b)}
                        onDelete={(b) => setDeleteTarget(b)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-white/5">
                <p className="text-xs text-white/25">
                  Showing {filtered.length} of {blogs.length} posts
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {modal && (
        <BlogModal
          blog={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          blog={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
