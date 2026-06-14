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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── API helpers ──────────────────────────────────────────────────────
const API = "http://localhost:5000/api";

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(opts.headers || {}) };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method: opts.method || "GET",
    headers: headers,
  };

  if (opts.body) {
    fetchOptions.body = opts.body;
  }

  const res = await fetch(`${API}${path}`, fetchOptions);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const msg = errorData?.message || errorData?.error || res.statusText;
    console.error("Backenddan kelgan xatolik:", errorData);
    throw new Error(msg);
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
  image: null,      // Fayl obyekti saqlanadi
  gallery: [null, null, null], // Fayl obyektlari saqlanadi
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
  }, [onDone]);

  const colors =
    type === "error"
      ? "bg-[#ff6584] shadow-[#ff6584]/25"
      : "bg-[#6c63ff] shadow-[#6c63ff]/25";

  return (
    <div
      ref={ref}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl
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

// ── ImageDropzone ────────────────────────────────────────────────────
function ImageDropzone({ value, onChange, compact = false }) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState("");
  const inputRef = useRef();

  // Agar dastlabki qiymat string (URL) bo'lsa preview qilish, aks holda File o'qish
  useEffect(() => {
    if (!value) {
      setPreview("");
      return;
    }
    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onChange(file); // Tahrirlovchiga haqiqiy File obyektini uzatamiz
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
      {preview ? (
        <>
          <img
            src={preview}
            alt="preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center
              text-white/70 hover:text-white hover:bg-black/90 transition-colors z-10"
          >
            <X size={10} />
          </button>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white text-xs font-medium">O'zgartirish</p>
          </div>
        </>
      ) : (
        <>
          <ImagePlus size={compact ? 16 : 22} className="text-white/20 mb-1" />
          {!compact && (
            <p className="text-xs text-white/30">Rasm tashlang yoki bosing</p>
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

// ── GalleryDropzone ───────────────────────────────────────────────────
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
            value={values[idx] || null}
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
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
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
      setError("Kategoriya nomi majburiy");
      return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || autoSlug(name),
    };

    try {
      const response = await apiFetch("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // BackendApiResponse'dan ma'lumotni to'g'ri olish
      const saved = response.data || response;
      onSave(saved);
      close();
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi");
      setSaving(false);
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div ref={modalRef} className="w-full sm:max-w-md bg-[#1e2436] rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
              <FolderPlus size={15} className="text-[#3b82f6]" />
            </div>
            <h2 className="text-base font-semibold text-white">Yangi kategoriya</h2>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <FormField label="Kategoriya nomi" icon={Tag} error={error}>
            <InputField placeholder="Masalan: Smartfonlar" value={name} onChange={(e) => handleName(e.target.value)} autoFocus />
          </FormField>
          <FormField label="Slug">
            <InputField placeholder="Avtomatik yaratiladi" value={slug} onChange={(e) => setSlug(autoSlug(e.target.value))} />
          </FormField>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={close} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/8 hover:text-white hover:bg-white/5 transition-colors">
            Bekor qilish
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50 transition-all">
            {saving ? "Yaratilmoqda…" : "Yaratish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Modal ─────────────────────────────────────────────────────
function ProductModal({ product, categories, onSave, onClose, onCategoryCreate }) {
  const [form, setForm] = useState(
    product
      ? {
          ...product,
          name: product.name || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          stock: String(product.stock ?? ""),
          discount: String(product.discount ?? ""),
          category_id: String(product.category_id ?? ""),
          image: product.image_url || product.image || null, 
          gallery: Array.isArray(product.images)
            ? [...product.images.map(img => img.image_url || img), null, null, null].slice(0, 3)
            : [null, null, null],
        }
      : { ...EMPTY_PRODUCT }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
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
    if (!form.name.trim()) e.name = "Majburiy maydon";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Noto'g'ri narx";
    if (form.stock === "" || isNaN(form.stock) || Number(form.stock) < 0) e.stock = "0 dan kam bo'lmasin";
    if (!form.category_id) e.category = "Kategoriyani tanlang";
    if (!form.image) e.image = "Asosiy rasm majburiy!";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description ? form.description.trim() : "");
    formData.append("price", String(form.price)); // 👈 Satr ko'rinishida yuborish ishonchliroq
    formData.append("stock", String(form.stock));
    formData.append("category_id", String(form.category_id));

    // 🔥 CHEGIRMA QISMINI MANA BUNDAY TO'G'RILAYMIZ:
    // Agar foydalanuvchi bo'sh qoldirgan bo'lsa yoki noto'g'ri narsa yozsa "0" ketadi, aks holda kiritilgan raqam satr ko'rinishida ketadi.
    const discountValue = form.discount && !isNaN(form.discount) ? String(form.discount) : "0";
    formData.append("discount", discountValue);

    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    if (Array.isArray(form.gallery)) {
      form.gallery.forEach((img) => {
        if (img instanceof File) {
          formData.append("gallery", img);
        }
      });
    }

    try {
      let response;
      if (product?.id) {
        response = await apiFetch(`/products/${product.id}`, {
          method: "PUT",
          body: formData, 
        });
      } else {
        response = await apiFetch("/products", {
          method: "POST",
          body: formData,
        });
      }
      
      const savedProduct = response.data || response;
      onSave(savedProduct);
      close();
    } catch (e) {
      setErrors({ _api: e.message || "Server bilan bog'liq xatolik" });
      setSaving(false);
    }
  };

  return (
    <>
      <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
        <div ref={modalRef} className="w-full sm:max-w-lg bg-[#1e2436] rounded-t-3xl sm:rounded-2xl border border-white/8 shadow-2xl overflow-hidden">
          <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-white/15" /></div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6c63ff]/20 flex items-center justify-center">
                <Package size={15} className="text-[#6c63ff]" />
              </div>
              <h2 className="text-base font-semibold text-white">{product ? "Mahsulotni tahrirlash" : "Mahsulot qo'shish"}</h2>
            </div>
            <button onClick={close} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"><X size={18} /></button>
          </div>

          <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {errors._api && <div className="px-4 py-3 rounded-xl bg-[#ff6584]/10 border border-[#ff6584]/20 text-sm text-[#ff6584]">{errors._api}</div>}
            
            <FormField label="Mahsulot nomi" icon={Tag} error={errors.name}>
              <InputField placeholder="Masalan: iPhone 15 Pro" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </FormField>

            <FormField label="Tavsif" icon={AlignLeft}>
              <textarea rows={2} placeholder="Mahsulot haqida ma'lumot…" value={form.description} onChange={(e) => set("description", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#151929] border border-white/8 text-sm text-white placeholder-white/20 outline-none focus:border-[#6c63ff]/60 focus:ring-1 focus:ring-[#6c63ff]/20 transition-colors resize-none" />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Narxi ($)" icon={DollarSign} error={errors.price}>
                <InputField type="number" placeholder="0.00" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </FormField>
              <FormField label="Chegirma %" icon={Percent}>
                <InputField type="number" placeholder="0" value={form.discount} onChange={(e) => set("discount", e.target.value)} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Soni (Omborda)" icon={Layers} error={errors.stock}>
                <InputField type="number" placeholder="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
              </FormField>
              <FormField label="Kategoriya" error={errors.category}>
                <div className="flex gap-1.5">
                  <div className="flex-1 min-w-0">
                    <SelectField value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                      <option value="">Kategoriyani tanlang</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </SelectField>
                  </div>
                  <button type="button" onClick={() => setShowCatModal(true)} title="Yangi kategoriya ochish"
                    className="w-10 h-10 shrink-0 rounded-xl bg-[#151929] border border-white/8 flex items-center justify-center text-white/40 hover:text-[#3b82f6] hover:border-[#3b82f6]/40 transition-colors"><FolderPlus size={15} /></button>
                </div>
              </FormField>
            </div>

            <div className="rounded-xl border border-white/6 bg-[#151929]/50 p-3 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-[#6c63ff]/20 flex items-center justify-center shrink-0"><Star size={10} className="text-[#a89fff]" /></div>
                  <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">Asosiy Rasm</span>
                  {errors.image && <span className="text-[11px] text-[#ff6584] ml-2">{errors.image}</span>}
                </div>
                <ImageDropzone value={form.image} onChange={(v) => set("image", v)} />
              </div>
              <div className="border-t border-white/5" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-[#3b82f6]/20 flex items-center justify-center shrink-0"><ImagePlus size={10} className="text-[#93c5fd]" /></div>
                  <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">Galereya</span>
                  <span className="text-[10px] text-white/20 ml-auto">Maksimal 3 ta rasm</span>
                </div>
                <GalleryDropzone values={form.gallery} onChange={(v) => set("gallery", v)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-white/5">
            <button onClick={close} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/8 hover:text-white hover:bg-white/5 transition-colors">Bekor qilish</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#6c63ff] text-white hover:bg-[#5a52e0] disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[#6c63ff]/20">
              {saving ? "Saqlanmoqda…" : product ? "Saqlash" : "Qo'shish"}
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
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18 });
    gsap.fromTo(boxRef.current, { y: 24, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" });
  }, []);

  const close = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.15 });
    gsap.to(boxRef.current, { y: 12, opacity: 0, duration: 0.15, onComplete: onClose });
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
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
      <div ref={boxRef} className="w-full max-w-sm bg-[#1e2436] rounded-2xl border border-white/8 p-5 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#ff6584]/15 flex items-center justify-center shrink-0"><AlertTriangle size={20} className="text-[#ff6584]" /></div>
          <div>
            <h3 className="text-sm font-semibold text-white">Mahsulot o'chirilsinmi?</h3>
            <p className="text-xs text-white/35 mt-0.5">Bu amalni ortga qaytarib bo'lmaydi.</p>
          </div>
        </div>
        <p className="text-sm text-white/50 mb-5">Haqiqatdan ham <span className="text-white font-medium">"{product.name}"</span> mahsulotini o'chirmoqchimisiz?</p>
        <div className="flex gap-3">
          <button onClick={close} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/8 hover:text-white hover:bg-white/5 transition-colors">Olib qolish</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#ff6584] text-white hover:bg-[#e05070] disabled:opacity-50 transition-colors">
            {deleting ? "O'chirilmoqda…" : "O'chirish"}
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
    gsap.fromTo(ref.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", delay: index * 0.05 });
  }, [index]);

  const stock = Number(product.stock) || 0;
  const stockColor = stock === 0 ? "text-[#ff6584] bg-[#ff6584]/10" : stock < 10 ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10";
  const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
  const productImg = product.image_url || product.image;

  return (
    <div ref={ref} className="bg-[#1e2436] rounded-2xl border border-white/5 overflow-hidden flex items-stretch">
      <div className="w-20 shrink-0 bg-[#151929] relative">
        {productImg ? <img src={productImg} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-white/15" /></div>}
        {product.discount > 0 && <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-[#ff6584] text-white px-1.5 py-0.5 rounded-md">-{product.discount}%</span>}
      </div>
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white leading-tight truncate">{product.name}</p>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(product)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"><Edit2 size={13} /></button>
            <button onClick={() => onDelete(product)} className="p-1.5 rounded-lg text-white/30 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
        {product.category_id && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#6c63ff]/15 text-[#a89fff] font-medium">{categoryName(categories, product.category_id)}</span>}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-white">{formatPrice(finalPrice)}</span>
            {product.discount > 0 && <span className="text-[11px] text-white/30 line-through">{formatPrice(product.price)}</span>}
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${stockColor}`}>{stock === 0 ? "Tugagan" : `${stock}`}</span>
        </div>
      </div>
    </div>
  );
}

// ── Product row (desktop) ─────────────────────────────────────────────
function ProductRow({ product, categories, onEdit, onDelete, index }) {
  const rowRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(rowRef.current, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.28, ease: "power2.out", delay: index * 0.04 });
  }, [index]);

  const stock = Number(product.stock) || 0;
  const stockColor = stock === 0 ? "text-[#ff6584] bg-[#ff6584]/10" : stock < 10 ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10";
  const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
  const productImg = product.image_url || product.image;

  return (
    <tr ref={rowRef} className="border-b border-white/4 hover:bg-white/2 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {productImg ? <img src={productImg} alt={product.name} className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0" /> : <div className="w-9 h-9 rounded-lg bg-[#252b3b] flex items-center justify-center shrink-0 border border-white/5"><Package size={14} className="text-white/20" /></div>}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate max-w-40">{product.name}</p>
            {product.description && <p className="text-xs text-white/30 truncate max-w-40">{product.description}</p>}
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><span className="text-xs px-2.5 py-1 rounded-full bg-[#6c63ff]/15 text-[#a89fff] font-medium">{categoryName(categories, product.category_id)}</span></td>
      <td className="py-3 px-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-white tabular-nums">{formatPrice(finalPrice)}</span>
          {product.discount > 0 && (
            <>
              <span className="text-xs text-white/30 line-through tabular-nums">{formatPrice(product.price)}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ff6584]/15 text-[#ff6584] font-medium">-{product.discount}%</span>
            </>
          )}
        </div>
      </td>
      <td className="py-3 px-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stockColor}`}>{stock === 0 ? "Omborda yo'q" : `${stock} dona`}</span></td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(product)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(product)} className="p-1.5 rounded-lg text-white/30 hover:text-[#ff6584] hover:bg-[#ff6584]/10 transition-colors"><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );
}

// ── Asosiy AdminProducts Sahifasi ───────────────────────────────────
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeProduct, setActiveProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, catData] = await Promise.all([
          apiFetch("/products"),
          apiFetch("/categories")
        ]);

        // BackendApiResponse strukturasiga to'g'rilash (`.data` ichidan olish)
        const actualProducts = prodData.data || (Array.isArray(prodData) ? prodData : []);
        const actualCategories = catData.data || (Array.isArray(catData) ? catData : []);

        setProducts(actualProducts);
        setCategories(actualCategories);
      } catch (err) {
        setToast({ message: "Ma'lumot yuklashda xatolik: " + err.message, type: "error" });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategoryCreate = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
    setToast({ message: `"${newCat.name}" kategoriyasi qo'shildi!`, type: "success" });
  };

  const handleProductSave = (savedProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProduct.id ? savedProduct : p));
      }
      return [savedProduct, ...prev];
    });
    setToast({ message: "Mahsulot muvaffaqiyatli saqlandi! 🚀", type: "success" });
  };

  const handleProductDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setToast({ message: "Mahsulot o'chirildi! 🗑️", type: "success" });
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProducts = products.length;
  const outOfStock = products.filter((p) => Number(p.stock) === 0).length;
  const totalValue = products.reduce((sum, p) => sum + Number(p.price) * Number(p.stock), 0);

  if (loading) return <Spinner />;

  return (
    <div className="p-0 text-white">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Products Dashboard</h1>
          <p className="text-xs text-white/40 mt-0.5">Do'koningizdagi mahsulotlar va inventarlarni boshqaring</p>
        </div>
        <button onClick={() => { setActiveProduct(null); setShowProductModal(true); }}
          className="h-11 px-4 rounded-xl bg-[#6c63ff] hover:bg-[#5a52e0] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#6c63ff]/20 active:scale-95 transition-all">
          <Plus size={16} /> Mahsulot Qo'shish
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard label="Jami Mahsulotlar" value={totalProducts} icon={Package} color="bg-[#6c63ff]/20 text-[#a89fff]" />
        <StatCard label="Tugagan Mahsulotlar" value={outOfStock} icon={AlertTriangle} color="bg-[#ff6584]/20 text-[#ff6584]" />
        <StatCard label="Umumiy Qiymat" value={formatPrice(totalValue)} icon={DollarSign} color="bg-emerald-500/20 text-emerald-400" />
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input type="text" placeholder="Mahsulotlarni nomi bo'yicha qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#1e2436] border border-white/5 text-sm text-white placeholder-white/20 outline-none focus:border-[#6c63ff]/40 transition-colors" />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-[#1e2436] rounded-2xl border border-white/5">
          <Package size={32} className="text-white/10 mx-auto mb-2" />
          <p className="text-sm text-white/40">Mahsulot topilmadi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} categories={categories} index={idx}
                onEdit={(p) => { setActiveProduct(p); setShowProductModal(true); }} onDelete={(p) => setProductToDelete(p)} />
            ))}
          </div>

          <div className="hidden sm:block overflow-hidden bg-[#1e2436] rounded-2xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-white/30 uppercase tracking-wide bg-[#1a1f30]">
                  <th className="py-3 px-4">Mahsulot</th>
                  <th className="py-3 px-4">Kategoriya</th>
                  <th className="py-3 px-4">Narxi</th>
                  <th className="py-3 px-4">Soni</th>
                  <th className="py-3 px-4 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => (
                  <ProductRow key={product.id} product={product} categories={categories} index={idx}
                    onEdit={(p) => { setActiveProduct(p); setShowProductModal(true); }} onDelete={(p) => setProductToDelete(p)} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showProductModal && (
        <ProductModal
          product={activeProduct}
          categories={categories}
          onSave={handleProductSave}
          onClose={() => setShowProductModal(false)}
          onCategoryCreate={handleCategoryCreate}
        />
      )}

      {productToDelete && (
        <DeleteConfirm
          product={productToDelete}
          onConfirm={handleProductDelete}
          onClose={() => setProductToDelete(null)}
        />
      )}
    </div>
  );
}

export default AdminProducts;