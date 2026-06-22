import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import CreditCard from "../../components/account/CreditCard";
import AddCreditCard from "../../components/forms/AddCreditCard";
import axios from "axios";

const PaymentBilling = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const cardItemsRef = useRef([]);
  const addButtonRef = useRef(null);
  const modalBackdropRef = useRef(null);
  const modalContentRef = useRef(null);

  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Kartalarni backenddan yuklab olish
  const fetchCards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/payments/cards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const incomingCards = response.data && response.data.data;

      if (Array.isArray(incomingCards)) {
        setCards(incomingCards);
      } else {
        console.error("Kelgan ma'lumot kutilganidek massiv emas:", response.data);
        setCards([]);
      }
    } catch (error) {
      console.error("Kartalarni yuklashda xatolik:", error);
      setCards([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // GSAP Kirish va Hover animatsiyalari
  useEffect(() => {
    if (isLoading) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0);
    tl.fromTo(descriptionRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2);

    const validItems = cardItemsRef.current.filter((item) => item !== null);

    if (validItems.length > 0) {
      tl.fromTo(
        validItems,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 },
        0.4
      );
    }

    tl.fromTo(addButtonRef.current, { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.7 }, 0.8);

    // Hover hodisalarini boshqarish va tozalash muvozanati
    const cleanups = [];

    validItems.forEach((card) => {
      const enter = () => gsap.to(card, { boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)", y: -4, duration: 0.3 });
      const leave = () => gsap.to(card, { boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", y: 0, duration: 0.3 });
      
      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);
      
      cleanups.push(() => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [isLoading, cards]);

  // Modal ochilganda body scrollni to'xtatish
  useEffect(() => {
    if (showAddCardModal && modalBackdropRef.current) {
      gsap.to(modalBackdropRef.current, { opacity: 1, duration: 0.3 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showAddCardModal]);

  // Kartani o'chirish funksiyasi (DELETE)
  const handleDeleteCard = async (id) => {
    if (!window.confirm("Haqiqatdan ham ushbu kartani o'chirmoqchimisiz?")) return;
    
    setDeletingId(id);
    const cardIndex = cards.findIndex((card) => (card.id || card._id) === id);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/payments/cards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (cardIndex !== -1 && cardItemsRef.current[cardIndex]) {
        gsap.to(cardItemsRef.current[cardIndex], {
          opacity: 0,
          x: 100,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            // O'chirilgandan so'ng ro'yxatni yangilash uchun qayta yuklaymiz (yoki stateni filter qilamiz)
            fetchCards();
            setDeletingId(null);
          },
        });
      } else {
        fetchCards();
        setDeletingId(null);
      }
    } catch (error) {
      console.error("Kartani o'chirishda xatolik:", error);
      (error.response?.data?.message || "Kartani o'chirib bo'lmadi.");
      setDeletingId(null);
    }
  };

  // Kartani asosiy (Default) qilish funksiyasi (PUT)
  const handleSetDefault = async (id) => {
    const currentCard = cards.find((c) => (c.id || c._id) === id);
    const targetId = currentCard?.id || currentCard?._id || id;

    try {
      const token = localStorage.getItem("token");
      
      await axios.put(
        `http://localhost:5000/api/payments/cards/${targetId}/default`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend muvaffaqiyatli javob bergach, mahalliy stateni yangilaymiz
      setCards(cards.map((card) => ({
        ...card,
        isDefault: (card.id || card._id) === targetId,
      })));

    } catch (error) {
      console.error("Asosiy PUT so'rovida xatolik:", error);
      (error.response?.data?.message || "Kartani asosiy qilishda xatolik yuz berdi.");
    }
  };

  const handleAddNewCard = () => {
    gsap.fromTo(addButtonRef.current, { scale: 1 }, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    setShowAddCardModal(true);
  };

  const handleAddCardSubmit = () => {
    // Yangi karta qo'shilganda ro'yxat tartibini to'g'ri olish uchun bazadan qayta yuklaymiz
    fetchCards();
    gsap.to(modalBackdropRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => { setShowAddCardModal(false); },
    });
  };

  const handleCloseModal = () => {
    gsap.to(modalBackdropRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => { setShowAddCardModal(false); },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        <span className="ml-3 font-medium text-gray-500">Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-white">
      <div className="w-full mx-auto bg-white px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16 lg:py-20 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <h1 ref={titleRef} className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3">
            Payment Methods
          </h1>
          <p ref={descriptionRef} className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Manage your payment methods and card information securely. Add, edit, or remove cards as needed.
          </p>
        </div>

        {/* Cards Section */}
        <div className="mb-8">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10.325v2.838A2.25 2.25 0 005.25 15h13.5A2.25 2.25 0 0021 12.75v-2.838m-18 0V9a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 9v1.325m-18 0h18M5.25 15a3.75 3.75 0 01-3.75-3.75M15 6.75A3.75 3.75 0 1118.75 10.5" />
              </svg>
              <p className="text-gray-600 text-sm">No payment methods added yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cards.map((card, index) => (
                <div 
                  key={card.id || card._id || index} 
                  ref={(el) => { cardItemsRef.current[index] = el; }}
                >
                  <CreditCard
                    card={card}
                    index={index}
                    deletingId={deletingId}
                    handleSetDefault={handleSetDefault}
                    handleDeleteCard={handleDeleteCard}
                    type={'editable'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Card Button */}
        <button
          ref={addButtonRef}
          onClick={handleAddNewCard}
          className="w-full md:w-fit px-8 py-3 sm:py-4 bg-gray-900 text-white font-medium text-sm sm:text-base rounded-full hover:bg-gray-800 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Card
        </button>
      </div>

      {/* Modal Backdrop */}
      {showAddCardModal && (
        <div
          ref={modalBackdropRef}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 opacity-0 transition-opacity"
          style={{ pointerEvents: "auto" }}
          onClick={handleCloseModal}
        >
          <div ref={modalContentRef} className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <AddCreditCard
              isModal={true}
              onSubmit={handleAddCardSubmit}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentBilling;