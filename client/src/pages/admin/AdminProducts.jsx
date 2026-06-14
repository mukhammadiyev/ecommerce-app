import { gsap } from "gsap";
import {
  AlertTriangle,
  AlignLeft,
  ChevronDown,
  DollarSign,
  Edit2,
  FolderPlus,
  ImagePlus,
  Layers,
  Package,
  Percent,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
function formatPrice(p) {
  return `$${Number(p).toFixed(2)}`;
}

function categoryName(cats, id) {
  return cats.find((c) => c.id === Number(id))?.name ?? "—";
}

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  images: ["", "", "",],
  discount: "",
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-100 px-5 py-3 rounded-2xl
        text-white text-sm font-medium shadow-lg ${colors}`}
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
        ${compact ? "h-24" : "h-32"}
        ${drag ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-white/10 hover:border-[#6c63ff]/50 bg-[#151929]"}`}
    >
      {value ? (
        <>
          <img
            src={value}
            alt="preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Clear button */}
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
          <ImagePlus size={compact ? 16 : 22} className="text-white/20 mb-1" />
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

// ── GalleryDropzone (4-slot grid) ─────────────────────────────────────
function GalleryDropzone({ values, onChange }) {
  // values is string[4]
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

// ── InputField ────────────────────────────────────────────────────────
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

// ── SelectField ───────────────────────────────────────────────────────
function SelectField({ children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full h-10 px-3 pr-8 rounded-xl bg-[#151929] border border-white/8 text-sm text-white
          outline-none focus:border-[#6c63ff]/60 appearance-none transition-colors cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
      />
    </div>
  );
}

// ── Category Modal ────────────────────────────────────────────────────
function CategoryModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
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
      { y: 32, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" },
    );
  }, []);

  const close = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.18 });
    gsap.to(modalRef.current, {
      y: 16,
      opacity: 0,
      duration: 0.18,
      onComplete: onClose,
    });
  };

  const autoSlug = (v) =>
    v
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const handleName = (v) => {
    setName(v);
    setSlug(autoSlug(v));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          slug: slug || autoSlug(name),
        }),
      });
      onSave(created);
      close();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-md bg-[#1e2436] rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
              <FolderPlus size={15} className="text-[#3b82f6]" />
            </div>
            <h2 className="text-base font-semibold text-white">New category</h2>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <FormField label="Category name" icon={Tag} error={error}>
            <InputField
              placeholder="e.g. Electronics"
              value={name}
              onChange={(e) => handleName(e.target.value)}
              autoFocus
            />
          </FormField>
          <FormField label="Slug">
            <InputField
              placeholder="auto-generated"
              value={slug}
              onChange={(e) => setSlug(autoSlug(e.target.value))}
            />
          </FormField>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={close}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/8 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#3b82f6] text-white
              hover:bg-[#2563eb] disabled:opacity-50 transition-all"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Modal ─────────────────────────────────────────────────────
function ProductModal({
  product,
  categories,
  onSave,
  onClose,
  onCategoryCreate,
}) {
  const [form, setForm] = useState(
    product
      ? {
          ...product,
          price: String(product.price),
          stock: String(product.stock),
          discount: String(product.discount ?? ""),
          category_id: String(product.category_id ?? ""),
          // Normalise images to always be a 4-slot array
          images: Array.isArray(product.images)
            ? [...product.images, "", "", ""].slice(0, 3)
            : ["", "", ""],
        }
      : { ...EMPTY_PRODUCT },
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
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
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Enter a valid price";
    if (form.stock === "" || isNaN(form.stock) || Number(form.stock) < 0)
      e.stock = "Must be 0+";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      discount: form.discount ? Number(form.discount) : 0,
      category_id: form.category_id ? Number(form.category_id) : null,
      // Strip empty gallery slots before sending
      images: form.images.filter(Boolean),
    };
    try {
      let saved;
      if (product?.id) {
        saved = await apiFetch(`/products/${product.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        saved = await apiFetch("/products", {
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

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      >
        <div
          ref={modalRef}
          className="w-full sm:max-w-lg bg-[#1e2436] rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl overflow-hidden"
        >
          {/* Handle bar for mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/15" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center">
                <Package size={15} className="text-[#6c63ff]" />
              </div>
              <h2 className="text-base font-semibold text-white">
                {product ? "Edit product" : "Add product"}
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
            className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {errors._api && (
              <div className="px-4 py-3 rounded-xl bg-[#ff6584]/10 border border-[#ff6584]/20 text-sm text-[#ff6584]">
                {errors._api}
              </div>
            )}

            <FormField label="Product name" icon={Tag} error={errors.name}>
              <InputField
                placeholder="e.g. Wireless Headphones"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </FormField>

            <FormField label="Description" icon={AlignLeft}>
              <textarea
                rows={2}
                placeholder="Short description…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#151929] border border-white/8 text-sm text-white
                  placeholder-white/20 outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/20
                  transition-colors resize-none"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Price ($)"
                icon={DollarSign}
                error={errors.price}
              >
                <InputField
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </FormField>
              <FormField label="Discount %" icon={Percent}>
                <InputField
                  type="number"
                  placeholder="0"
                  value={form.discount}
                  onChange={(e) => set("discount", e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Stock" icon={Layers} error={errors.stock}>
                <InputField
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </FormField>
              <FormField label="Category">
                <div className="flex gap-1.5">
                  <div className="flex-1 min-w-0">
                    <SelectField
                      value={form.category_id}
                      onChange={(e) => set("category_id", e.target.value)}
                    >
                      <option value="">None</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                  <button
                    onClick={() => setShowCatModal(true)}
                    title="Create new category"
                    className="w-10 h-10 shrink-0 rounded-xl bg-[#151929] border border-white/8
                      flex items-center justify-center text-white/40 hover:text-[#3b82f6] hover:border-[#3b82f6]/40 transition-colors"
                  >
                    <FolderPlus size={15} />
                  </button>
                </div>
              </FormField>
            </div>

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
                    form.image_url?.startsWith("data:") ? "" : form.image_url
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
              {saving ? "Saving…" : product ? "Save changes" : "Add product"}
            </button>
          </div>
        </div>
      </div>

      {showCatModal && (
        <CategoryModal
          onSave={(cat) => {
            onCategoryCreate(cat);
            set("category_id", String(cat.id));
            setShowCatModal(false);
          }}
          onClose={() => setShowCatModal(false)}
        />
      )}
    </>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────
function DeleteConfirm({ product, onConfirm, onClose }) {
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
      await apiFetch(`/products/${product.id}`, { method: "DELETE" });
      onConfirm(product.id);
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
            <h3 className="text-sm font-semibold text-white">
              Delete product?
            </h3>
            <p className="text-xs text-white/35 mt-0.5">
              This can't be undone.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/50 mb-5">
          You're about to delete{" "}
          <span className="text-white font-medium">"{product.name}"</span>.
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

// ── Product card (mobile) ─────────────────────────────────────────────
function ProductCard({ product, categories, onEdit, onDelete, index }) {
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

  const stockColor =
    product.stock === 0
      ? "text-[#ff6584] bg-[#ff6584]/10"
      : product.stock < 10
        ? "text-amber-400 bg-amber-400/10"
        : "text-emerald-400 bg-emerald-400/10";

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div
      ref={ref}
      className="bg-[#1e2436] rounded-2xl border border-white/5 overflow-hidden flex items-stretch"
    >
      {/* Image */}
      <div className="w-20 shrink-0 bg-[#151929] relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={20} className="text-white/15" />
          </div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-[#ff6584] text-white px-1.5 py-0.5 rounded-md">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {product.name}
          </p>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="p-1.5 rounded-lg text-white/30 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {product.category_id && (
          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#6c63ff]/15 text-[#a89fff] font-medium">
            {categoryName(categories, product.category_id)}
          </span>
        )}

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-white">
              {formatPrice(finalPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-[11px] text-white/30 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] text-white/50">
                {product.rating}
              </span>
            </div>
          )}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${stockColor}`}
          >
            {product.stock === 0 ? "Out" : `${product.stock}`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Product row (desktop) ─────────────────────────────────────────────
function ProductRow({ product, categories, onEdit, onDelete, index }) {
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

  const stockColor =
    product.stock === 0
      ? "text-[#ff6584] bg-[#ff6584]/10"
      : product.stock < 10
        ? "text-amber-400 bg-amber-400/10"
        : "text-emerald-400 bg-emerald-400/10";

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <tr
      ref={rowRef}
      className="border-b border-white/4 hover:bg-white/2 transition-colors group"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-[#252b3b] flex items-center justify-center shrink-0 border border-white/5">
              <Package size={14} className="text-white/20" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate max-w-40">
              {product.name}
            </p>
            {product.description && (
              <p className="text-xs text-white/30 truncate max-w-40">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#6c63ff]/15 text-[#a89fff] font-medium">
          {categoryName(categories, product.category_id)}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-white tabular-nums">
            {formatPrice(finalPrice)}
          </span>
          {product.discount > 0 && (
            <>
              <span className="text-xs text-white/30 line-through tabular-nums">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ff6584]/15 text-[#ff6584] font-medium">
                -{product.discount}%
              </span>
            </>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${stockColor}`}
        >
          {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(product)}
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
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }
  const [showGlobalCatModal, setShowGlobalCatModal] = useState(false);

  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    );
    Promise.all([
      apiFetch("/products"),
      apiFetch("/categories"),
    ])
      .then(([prodsRes, catsRes]) => {
        const actualProducts = prodsRes?.data || prodsRes;
        const actualCategories = catsRes?.data || catsRes;

        setProducts(Array.isArray(actualProducts) ? actualProducts : []);
        setCategories(Array.isArray(actualCategories) ? actualCategories : []);
      })
      .catch((e) => setToast({ message: e.message, type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const filtered = (Array.isArray(products) ? products : []).filter((p) => {
    if (!p || !p.name) return false;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter ? p.category_id === Number(catFilter) : true;
    return matchSearch && matchCat;
  });

  const handleSave = (saved) => {
    const cleanSaved = saved?.data || saved;
    if (!cleanSaved || !cleanSaved.id) return;

    setProducts((ps) => {
      const safePs = Array.isArray(ps) ? ps : [];
      return safePs.find((p) => p.id === cleanSaved.id)
        ? safePs.map((p) => (p.id === cleanSaved.id ? cleanSaved : p))
        : [...safePs, cleanSaved];
    });
    showToast(cleanSaved.name + " saved");
  };

  const handleDelete = (id) => {
    setProducts((ps) => (Array.isArray(ps) ? ps : []).filter((p) => p.id !== id));
    showToast("Product deleted");
  };

  const handleCategoryCreate = (cat) => {
    const cleanCat = cat?.data || cat;
    setCategories((cs) => [...(Array.isArray(cs) ? cs : []), cleanCat]);
    showToast(`Category "${cleanCat.name}" created`);
  };

  const safeProductsList = Array.isArray(products) ? products : [];
  const totalValue = safeProductsList.reduce((s, p) => s + Number(p.price || 0) * (p.stock || 0), 0);
  const outOfStock = safeProductsList.filter((p) => p.stock === 0).length;

  return (
    <div className="min-h-screen bg-[#0f121d] text-white/90 p-4 sm:p-6 lg:p-8 antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Action Row */}
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Products Inventory</h1>
            <p className="text-xs text-white/30 mt-0.5">Manage stock, prices, adjustments and category bindings.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGlobalCatModal(true)}
              className="h-10 px-4 rounded-xl border border-white/8 text-xs font-semibold hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <FolderPlus size={14} className="text-white/40" />
              <span>Add Category</span>
            </button>
            <button
              onClick={() => setModal("add")}
              className="h-10 px-4 rounded-xl bg-[#6c63ff] hover:bg-[#5a52e0] text-xs font-semibold shadow-lg shadow-[#6c63ff]/15 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Dynamic Analytics Counter Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Items" value={safeProductsList.length} icon={Package} color="bg-indigo-500/10 text-indigo-400" />
          <StatCard label="Total Value" value={formatPrice(totalValue)} icon={DollarSign} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Out of Stock" value={outOfStock} icon={AlertTriangle} color={outOfStock > 0 ? "bg-rose-500/10 text-rose-400" : "bg-white/5 text-white/30"} />
          <StatCard label="Categories" value={categories.length} icon={Tag} color="bg-blue-500/10 text-blue-400" />
        </div>

        {/* Searching & Quick Filters Controls bar */}
        <div className="bg-[#1e2436] rounded-2xl border border-white/5 p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={15} />
            <input
              type="text"
              placeholder="Search by title, specs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#151929] border border-white/5 outline-none text-sm placeholder-white/25 focus:border-[#6c63ff]/40 transition-colors"
            />
          </div>
          <div className="w-full sm:w-48">
            <SelectField value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>
          </div>
        </div>

        {/* Dynamic Master-Detail Layout wrapper */}
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="bg-[#1e2436] rounded-2xl border border-white/5 py-16 text-center">
            <Package size={32} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/40">No matching products matching parameters found</p>
          </div>
        ) : (
          <>
            {/* Viewport View 1: Mobile List Cards structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:hidden">
              {filtered.map((item, idx) => (
                <ProductCard
                  key={item.id || idx}
                  product={item}
                  categories={categories}
                  onEdit={(p) => setModal(p)}
                  onDelete={(p) => setDeleteTarget(p)}
                  index={idx}
                />
              ))}
            </div>

            {/* Viewport View 2: Desktop Tabular Grid framework representation */}
            <div className="hidden sm:block bg-[#1e2436] rounded-2xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Item Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Pricing</th>
                      <th className="py-3.5 px-4">Availability status</th>
                      <th className="py-3.5 px-4 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, idx) => (
                      <ProductRow
                        key={item.id || idx}
                        product={item}
                        categories={categories}
                        onEdit={(p) => setModal(p)}
                        onDelete={(p) => setDeleteTarget(p)}
                        index={idx}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Global Portals, Overlay and Dialog systems instantiation */}
      {modal && (
        <ProductModal
          product={modal === "add" ? null : modal}
          categories={categories}
          onSave={handleSave}
          onCategoryCreate={handleCategoryCreate}
          onClose={() => setModal(null)}
        />
      )}

      {showGlobalCatModal && (
        <CategoryModal
          onSave={handleCategoryCreate}
          onClose={() => setShowGlobalCatModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
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
