import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import CreditCard from "../../components/account/CreditCard";
import AddCreditCard from "../../components/forms/AddCreditCard";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const PaymentBilling = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const cardItemsRef = useRef([]);
  const addButtonRef = useRef(null);
  const modalBackdropRef = useRef(null);
  const modalContentRef = useRef(null);

  // Use localStorage for cards with default values
  const [cards, setCards] = useLocalStorage("paymentCards", [
    {
      id: 1,
      number: "2736 3286 8332 2138",
      name: "John Doe",
      cvc: "258",
      expiry: "10/26",
      isDefault: true,
      type: "visa",
    },
    {
      id: 2,
      number: "5425 2330 1010 3442",
      name: "John Doe",
      cvc: "258",
      expiry: "12/25",
      isDefault: false,
      type: "mastercard",
    },
  ]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    // Animate title
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0,
    );

    // Animate description
    tl.fromTo(
      descriptionRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.2,
    );

    // Animate card items with stagger
    if (cardItemsRef.current.length > 0) {
      tl.fromTo(
        cardItemsRef.current.filter((item) => item !== null),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 },
        0.4,
      );
    }

    // Animate add button
    tl.fromTo(
      addButtonRef.current,
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7 },
      0.8,
    );

    // Add hover animations for cards
    cardItemsRef.current.forEach((card) => {
      if (!card) return;

      const mouseenterHandler = () => {
        gsap.to(card, {
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
          y: -4,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const mouseleaveHandler = () => {
        gsap.to(card, {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      card.addEventListener("mouseenter", mouseenterHandler);
      card.addEventListener("mouseleave", mouseleaveHandler);

      return () => {
        card.removeEventListener("mouseenter", mouseenterHandler);
        card.removeEventListener("mouseleave", mouseleaveHandler);
      };
    });

    // Add button hover
    if (addButtonRef.current) {
      const mouseenterHandler = () => {
        gsap.to(addButtonRef.current, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const mouseleaveHandler = () => {
        gsap.to(addButtonRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      addButtonRef.current.addEventListener("mouseenter", mouseenterHandler);
      addButtonRef.current.addEventListener("mouseleave", mouseleaveHandler);

      return () => {
        addButtonRef.current?.removeEventListener(
          "mouseenter",
          mouseenterHandler,
        );
        addButtonRef.current?.removeEventListener(
          "mouseleave",
          mouseleaveHandler,
        );
      };
    }
  }, [cards.length]);

  // Modal animation effects
  useEffect(() => {
    if (showAddCardModal && modalBackdropRef.current) {
      gsap.to(modalBackdropRef.current, {
        opacity: 1,
        duration: 0.3,
        pointerEvents: "auto",
      });
    }
  }, [showAddCardModal]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (showAddCardModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddCardModal]);

  const handleDeleteCard = (id) => {
    setDeletingId(id);

    // Animate out the card being deleted
    const cardIndex = cards.findIndex((card) => card.id === id);
    if (cardIndex !== -1 && cardItemsRef.current[cardIndex]) {
      gsap.to(cardItemsRef.current[cardIndex], {
        opacity: 0,
        x: 100,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          const updatedCards = cards.filter((card) => card.id !== id);
          setCards(updatedCards);
          setDeletingId(null);
        },
      });
    } else {
      const updatedCards = cards.filter((card) => card.id !== id);
      setCards(updatedCards);
      setDeletingId(null);
    }
  };

  const handleSetDefault = (id) => {
    const updatedCards = cards.map((card) => ({
      ...card,
      isDefault: card.id === id,
    }));
    setCards(updatedCards);

    // Animate the card that became default
    gsap.to(cardItemsRef.current, {
      duration: 0.3,
    });
  };

  const handleAddNewCard = () => {
    gsap.fromTo(
      addButtonRef.current,
      { scale: 1 },
      { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 },
    );
    setShowAddCardModal(true);
  };

  const handleAddCardSubmit = (newCard) => {
    // Add new card to the list (automatically saved to localStorage)
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);

    // Close modal with animation
    gsap.to(modalBackdropRef.current, {
      opacity: 0,
      duration: 0.3,
      pointerEvents: "none",
      onComplete: () => {
        setShowAddCardModal(false);
      },
    });

    // Show success animation on new card
    setTimeout(() => {
      const newCardElement =
        cardItemsRef.current[cardItemsRef.current.length - 1];
      if (newCardElement) {
        gsap.fromTo(
          newCardElement,
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out" },
        );
      }
    }, 300);
  };

  const handleCloseModal = () => {
    gsap.to(modalBackdropRef.current, {
      opacity: 0,
      duration: 0.3,
      pointerEvents: "none",
      onComplete: () => {
        setShowAddCardModal(false);
      },
    });
  };

  return (
    <div ref={containerRef} className="w-full bg-white">
      <div className="w-full mx-auto bg-white px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 md:py-16 lg:py-20 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <h1
            ref={titleRef}
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3"
          >
            Payment Methods
          </h1>
          <p
            ref={descriptionRef}
            className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-3xl"
          >
            Manage your payment methods and card information securely. Add,
            edit, or remove cards as needed.
          </p>
        </div>

        {/* Cards Section */}
        <div className="mb-8">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10.325v2.838A2.25 2.25 0 005.25 15h13.5A2.25 2.25 0 0021 12.75v-2.838m-18 0V9a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 9v1.325m-18 0h18M5.25 15a3.75 3.75 0 01-3.75-3.75M15 6.75A3.75 3.75 0 1118.75 10.5"
                />
              </svg>
              <p className="text-gray-600 text-sm">
                No payment methods added yet
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cards.map((card, index) => (
                <CreditCard
                  key={card.id}
                  card={card}
                  index={index}
                  cardItemsRef={cardItemsRef}
									deletingId={deletingId}
									handleSetDefault={handleSetDefault}
									handleDeleteCard={handleDeleteCard }
									type={'editable'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add New Card Button */}
        <button
          ref={addButtonRef}
          onClick={handleAddNewCard}
          className="w-full md:w-fit px-8 py-3 sm:py-4 bg-gray-900 text-white font-medium text-sm sm:text-base rounded-full hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Card
        </button>
      </div>

      {/* Modal Backdrop */}
      {showAddCardModal && (
        <div
          ref={modalBackdropRef}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-120 opacity-0 pointer-events-none"
          onClick={handleCloseModal}
        >
          <div
            ref={modalContentRef}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
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
