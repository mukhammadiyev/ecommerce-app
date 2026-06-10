import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

/* ── contact info items ── */
const INFO = [
  {
    label: "Phone Number",
    value: "0012334566",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
      </svg>
    ),
  },
  {
    label: "Email Address",
    value: "johndoe@example.com",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: "Location",
    value: "Lorem Ipsum",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

/* ── reusable input ── */
function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  textarea,
  error,
}) {
  const base = `w-full border rounded-xl px-4 py-3 text-sm text-[#1a1a2e] placeholder-gray-400
    outline-none transition-colors bg-white
    ${error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#1a1a2e]"}`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-gray-500 font-medium">{label}</label>
      )}
      {textarea ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={5}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={base}
        />
      )}
      {error && <p className="text-[11px] text-red-500 pl-1">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── refs ── */
  const pageRef = useRef(null);
  const accentRef = useRef(null);
  const headerRef = useRef(null);
  const cardRef = useRef(null);
  const infoItemsRef = useRef([]);
  const formColRef = useRef(null);

  /* ── entrance animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      /* accent line draws in */
      tl.fromTo(
        accentRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.5 },
      )

        /* header fades down */
        .fromTo(
          headerRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.2",
        )

        /* card slides up */
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.25",
        )

        /* info items stagger left */
        .fromTo(
          infoItemsRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 },
          "-=0.3",
        )

        /* form column fades in from right */
        .fromTo(
          formColRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5 },
          "-=0.35",
        );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.message.trim()) e.message = "Message cannot be empty.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      /* shake the form column */
      gsap.fromTo(
        formColRef.current,
        { x: -6 },
        { x: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" },
      );
      return;
    }
    setErrors({});
    setLoading(true);

    /* simulate send — replace with real API call */
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);

    /* success: scale-bounce the form column */
    gsap.fromTo(
      formColRef.current,
      { scale: 0.97 },
      { scale: 1, duration: 0.5, ease: "back.out(2)" },
    );
  };

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div ref={pageRef} className="bg-white min-h-screen font-oxygen">
      <div className="w-full container mx-auto px-5 sm:px-8 2xl:px-27 pt-14 sm:pb-20  pb-14 sm:pt-20 lg:pb-25">
        {/* ── page accent + section header ── */}
        <div className="flex flex-col items-center mb-10 sm:mb-14">
          <h1
            ref={headerRef}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a2e] text-center"
          >
            Contact Us
          </h1>
        </div>

        {/* ── main card ── */}
        <div
          ref={cardRef}
          className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* ── grey top bar ── */}
          <div className="bg-[#8a8a8a] px-6 sm:px-10 lg:px-12 py-5">
            <h2 className="text-white text-sm sm:text-base font-semibold tracking-wide">
              Get In Touch With Us
            </h2>
          </div>

          {/* ── two-column body ── */}
          <div className="flex flex-col lg:flex-row">
            {/* LEFT — contact info ── */}
            <div
              className="lg:w-[38%] xl:w-[36%] px-6 sm:px-10 lg:px-12 py-8 sm:py-10
              border-b border-gray-100 lg:border-b-0 lg:border-r lg:border-gray-100
              flex flex-col justify-between gap-8"
            >
              <div className="flex flex-col gap-0">
                {INFO.map((item, i) => (
                  <div key={i} ref={(el) => (infoItemsRef.current[i] = el)}>
                    <div className="flex items-start gap-3 py-5">
                      <span className="mt-0.5 text-[#1a1a2e] opacity-60 shrink-0">
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 font-medium uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p className="text-sm text-[#1a1a2e] font-medium">
                          {item.value}
                        </p>
                      </div>
                    </div>
                    {i < INFO.length - 1 && (
                      <div className="border-b border-gray-100" />
                    )}
                  </div>
                ))}
              </div>

              {/* social row — mobile/tablet only context helper */}
              <div className="hidden sm:flex lg:hidden items-center gap-3 pt-2">
                {["Twitter", "Instagram", "LinkedIn"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-xs text-gray-400 hover:text-[#1a1a2e] transition-colors underline underline-offset-2"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* RIGHT — message form ── */}
            <div
              ref={formColRef}
              className="flex-1 px-6 sm:px-10 lg:px-12 py-8 sm:py-10"
            >
              <h3 className="text-base sm:text-lg font-semibold text-[#1a1a2e] mb-1">
                Send us a message
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 sm:mb-8 max-w-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                fringilla nunc in molestie feugiat.
              </p>

              {sent ? (
                /* success state */
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#1a1a2e] flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#1a1a2e]">
                    Message sent!
                  </p>
                  <p className="text-xs text-gray-500">
                    We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="mt-2 text-xs text-[#1a1a2e] underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-4">
                    {/* name + email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        placeholder="Your Name"
                        value={form.name}
                        onChange={f("name")}
                        error={errors.name}
                      />
                      <Field
                        placeholder="Your E-mail"
                        type="email"
                        value={form.email}
                        onChange={f("email")}
                        error={errors.email}
                      />
                    </div>

                    {/* phone + subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        placeholder="Phone Number"
                        type="tel"
                        value={form.phone}
                        onChange={f("phone")}
                      />
                      <Field
                        placeholder="Subject"
                        value={form.subject}
                        onChange={f("subject")}
                      />
                    </div>

                    {/* message */}
                    <Field
                      placeholder="Message"
                      value={form.message}
                      onChange={f("message")}
                      textarea
                      error={errors.message}
                    />

                    {/* submit */}
                    <div className="flex items-center justify-start mt-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#1a1a2e] text-white text-sm font-semibold px-8 py-3 rounded-full
                          hover:bg-[#2d2d4e] active:scale-[0.98] transition-all
                          disabled:opacity-60 disabled:cursor-not-allowed
                          flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
