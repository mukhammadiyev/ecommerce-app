import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const AddCreditCard = ({ onSubmit, onCancel, isModal = false }) => {
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const formGroupsRef = useRef([]);
  const submitButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const match = cleaned.match(/(\d{0,4})/g);
    return match ? match.join(" ").trim() : "";
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const isValidCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, "");
    return /^\d{13,19}$/.test(cleaned);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!isValidCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = "Card number must be 13-19 digits";
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    } else if (formData.cardholderName.trim().length < 3) {
      newErrors.cardholderName = "Name must be at least 3 characters";
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = "Expiry date is required";
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(formData.expiryYear, 10);
      const expiryMonth = parseInt(formData.expiryMonth, 10);

      if (expiryMonth < 1 || expiryMonth > 12) {
        newErrors.expiry = "Month must be between 01-12";
      } else if (
        expiryYear < currentYear ||
        (expiryYear === currentYear && expiryMonth < currentMonth)
      ) {
        newErrors.expiry = "Card has expired";
      }
    }

    if (!formData.cvc.trim()) {
      newErrors.cvc = "CVC is required";
    } else if (!/^\d{3,4}$/.test(formData.cvc.trim())) {
      newErrors.cvc = "CVC must be 3-4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🛠️ TUZATILDI: State yangilanishi va ExpiryDate oqimi to'g'rilandi
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiryDate") {
      formattedValue = formatExpiry(value);
      const parts = formattedValue.split("/");
      
      setFormData((prev) => ({
        ...prev,
        expiryMonth: parts[0] || "",
        expiryYear: parts[1] || "",
      }));
    } else if (name === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "cardholderName") {
      formattedValue = value.replace(/[0-9]/g, "");
    }

    if (name !== "expiryDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    gsap.to(submitButtonRef.current, {
      scale: 0.95,
      duration: 0.2,
    });

    try {
      const token = localStorage.getItem("token"); 

      const response = await axios.post(
        "http://localhost:5000/api/payments/cards", 
        {
          number: formData.cardNumber.replace(/\s/g, ""), 
          name: formData.cardholderName,
          expiry: `${formData.expiryMonth}/${formData.expiryYear}`,
          cvc: formData.cvc,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      gsap.to(submitButtonRef.current, { scale: 1, duration: 0.2 });
      
      if (response.data && response.data.data) {
        onSubmit(response.data.data); 
      }
    } catch (error) {
      console.error("Karta qo'shishda xatolik:", error);
      gsap.to(submitButtonRef.current, { scale: 1, duration: 0.2 });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (isModal) {
      tl.fromTo(formRef.current, { opacity: 0, scale: 0.95, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.6 }, 0);
    }

    tl.fromTo(titleRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, isModal ? 0.1 : 0);

    if (formGroupsRef.current.length > 0) {
      tl.fromTo(
        formGroupsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
        isModal ? 0.2 : 0.1
      );
    }

    tl.fromTo([submitButtonRef.current, cancelButtonRef.current], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, isModal ? 0.5 : 0.4);
  }, [isModal]);

  const expiryDisplay =
    formData.expiryMonth || formData.expiryYear ? `${formData.expiryMonth}/${formData.expiryYear}` : "";

  return (
    <div ref={formRef} className={isModal ? "bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full" : "w-full bg-white"}>
      <div className={!isModal ? "w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16 lg:py-20 max-w-2xl" : ""}>
        <h1 ref={titleRef} className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Add Credit Card
        </h1>
        <p className="text-gray-600 text-sm mb-6">Enter your card details below</p>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Card Number */}
          <div ref={(el) => { if (el) formGroupsRef.current[0] = el; }} className="border-2 border-gray-300 rounded-lg p-4 sm:p-5 bg-white transition-all focus-within:border-blue-500 focus-within:bg-blue-50">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Card Number</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 shrink-0">
                <div className="w-7 h-5 sm:w-9 sm:h-6 bg-gray-500 rounded-full"></div>
                <div className="w-7 h-5 sm:w-9 sm:h-6 bg-gray-700 rounded-full"></div>
              </div>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="flex-1 text-sm sm:text-base font-medium text-gray-900 bg-transparent border-b-2 border-gray-400 pb-2 focus:outline-none focus:border-blue-500 transition placeholder-gray-400"
              />
            </div>
            {errors.cardNumber && touched.cardNumber && <p className="text-red-500 text-xs sm:text-sm mt-3 font-medium">{errors.cardNumber}</p>}
          </div>

          {/* Cardholder Name */}
          <div ref={(el) => { if (el) formGroupsRef.current[1] = el; }} className="border-2 border-gray-300 rounded-lg p-4 sm:p-5 bg-white transition-all focus-within:border-blue-500 focus-within:bg-blue-50">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Cardholder Name</label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              className="w-full text-sm sm:text-base text-gray-900 bg-transparent border-b-2 border-gray-400 pb-2 focus:outline-none focus:border-blue-500 transition placeholder-gray-400"
            />
            {errors.cardholderName && touched.cardholderName && <p className="text-red-500 text-xs sm:text-sm mt-3 font-medium">{errors.cardholderName}</p>}
          </div>

          {/* Expiry Date & CVC */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div ref={(el) => { if (el) formGroupsRef.current[2] = el; }} className="border-2 border-gray-300 rounded-lg p-4 sm:p-5 bg-white transition-all focus-within:border-blue-500 focus-within:bg-blue-50">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={expiryDisplay}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="MM/YY"
                maxLength="5"
                className="w-full text-sm sm:text-base text-gray-900 bg-transparent border-b-2 border-gray-400 pb-2 focus:outline-none focus:border-blue-500 transition placeholder-gray-400"
              />
              {/* 🛠️ TUZATILDI: Expiry xatosi ko'rinishi uchun touched.expiryDate qo'yildi */}
              {errors.expiry && touched.expiryDate && <p className="text-red-500 text-xs sm:text-sm mt-3 font-medium">{errors.expiry}</p>}
            </div>

            <div ref={(el) => { if (el) formGroupsRef.current[3] = el; }} className="border-2 border-gray-300 rounded-lg p-4 sm:p-5 bg-white transition-all focus-within:border-blue-500 focus-within:bg-blue-50">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">CVC</label>
              <input
                type="text"
                name="cvc"
                value={formData.cvc}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="123"
                maxLength="4"
                className="w-full text-sm sm:text-base text-gray-900 bg-transparent border-b-2 border-gray-400 pb-2 focus:outline-none focus:border-blue-500 transition placeholder-gray-400"
              />
              {errors.cvc && touched.cvc && <p className="text-red-500 text-xs sm:text-sm mt-3 font-medium">{errors.cvc}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className={`flex gap-3 sm:gap-4 ${isModal ? "pt-4" : "pt-6"}`}>
            <button type="button" onClick={onCancel} ref={cancelButtonRef} className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 font-medium text-sm sm:text-base rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" ref={submitButtonRef} disabled={isSubmitting} className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
              {isSubmitting ? "Adding..." : "Add Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCreditCard;