import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreditCard from "../../components/account/CreditCard";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { getCurrentUser, logout } from "../../services/authService.js";

const AccountInformation = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const upcomingOrdersRef = useRef(null);
  const orderTableRef = useRef(null);
  const tableRowsRef = useRef([]);
  const mobileOrderCardsRef = useRef([]);
  const billingMethodsRef = useRef(null);
  const cardItemsRef = useRef([]);
  const [cards, setCards] = useLocalStorage("paymentCards");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0,
    );
    tl.fromTo(
      descriptionRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.2,
    );
    tl.fromTo(
      upcomingOrdersRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.4,
    );

    if (orderTableRef.current?.querySelector("thead")) {
      tl.fromTo(
        orderTableRef.current.querySelector("thead"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.5,
      );
    }

    if (tableRowsRef.current.length > 0) {
      tl.fromTo(
        tableRowsRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.15 },
        0.6,
      );
    }

    if (mobileOrderCardsRef.current.length > 0) {
      tl.fromTo(
        mobileOrderCardsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 },
        0.6,
      );
    }

    tl.fromTo(
      billingMethodsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.0,
    );

    tl.fromTo(
      cardItemsRef.current,
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.15 },
      1.2,
    );

    tableRowsRef.current.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        gsap.to(row, {
          backgroundColor: "#f5f5f5",
          duration: 0.3,
          ease: "power2.out",
        });
      });
      row.addEventListener("mouseleave", () => {
        gsap.to(row, {
          backgroundColor: "transparent",
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });

    mobileOrderCardsRef.current.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          y: -2,
          duration: 0.3,
          ease: "power2.out",
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });

    cardItemsRef.current.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          y: -4,
          duration: 0.3,
          ease: "power2.out",
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }, []);

  const orders = [
    {
      orderNo: "2133",
      item: "Double Bed & Dressing",
      date: "23.07.2021 (Expected)",
      trackingId: "2176413876",
      price: "$168.20",
    },
    {
      orderNo: "2133",
      item: "Double Bed & Dressing",
      date: "23.07.2021 (Expected)",
      trackingId: "2176413876",
      price: "$168.20",
    },
  ];

  return (
    <div ref={containerRef} className="w-full bg-white">
      <div className="w-full container mx-auto px-8 2xl:px-27 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Account Overview Section */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <div className="flex items-start justify-between">
            <div>
              <h1
                ref={titleRef}
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3"
              >
                Account Overview
              </h1>
              <p
                ref={descriptionRef}
                className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-3xl"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                diam nonummy nibh euismod tincidunt ut laoreet dolore magna
                aliquam erat volutpat.
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  }
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* User Info Card */}
          {user && (
            <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 w-fit">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-gray-600 shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
                {user.role && (
                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded mt-1 inline-block capitalize">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Billing Methods Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6">
            <h2
              ref={billingMethodsRef}
              className="text-lg sm:text-xl font-semibold text-gray-900"
            >
              Billing Methods
            </h2>
            <Link
              to="/account/billing"
              className="text-gray-900 text-xs sm:text-sm font-medium flex items-center gap-2 hover:text-gray-700 transition w-fit"
            >
              View All payment and Billing Methods
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cards?.map((card, index) => (
              <CreditCard
                key={card.id}
                card={card}
                index={index}
                cardItemsRef={cardItemsRef}
                type="non-editable"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInformation;
