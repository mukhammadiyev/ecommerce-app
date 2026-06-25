import React from "react";

function CreditCard({
  card,
  deletingId,
  handleSetDefault,
  handleDeleteCard,
  type,
}) {
  // Karta raqamiga qarab brendni aniqlash
  const getCardType = (number = "") => {
    const n = String(number).replace(/\s/g, "");
    if (/^4/.test(n)) return "VISA";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    if (/^6/.test(n)) return "Discover";
    return "Card";
  };

  const cardType = getCardType(card.number || card.cardNumber);

  // Karta brendiga qarab dinamik aylanalar (logotip) render qilish
  const renderCardLogo = (brand) => {
    if (brand === "Mastercard") {
      return (
        <div className="flex shrink-0 relative w-8 h-5 items-center">
          <div className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
          <div className="w-5 h-5 rounded-full bg-amber-500 opacity-85 -ml-2.5" />
        </div>
      );
    }
    if (brand === "VISA") {
      return (
        <div className="flex shrink-0 relative w-8 h-5 items-center">
          <div className="w-5 h-5 rounded-full bg-blue-600 opacity-80" />
          <div className="w-5 h-5 rounded-full bg-cyan-400 opacity-70 -ml-2.5" />
        </div>
      );
    }
    // Boshqa kartalar uchun universal kulrang aylanalar
    return (
      <div className="flex shrink-0 relative w-8 h-5 items-center">
        <div className="w-5 h-5 rounded-full bg-gray-400" />
        <div className="w-5 h-5 rounded-full bg-gray-500 -ml-2.5" />
      </div>
    );
  };

  const currentId = card.id || card._id;

  // ==========================================
  // 1. EDITABLE MODE (Profil yoki Sozlamalar uchun)
  // ==========================================
  if (type === "editable") {
    return (
      <div
        data-card-id={currentId}
        className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white transition-shadow hover:shadow-sm"
      >
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-4 gap-4">
            {/* Card Number */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">
                Card Number
              </label>
              <div className="flex items-center gap-3">
                {renderCardLogo(cardType)}
                <input
                  type="text"
                  value={card.number || card.cardNumber || ""}
                  readOnly
                  className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Name On Card */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">
                Name On Card
              </label>
              <input
                type="text"
                value={card.name || card.cardName || ""}
                readOnly
                className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none"
              />
            </div>

            {/* CVC */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">
                CVC
              </label>
              <input
                type="text"
                value={card.cvc || "•••"}
                readOnly
                className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none font-mono"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wider">
                Expiry Date
              </label>
              <input
                type="text"
                value={card.expiry || card.expiryDate || ""}
                readOnly
                className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-4">
            {card.isDefault ? (
              <span className="px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded whitespace-nowrap uppercase tracking-wider">
                Default
              </span>
            ) : (
              <button

                type="button"
                aria-label="set default card"
                onClick={() => handleSetDefault && handleSetDefault(currentId)}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition whitespace-nowrap"
              >
                Set Default
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDeleteCard && handleDeleteCard(currentId)}
              disabled={deletingId === currentId}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition shrink-0 disabled:opacity-50"
              aria-label="Delete card"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-start justify-between mb-4">
            {renderCardLogo(cardType)}
            <button
              type="button"
              onClick={() => handleDeleteCard && handleDeleteCard(currentId)}
              disabled={deletingId === currentId}
              className="p-1 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
              aria-label="Delete card"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 font-medium block">Card Number</label>
              <p className="text-sm text-gray-900 font-semibold font-mono">{card.number || card.cardNumber}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium block">Name On Card</label>
              <p className="text-sm text-gray-900 font-semibold">{card.name || card.cardName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-medium block">CVC</label>
                <p className="text-sm text-gray-900 font-semibold font-mono">{card.cvc || "•••"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block">Expiry Date</label>
                <p className="text-sm text-gray-900 font-semibold font-mono">{card.expiry || card.expiryDate}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {card.isDefault ? (
              <span className="px-3 py-2 bg-gray-800 text-white text-xs font-semibold rounded flex-1 text-center uppercase tracking-wider">
                Default
              </span>
            ) : (
              <button
                type="button"
                aria-label="set default card"
                onClick={() => handleSetDefault && handleSetDefault(currentId)}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition flex-1"
              >
                Set Default
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. NON-EDITABLE MODE (Checkout sahifasi uchun)
  // ==========================================
  if (type === "non-editable") {
    return (
      <div
        data-card-id={currentId}
        className="border relative border-gray-200 w-full max-w-sm rounded-xl p-4 sm:p-5 bg-white flex flex-col items-start gap-4 shadow-sm hover:border-gray-300 transition-colors"
      >
        {/* Dinamik logotip */}
        {renderCardLogo(cardType)}

        {/* Card Number */}
        <div className="flex-1 min-w-0 w-full">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Card Number</p>
          <p className="text-sm text-gray-900 font-bold font-mono tracking-wide mt-0.5">
            {card.number || card.cardNumber}
          </p>
        </div>

        {/* Cardholder Name */}
        <div className="flex-1 min-w-0 w-full">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Name on Card</p>
          <p className="text-sm text-gray-800 font-semibold truncate mt-0.5">
            {card.name || card.cardName}
          </p>
        </div>

        {/* Card Type Badge */}
        <span className="absolute top-4 right-4 px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded uppercase tracking-wider">
          {cardType}
        </span>
      </div>
    );
  }

  return null;
}

export default CreditCard;