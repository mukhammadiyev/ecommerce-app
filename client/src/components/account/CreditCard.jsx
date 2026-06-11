function CreditCard({
  card,
  ref,
  cardItemsRef,
  index,
  deletingId,
  handleSetDefault,
  handleDeleteCard,
  type,
}) {
  const getCardType = (number = "") => {
    const n = number.replace(/\s/g, "");
    if (/^4/.test(n)) return "VISA";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    if (/^6/.test(n)) return "Discover";
    return "Card";
  };

  if (type === "editable") {
    return (
      <div
        data-card-id={card.id}
        ref={(el) => {
          if (el) cardItemsRef.current[index] = el;
        }}
        className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white transition-shadow"
      >
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Card Details - Left Section */}
          <div className="flex-1 grid grid-cols-4 gap-4">
            {/* Card Number */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                Card Number
              </label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 shrink-0">
                  <div className="w-6 h-5 sm:w-8 sm:h-6 bg-gray-400 rounded-full"></div>
                  <div className="w-6 h-5 sm:w-8 sm:h-6 bg-gray-500 rounded-full"></div>
                </div>
                <input
                  type="text"
                  value={card.number}
                  readOnly
                  className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none"
                />
              </div>
            </div>

            {/* Name On Card */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                Name On Card
              </label>
              <input
                type="text"
                value={card.name}
                readOnly
                className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none"
              />
            </div>

            {/* CVC */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                CVC
              </label>
              <input
                type="text"
                value={card.cvc}
                readOnly
                className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-2 block">
                Expiry Date
              </label>
              <input
                type="text"
                value={card.expiry}
                readOnly
                className="text-xs sm:text-sm text-gray-900 font-medium bg-transparent border-b border-gray-200 pb-1 w-full focus:outline-none"
              />
            </div>
          </div>

          {/* Right Section - Default Badge & Actions */}
          <div className="flex items-center gap-4">
            {card.isDefault && (
              <span className="px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded whitespace-nowrap">
                Default
              </span>
            )}
            {!card.isDefault && (
              <button
                onClick={() => handleSetDefault(card.id)}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition whitespace-nowrap"
              >
                Set Default
              </button>
            )}
            <button
              onClick={() => handleDeleteCard(card.id)}
              disabled={deletingId === card.id}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition shrink-0 disabled:opacity-50"
              aria-label="Delete card"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-2 shrink-0">
              <div className="w-6 h-5 bg-gray-400 rounded-full"></div>
              <div className="w-6 h-5 bg-gray-500 rounded-full"></div>
            </div>
            <button
              onClick={() => handleDeleteCard(card.id)}
              disabled={deletingId === card.id}
              className="p-1 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
              aria-label="Delete card"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {/* Card Number */}
            <div>
              <label className="text-xs text-gray-600 font-medium">
                Card Number
              </label>
              <p className="text-sm text-gray-900 font-medium">{card.number}</p>
            </div>

            {/* Name On Card */}
            <div>
              <label className="text-xs text-gray-600 font-medium">
                Name On Card
              </label>
              <p className="text-sm text-gray-900 font-medium">{card.name}</p>
            </div>

            {/* CVC & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 font-medium">CVC</label>
                <p className="text-sm text-gray-900 font-medium">{card.cvc}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">
                  Expiry Date
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {card.expiry}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex gap-2">
            {card.isDefault && (
              <span className="px-3 py-2 bg-gray-700 text-white text-xs font-medium rounded flex-1 text-center">
                Default
              </span>
            )}
            {!card.isDefault && (
              <button
                onClick={() => handleSetDefault(card.id)}
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

  if (type === "non-editable") {
    const cardType = getCardType(card.number);

    return (
      <div
        data-card-id={card.id}
        ref={(el) => {
          if (el) cardItemsRef.current[index] = el;
        }}
        className="border relative border-gray-200 max-w-sm rounded-lg p-4 sm:p-5 bg-white flex flex-col items-start gap-4"
      >
        {/* Card logo circles */}
        <div className="flex shrink-0">
          <div className="w-7 h-6 bg-gray-400 rounded-full"></div>
          <div className="w-7 h-6 bg-gray-500 rounded-full -ml-2"></div>
        </div>

        {/* Card Number */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">Card Number</p>
          <p className="text-sm text-gray-900 font-semibold truncate">
            {card.number}
          </p>
        </div>

        {/* Cardholder Name */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">Name on Card</p>
          <p className="text-sm text-gray-900 font-semibold truncate">
            {card.name}
          </p>
        </div>

        {/* Card Type Badge */}
        <span className="absolute top-5 right-5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded shrink-0">
          {cardType}
        </span>
      </div>
    );
  }

  return null;
}

export default CreditCard;
