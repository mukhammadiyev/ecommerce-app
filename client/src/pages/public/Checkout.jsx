import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; 
import useCartStore from "../../hooks/useCartStore.js";

const STEPS = ["Personal", "Billing", "Confirmation"];

function CardIcon({ type }) {
  const isMaster = String(type).toLowerCase().includes("master");
  if (isMaster) {
    return (
      <div className="relative w-8 h-5 shrink-0">
        <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-red-500 opacity-90" />
        <div className="absolute left-3 top-0 w-5 h-5 rounded-full bg-amber-500 opacity-85" />
      </div>
    );
  }
  return (
    <div className="relative w-8 h-5 shrink-0">
      <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-blue-600 opacity-80" />
      <div className="absolute left-3 top-0 w-5 h-5 rounded-full bg-cyan-500 opacity-60" />
    </div>
  );
}

function Field({ label, id, type = "text", placeholder = "", value, onChange, error, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
        {label} <span className="text-red-400 ml-0.5">*</span>
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
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0
              ${state === "active" ? "bg-white text-gray-900" : state === "done" ? "bg-white text-gray-400" : "bg-gray-200 text-gray-400"}`}>
              {state === "done" ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4.2 7.5L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i + 1}
            </span>
            <span className="hidden xs:inline sm:inline">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PersonalForm({ data, onChange, errors }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <Field label="Full Name" id="name" value={data.name} onChange={onChange} error={errors.name} autoComplete="name" />
      </div>
      <Field label="Email Address" id="email" type="email" value={data.email} onChange={onChange} error={errors.email} autoComplete="email" />
      <Field label="Phone Number" id="phone" type="tel" placeholder="+998901234567" value={data.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
      <div className="sm:col-span-2">
        <Field label="Street Address" id="street" value={data.street} onChange={onChange} error={errors.street} autoComplete="street-address" />
      </div>
      <Field label="Town / City" id="city" value={data.city} onChange={onChange} error={errors.city} autoComplete="address-level2" />
      <Field label="Country" id="country" value={data.country} onChange={onChange} error={errors.country} autoComplete="country-name" />
      <div className="sm:col-span-2">
        <Field label="Postcode / Zip" id="postcode" value={data.postcode} onChange={onChange} error={errors.postcode} autoComplete="postal-code" />
      </div>
    </div>
  );
}

function BillingForm({ cards, selectedCardId, onSelectCard }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Billing Methods</h3>
      </div>
      <div className="space-y-3">
        {cards.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 italic">No saved cards found.</p>
            <p className="text-xs text-gray-400 mt-1">Please add a card in your profile section first.</p>
          </div>
        ) : (
          cards.map((card, index) => {
            const cardId = card.id || card._id;
            const selected = selectedCardId === cardId;
            const displayType = card.cardType || card.type || "Visa";
            const displayNumber = card.cardNumber || card.number || "•••• •••• •••• ••••";

            return (
              <div key={cardId || index} className="space-y-1.5">
                <p className="text-xs text-gray-500 capitalize">{displayType} {card.isDefault && "(Default)"}</p>
                <button
                  type="button"
                  onClick={() => onSelectCard(cardId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-full border-2 transition-all duration-200
                    ${selected ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <CardIcon type={displayType} />
                  <span className="text-sm text-gray-700 tracking-widest font-mono">{displayNumber}</span>
                  {selected && (
                    <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.2 5.8L6.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 🛠️ TANLANGAN KARTANI HAM TASDIQLASH OYNASIDA KO'RSATADIGAN QILINDI
function ConfirmationView({ personal, cards, selectedCardId }) {
  const selectedCard = cards.find(c => (c.id || c._id) === selectedCardId);

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 shrink-0">{label}</span>
      <span className="text-sm text-gray-700 text-right break-all">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-4 py-2.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Personal Details</span>
        </div>
        <div className="px-4 py-1">
          <Row label="Name" value={personal.name} />
          <Row label="Email" value={personal.email} />
          <Row label="Phone" value={personal.phone} />
          <Row label="Address" value={`${personal.street}, ${personal.city}, ${personal.country} ${personal.postcode}`} />
        </div>
      </div>

      {selectedCard && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <CardIcon type={selectedCard.cardType || selectedCard.type} />
            <span className="text-sm font-mono text-gray-700 tracking-wider">
              {selectedCard.cardNumber || selectedCard.number}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CartSummary({ items, shipping, couponCode, discountAmount }) {
  const getCleanPrice = (item) => {
    const rawPrice = item.product?.price || item.price || item.price_at_purchase || 0;
    return Number(String(rawPrice).replace(/[^0-9.]/g, "")) || 0;
  };

  const subtotal = Array.isArray(items) ? items.reduce((s, i) => s + (getCleanPrice(i) * Number(i.quantity || i.qty || 1)), 0) : 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
      <div className="bg-gray-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Cart Details</h2>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 pb-2 border-b border-gray-200 mb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center w-12">Qty</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-16">Subtotal</span>
        </div>
        <div className="divide-y divide-dashed divide-gray-200">
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item, index) => {
              const price = getCleanPrice(item);
              const itemQty = item.quantity || item.qty || 1;
              return (
                <div key={item.id || item._id || index} className="grid grid-cols-[1fr_auto_auto] gap-3 py-3 items-center">
                  <span className="text-sm text-gray-500 leading-snug">{item.product?.name || item.name || "Product"}</span>
                  <span className="text-sm text-gray-400 text-center w-12">{String(itemQty).padStart(2, "0")}</span>
                  <span className="text-sm font-medium text-gray-700 text-right w-16">${(price * itemQty).toFixed(2)}</span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-xs text-gray-400 italic">Your cart is empty</div>
          )}
        </div>
        <div className="mt-2 border-t border-gray-200">
          <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
            <span className="text-sm font-semibold text-gray-700">${subtotal.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200 bg-green-50/50 px-2 rounded-lg my-1">
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                Discount ({couponCode})
              </span>
              <span className="text-sm font-semibold text-green-600">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipping</span>
            <span className="text-sm font-semibold text-gray-700">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-bold text-gray-800">Total</span>
            <span className="text-base font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThankYouModal({ onClose, onCheckOrder }) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const checkRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.88, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, delay: 0.1, ease: "back.out(1.6)" });
    gsap.fromTo(checkRef.current, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, delay: 0.3, ease: "back.out(2)" });
  }, []);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div ref={cardRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md py-12 px-8 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        <div ref={checkRef} className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-6">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M7 15L12.5 21L23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you!</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">Your order has been confirmed &amp; it is on the way.</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto">
          <button onClick={onClose} className="px-7 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-all">Go to Homepage</button>
          <button onClick={onCheckOrder} className="px-7 py-3 bg-white text-gray-900 text-sm font-semibold rounded-full border-2 border-gray-900 hover:bg-gray-50 transition-all">Check Order Details</button>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const couponCode = location.state?.couponCode || "";
  const discountAmount = Number(location.state?.discountAmount) || 0;

  const cartItems = useCartStore((state) => state.items);
  const checkoutBackend = useCartStore((state) => state.checkoutCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const SHIPPING = Array.isArray(cartItems) && cartItems.length > 0 ? 100 : 0;
  
  const [personal, setPersonal] = useState({ name: "", email: "", phone: "", street: "", city: "", country: "", postcode: "" });
  const [personalErrors, setPersonalErrors] = useState({});
  const formRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchCart();

    const fetchCheckoutCards = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payments/cards", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const incomingCards = response.data && response.data.data;
        if (Array.isArray(incomingCards)) {
          setCards(incomingCards);
          const defaultCard = incomingCards.find((c) => c.isDefault) || incomingCards[0];
          if (defaultCard) setSelectedCardId(defaultCard.id || defaultCard._id);
        }
      } catch (error) {
        console.error("Kartalarni yuklashda xatolik:", error);
      }
    };
    
    fetchCheckoutCards();
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }, [fetchCart, navigate]);

  const handlePersonalChange = (id, val) => {
    setPersonal((p) => ({ ...p, [id]: val }));
    if (personalErrors[id]) setPersonalErrors((e) => ({ ...e, [id]: "" }));
  };

  const validatePersonal = () => {
    const errs = {};
    if (!personal.name.trim()) errs.name = "Required";
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

  // 🛠️ ANIMATSIYA SILLIQLASHTIRILDI VA SACHRASH BLOCKLANDI
  const goNext = async () => {
    if (loading) return;

    if (step === 0 && !validatePersonal()) {
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1,0.3)" });
      return;
    }
    if (step === 1 && !selectedCardId && cards.length > 0) {
      return;
    }
    
    if (step === 2) {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        ("Savat bo'sh, buyurtma bera olmaysiz!");
        return;
      }

      setLoading(true);
      const result = await checkoutBackend({
        shipping_address: `${personal.street}, ${personal.city}, ${personal.country}, ${personal.postcode}`,
        phone_number: personal.phone,
        coupon_code: couponCode
      });
      setLoading(false);

      if (result && (result.success || result.order_id || result.data)) {
        setShowModal(true);
      } else {
        ((result && result.message) || "Buyurtma berishda xatolik yuz berdi!");
      }
      return;
    }

    gsap.to(formRef.current, {
      opacity: 0,
      x: -24,
      duration: 0.2,
      onComplete: () => {
        setStep((s) => s + 1);
        gsap.fromTo(formRef.current, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" });
      }
    });
  };

  const goBack = () => {
    if (loading) return;
    gsap.to(formRef.current, {
      opacity: 0,
      x: 24,
      duration: 0.2,
      onComplete: () => {
        setStep((s) => s - 1);
        gsap.fromTo(formRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
      {showModal && <ThankYouModal onClose={() => { setShowModal(false); navigate("/"); }} onCheckOrder={() => { setShowModal(false); navigate("/orders"); }} />}
      <div ref={containerRef} className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-5 xl:gap-7 items-start">
          <div className="w-full lg:flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 pt-6 pb-6">
              <StepBar current={step} />
              <div ref={formRef}>
                {step === 0 && <PersonalForm data={personal} onChange={handlePersonalChange} errors={personalErrors} />}
                {step === 1 && <BillingForm cards={cards} selectedCardId={selectedCardId} onSelectCard={setSelectedCardId} />}
                {step === 2 && <ConfirmationView personal={personal} cards={cards} selectedCardId={selectedCardId} />}
              </div>
              <div className={`flex items-center mt-7 ${step > 0 ? "justify-between" : "justify-start"}`}>
                {step > 0 && (
                  <button onClick={goBack} disabled={loading} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 disabled:opacity-50">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg> Back
                  </button>
                )}
                <button onClick={goNext} disabled={loading} className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-700 disabled:opacity-50 ml-auto">
                  {step === 0 ? "Proceed to Next Step" : step === 1 ? "Review Order" : loading ? "Processing..." : "Place Order"}
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M4 2L10 7L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-80 xl:w-84 shrink-0">
            <CartSummary 
              items={cartItems} 
              shipping={SHIPPING} 
              couponCode={couponCode} 
              discountAmount={discountAmount} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}