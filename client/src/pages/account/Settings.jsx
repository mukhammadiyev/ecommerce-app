import gsap from "gsap";
import { useEffect, useRef } from "react";

const Settings = () => {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const profileSectionRef = useRef(null);
  const passwordSectionRef = useRef(null);
  const addressSectionRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7 },
      0,
    );
    tl.fromTo(
      descRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.7 },
      0.15,
    );
    tl.fromTo(
      profileSectionRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 },
      0.3,
    );
    tl.fromTo(
      passwordSectionRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 },
      0.45,
    );
    tl.fromTo(
      addressSectionRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 },
      0.6,
    );
    tl.fromTo(
      buttonRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.75,
    );

    // Input focus micro-interactions
    const inputs = document.querySelectorAll(".settings-input");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        gsap.to(input, { scale: 1.01, duration: 0.2, ease: "power2.out" });
      });
      input.addEventListener("blur", () => {
        gsap.to(input, { scale: 1, duration: 0.2, ease: "power2.out" });
      });
    });

    // Save button hover
    const btn = buttonRef.current;
    const onEnter = () =>
      gsap.to(btn, { scale: 1.02, duration: 0.2, ease: "power2.out" });
    const onLeave = () =>
      gsap.to(btn, { scale: 1, duration: 0.2, ease: "power2.out" });
    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("mouseleave", onLeave);

    return () => {
      btn.removeEventListener("mouseenter", onEnter);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const inputClass =
    "settings-input w-full px-4 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition";

  const textareaClass =
    "settings-input w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition resize-none";

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="w-full container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-27 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h1
            ref={titleRef}
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3"
          >
            Account Settings
          </h1>
          <p
            ref={descRef}
            className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-2xl"
          >
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat.
          </p>
        </div>

        {/* Profile Information */}
        <div ref={profileSectionRef} className="mb-8 sm:mb-10">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 sm:mb-5">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium pl-1">
                First name
              </label>
              <input type="text" defaultValue="Peter" className={inputClass} />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium pl-1">
                Last name
              </label>
              <input type="text" defaultValue="Ducker" className={inputClass} />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium pl-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="peterducker312@gmail.com"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium pl-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  {/* US flag placeholder */}
                  <span className="text-base leading-none">🇺🇸</span>
                  <span className="text-sm text-gray-500">(+1)</span>
                  <span className="text-gray-300 text-sm">-</span>
                </div>
                <input
                  type="tel"
                  defaultValue="234 - 687215421"
                  className={`${inputClass} pl-24`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-8 sm:mb-10" />

        {/* Change Password */}
        <div ref={passwordSectionRef} className="mb-8 sm:mb-10">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 sm:mb-5">
            Change Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium pl-1">
                New Password
              </label>
              <input
                type="password"
                defaultValue="placeholder"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium pl-1">
                Confirm New Password
              </label>
              <input
                type="password"
                defaultValue="placeholder"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-8 sm:mb-10" />

        {/* Address */}
        <div ref={addressSectionRef} className="mb-8 sm:mb-10">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 sm:mb-5">
            Address
          </h2>
          <div className="flex flex-col gap-4">
            {/* Shipping Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-600 font-medium pl-1">
                Shipping address
              </label>
              <textarea
                rows={3}
                placeholder="Your address"
                className={textareaClass}
              />
            </div>

            {/* State & Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600 font-medium pl-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Your state"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-600 font-medium pl-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  placeholder="Your zip code"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            ref={buttonRef}
            className="w-full sm:w-72 bg-gray-900 text-white text-sm font-medium py-4 rounded-full hover:bg-gray-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
