import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Sahifani yo'naltirish uchun
import useCartStore from "../../hooks/useCartStore.js"; // 🚀 Zustand store yo'lini loyihangga moslab ol

const SAVED_CARDS = [
  {
    id: "mc1",
    type: "Mastercard",
    label: "Mastercard (Default)",
    number: "2736 3286 8332 2138",
    isDefault: true,
  },
  {
    id: "visa1",
    type: "Visa",
    label: "Visa Card",
    number: "2736 3286 8332 2138",
    isDefault: false,
  },
];

const STEPS = ["Personal", "Billing", "Confirmation"];

// ── Card type icon ──
function CardIcon({ type }) {
  if (type === "Mastercard") {
    return (
      <div className="relative w-8 h-5 shrink-0">
        <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-gray-500 opacity-90" />
        <div className="absolute left-3 top-0 w-5 h-5 rounded-full bg-gray-400 opacity-70" />
      </div>
    );
  }
  return (
    <div className="relative w-8 h-5 shrink-0">
      <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-gray-600 opacity-80" />
      <div className="absolute left-3 top-0 w-5 h-5 rounded-full bg-gray-400 opacity-60" />
    </div>
  );
}

// ── Reusable input field ──
function Field({
  label,
  id,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  autoComplete,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-gray-600 tracking-wide uppercase"
      >
        {label}
        <span className="text-red-400 ml-0.5">*</span>
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-gray-800 placeholder-gray-300
          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-150
          ${error ? "border-red-400 bg-red-50/30" : "border-gray-200 hover:border-gray-300"}`}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ── Step bar ──
function StepBar({ current }) {
  return (
    <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-gray-200 mb-7">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "idle";
        return (
          <div
            key={label}
            className={`flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors duration-300
              ${state === "active" ? "bg-gray-800 text-white" : state === "done" ? "bg-gray-100 text-gray-500" : "bg-white text-gray-400"}
              ${i < STEPS.length - 1 ? "border-r border-gray-200" : ""}`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0
              ${state === "active" ? "bg-white text-gray-900" : state === "done" ? "bg-white text-gray-400" : "bg-gray-200 text-gray-400"}`}
            >
              {state === "done" ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5L4.2 7.5L8 3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className="hidden xs:inline sm:inline">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Personal form ──
function PersonalForm({ data, onChange, errors }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field
        label="First Name"
        id="firstName"
        value={data.firstName}
        onChange={onChange}
        error={errors.firstName}
        autoComplete="given-name"
      />
      <Field
        label="Last Name"
        id="lastName"
        value={data.lastName}
        onChange={onChange}
        error={errors.lastName}
        autoComplete="family-name"
      />
      <Field
        label="Email Address"
        id="email"
        type="email"
        value={data.email}
        onChange={onChange}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Phone Number"
        id="phone"
        type="tel"
        value={data.phone}
        onChange={onChange}
        error={errors.phone}
        autoComplete="tel"
      />
      <div className="sm:col-span-2">
        <Field
          label="Street Address"
          id="street"
          value={data.street}
          onChange={onChange}
          error={errors.street}
          autoComplete="street-address"
        />
      </div>
      <Field
        label="Town / City"
        id="city"
        value={data.city}
        onChange={onChange}
        error={errors.city}
        autoComplete="address-level2"
      />
      <Field
        label="Country"
        id="country"
        value={data.country}
        onChange={onChange}
        error={errors.country}
        autoComplete="country-name"
      />
      <div className="sm:col-span-2">
        <Field
          label="Postcode / Zip"
          id="postcode"
          value={data.postcode}
          onChange={onChange}
          error={errors.postcode}
          autoComplete="postal-code"
        />
      </div>
    </div>
  );
}

// ── Billing form ──
function BillingForm({
  selectedCardId,
  onSelectCard,
  useNewCard,
  onToggleNewCard,
  newCard,
  onNewCardChange,
  newCardErrors,
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Billing Methods</h3>
        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors duration-150">
          View All payment and Billing Methods
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4 2L8 6L4 10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {SAVED_CARDS.map((card) => {
          const selected = !useNewCard && selectedCardId === card.id;
          return (
            <div key={card.id} className="space-y-1.5">
              <p className="text-xs text-gray-500">{card.label}</p>
              <button
                onClick={() => onSelectCard(card.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full border-2 transition-all duration-200
                  ${selected ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <CardIcon type={card.type} />
                <span className="text-sm text-gray-700 tracking-widest font-mono">
                  {card.number}
                </span>
                {selected && (
                  <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1.5 4L3.2 5.8L6.5 2.5"
                        stroke="white"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or use a new card</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={onToggleNewCard}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200
          ${useNewCard ? "border-gray-900 bg-gray-50" : "border-dashed border-gray-300 bg-white hover:border-gray-400"}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
            ${useNewCard ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2V12M2 7H12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Add new card</span>
        </div>
        {useNewCard && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7L5.5 10.5L12 3.5"
              stroke="#111827"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {useNewCard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <Field
            label="Cardholder Name"
            id="cardName"
            value={newCard.cardName}
            onChange={onNewCardChange}
            error={newCardErrors.cardName}
            autoComplete="cc-name"
          />
          <Field
            label="Card Number"
            id="cardNumber"
            placeholder="•••• •••• •••• ••••"
            value={newCard.cardNumber}
            onChange={onNewCardChange}
            error={newCardErrors.cardNumber}
            autoComplete="cc-number"
          />
          <Field
            label="Expiry Date"
            id="expiry"
            placeholder="MM / YY"
            value={newCard.expiry}
            onChange={onNewCardChange}
            error={newCardErrors.expiry}
            autoComplete="cc-exp"
          />
          <Field
            label="CVV"
            id="cvv"
            placeholder="•••"
            value={newCard.cvv}
            onChange={onNewCardChange}
            error={newCardErrors.cvv}
            autoComplete="cc-csc"
          />
        </div>
      )}
    </div>
  );
}

// ── Confirmation view ──
function ConfirmationView({ personal, selectedCardId, useNewCard, newCard }) {
  const card = SAVED_CARDS.find((c) => c.id === selectedCardId);
  const Row = ({ label, value }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-700 text-right break-all">
        {value || "—"}
      </span>
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-4 py-2.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Personal Details
          </span>
        </div>
        <div className="px-4 py-1">
          <Row
            label="Name"
            value={`${personal.firstName} ${personal.lastName}`}
          />
          <Row label="Email" value={personal.email} />
          <Row label="Phone" value={personal.phone} />
          <Row
            label="Address"
            value={`${personal.street}, ${personal.city}, ${personal.country} ${personal.postcode}`}
          />
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-4 py-2.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Payment
          </span>
        </div>
        <div className="px-4 py-1">
          {useNewCard ? (
            <>
              <Row label="Cardholder" value={newCard.cardName} />
              <Row
                label="Card"
                value={
                  newCard.cardNumber
                    ? `•••• •••• •••• ${newCard.cardNumber.replace(/\s/g, "").slice(-4)}`
                    : ""
                }
              />
            </>
          ) : card ? (
            <>
              <Row label="Card Type" value={card.label} />
              <Row
                label="Card"
                value={`•••• •••• •••• ${card.number.slice(-4)}`}
              />
            </>
          ) : (
            <Row label="Card" value="No card selected" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Cart summary sidebar ──
function CartSummary({ items, shipping }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0); // 🚀 qty o'rniga quantity qilindi
  const total = subtotal + shipping;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
      <div className="bg-gray-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Cart Details
        </h2>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 pb-2 border-b border-gray-200 mb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Product
          </span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-12">
            Qty
          </span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-16">
            Subtotal
          </span>
        </div>
        <div className="divide-y divide-dashed divide-gray-200">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_auto_auto] gap-3 py-3 items-center"
            >
              <span className="text-sm text-gray-500 leading-snug">
                {item.name}
              </span>
              <span className="text-sm text-gray-400 text-center w-12">
                {String(item.quantity).padStart(2, "0")} {/* 🚀 quantity qo'llandi */}
              </span>
              <span className="text-sm font-medium text-gray-700 text-right w-16">
                ${item.price}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t border-gray-200">
          <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Subtotal
            </span>
            <span className="text-sm font-semibold text-gray-700">
              ${subtotal}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Shipping
            </span>
            <span className="text-sm font-semibold text-gray-700">
              ${shipping}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-bold text-gray-800">Total</span>
            <span className="text-base font-bold text-gray-900">${total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Thank You modal ──
function ThankYouModal({ onClose, onCheckOrder }) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const checkRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" },
    );
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.88, y: 24 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.45,
        delay: 0.1,
        ease: "back.out(1.6)",
      },
    );
    gsap.fromTo(
      checkRef.current,
      { scale: 0, rotation: -20 },
      { scale: 1, rotation: 0, duration: 0.5, delay: 0.3, ease: "back.out(2)" },
    );
  }, []);

  const handleClose = (target) => {
    if (target === "overlay") {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: onClose,
      });
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose("overlay")}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div
        ref={cardRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md py-12 px-8 flex flex-col items-center text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div
          ref={checkRef}
          className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-6"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path
              d="M7 15L12.5 21L23 9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you!</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
          Your order has been confirmed &amp; it is on the way. Check your email
          for the details
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-7 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 active:scale-95 transition-all duration-200"
          >
            Go to Homepage
          </button>
          <button
            onClick={onCheckOrder}
            className="flex-1 sm:flex-none px-7 py-3 bg-white text-gray-900 text-sm font-semibold rounded-full border-2 border-gray-900 hover:bg-gray-50 active:scale-95 transition-all duration-200"
          >
            Check Order Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Checkout Component ──
export default function Checkout() {
  const navigate = useNavigate();
  
  // 🚀 Zustand do'konidan real ma'lumotlar va checkout funksiyasini yuklaymiz
  const cartItems = useCartStore((state) => state.items);
  const checkoutBackend = useCartStore((state) => state.checkout);

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // Backend so'rovi ketayotgan paytdagi loader holati

  // Dinamik hisob-kitoblar uchun shipping narxi
  const SHIPPING = cartItems.length > 0 ? 100 : 0;

  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    country: "",
    postcode: "",
  });

  const [selectedCardId, setSelectedCardId] = useState(
    SAVED_CARDS.find((c) => c.isDefault)?.id || SAVED_CARDS[0]?.id,
  );
  const [useNewCard, setUseNewCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [newCardErrors, setNewCardErrors] = useState({});
  const [personalErrors, setPersonalErrors] = useState({});

  const formRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    );
  }, []);

  const animateStepIn = (dir = 1) => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: dir * 36 },
      { opacity: 1, x: 0, duration: 0.36, ease: "power2.out" },
    );
  };

  const handlePersonalChange = (id, val) => {
    setPersonal((p) => ({ ...p, [id]: val }));
    if (personalErrors[id]) setPersonalErrors((e) => ({ ...e, [id]: "" }));
  };
  const handleNewCardChange = (id, val) => {
    setNewCard((c) => ({ ...c, [id]: val }));
    if (newCardErrors[id]) setNewCardErrors((e) => ({ ...e, [id]: "" }));
  };
  const handleSelectCard = (id) => {
    setSelectedCardId(id);
    setUseNewCard(false);
  };
  const handleToggleNewCard = () => {
    setUseNewCard((v) => !v);
    if (!useNewCard) setSelectedCardId(null);
    else
      setSelectedCardId(
        SAVED_CARDS.find((c) => c.isDefault)?.id || SAVED_CARDS[0]?.id,
      );
  };

  const validatePersonal = () => {
    const errs = {};
    if (!personal.firstName.trim()) errs.firstName = "Required";
    if (!personal.lastName.trim()) errs.lastName = "Required";
    if (!personal.email.trim()) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(personal.email)) errs.email = "Invalid email";
    if (!personal.phone.trim()) errs.phone = "Required";
    if (!personal.street.trim()) errs.street = "Required";
    if (!personal.city.trim()) errs.city = "Required";
    if (!personal.country.trim()) errs.country = "Required";
    if (!personal.postcode.trim()) errs.postcode = "Required";
    setPersonalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateBilling = () => {
    if (!useNewCard) return true;
    const errs = {};
    if (!newCard.cardName.trim()) errs.cardName = "Required";
    if (!newCard.cardNumber.trim()) errs.cardNumber = "Required";
    else if (newCard.cardNumber.replace(/\s/g, "").length < 16)
      errs.cardNumber = "Enter full card number";
    if (!newCard.expiry.trim()) errs.expiry = "Required";
    if (!newCard.cvv.trim()) errs.cvv = "Required";
    else if (newCard.cvv.length < 3) errs.cvv = "Invalid CVV";
    setNewCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // 🚀 Keyingi qadamga o'tish yoki buyurtmani backend'ga yuborish mantiqi
  const goNext = async () => {
    if (step === 0 && !validatePersonal()) {
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1,0.3)" });
      return;
    }
    if (step === 1 && !validateBilling()) {
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1,0.3)" });
      return;
    }
    
    // 🔥 UCHINCHI QADAM: Haqiqiy buyurtma berish (Place Order) bosqichi
    if (step === 2) {
      if (cartItems.length === 0) {
        alert("Savat bo'sh, buyurtma bera olmaysiz!");
        return;
      }

      setLoading(true);

      // Zustand store orqali backend'ga so'rov yuboramiz
      const result = await checkoutBackend({
        shipping_address: `${personal.street}, ${personal.city}, ${personal.country}`,
        phone_number: personal.phone,
      });

      setLoading(false);

      if (result.success) {
        setShowModal(true); // "Thank You" modal oynasini ko'rsatamiz
      } else {
        alert(result.message || "Buyurtma berishda xatolik yuz berdi!");
      }
      return;
    }

    setStep((s) => s + 1);
    setTimeout(() => animateStepIn(1), 10);
  };

  const goBack = () => {
    setStep((s) => s - 1);
    setTimeout(() => animateStepIn(-1), 10);
  };

  const ctaLabel =
    step === 0
      ? "Proceed to Next Step"
      : step === 1
        ? "Review Order"
        : loading
          ? "Processing..."
          : "Place Order";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
      {/* Thank You modal */}
      {showModal && (
        <ThankYouModal
          onClose={() => {
            setShowModal(false);
            navigate("/"); // Bosh sahifaga qaytarish
          }}
          onCheckOrder={() => {
            setShowModal(false); 
            navigate("/orders"); // Buyurtmalar ro'yxati sahifasiga o'tkazish
          }}
        />
      )}

      <div ref={containerRef} className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-5 xl:gap-7 items-start">
          
          {/* ── Form panel ── */}
          <div className="w-full lg:flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 pt-6 pb-6">
              <StepBar current={step} />

              <div ref={formRef}>
                {step === 0 && (
                  <PersonalForm
                    data={personal}
                    onChange={handlePersonalChange}
                    errors={personalErrors}
                  />
                )}
                {step === 1 && (
                  <BillingForm
                    selectedCardId={selectedCardId}
                    onSelectCard={handleSelectCard}
                    useNewCard={useNewCard}
                    onToggleNewCard={handleToggleNewCard}
                    newCard={newCard}
                    onNewCardChange={handleNewCardChange}
                    newCardErrors={newCardErrors}
                  />
                )}
                {step === 2 && (
                  <ConfirmationView
                    personal={personal}
                    selectedCardId={selectedCardId}
                    useNewCard={useNewCard}
                    newCard={newCard}
                  />
                )}
              </div>

              {/* Actions */}
              <div className={`flex items-center mt-7 ${step > 0 ? "justify-between" : "justify-start"}`}>
                {step > 0 && (
                  <button
                    onClick={goBack}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors duration-150 disabled:opacity-50"
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M10 12L6 8L10 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back
                  </button>
                )}
                <button
                  onClick={goNext}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-700 active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
                >
                  {ctaLabel}
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M4 2L10 7L4 12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Cart summary ── */}
          <div className="w-full lg:w-80 xl:w-84 shrink-0">
            {/* 🚀 Jonli ma'lumotlar bilan bog'landi */}
            <CartSummary items={cartItems} shipping={SHIPPING} />
          </div>
        </div>
      </div>
    </div>
  );
}