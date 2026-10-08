/* eslint-disable no-unused-vars */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import {
  Mail,
  Phone,
  Send,
  MessageSquare,
  MapPin,
  Clock,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  RotateCcw,
  HelpCircle,
  Headphones,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Heart,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import API from "../utils/api";

/* ════════════════════════════════════════════════════════════
   Config
   ════════════════════════════════════════════════════════════ */
const BRAND = "FeatheredSHOP";
const SUPPORT_EMAIL = "support@featheredshop.com";
const SALES_EMAIL = "sales@featheredshop.com";
const SUPPORT_PHONE = "+92 300 1234567";
const WHATSAPP_NUMBER = "923001234567";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20FeatheredSHOP%2C%20I%20need%20help`;
const X_URL = "https://x.com/feathered_pen";
const YOUTUBE_URL = "https://youtube.com/@featheredpen1";
const INSTAGRAM_URL = "#";
const FACEBOOK_URL = "#";

const MAX_MESSAGE = 1000;
const DRAFT_KEY = "fs_contact_draft";
const TOKEN_KEY = "accessToken";

/* Support hours: Mon–Fri 09:00–18:00 (PKT), Sat 10:00–16:00 */
const SUPPORT_HOURS = {
  0: null,
  1: [9, 18],
  2: [9, 18],
  3: [9, 18],
  4: [9, 18],
  5: [9, 18],
  6: [10, 16],
};

const QUICK_CHANNELS = [
  {
    id: "email",
    label: "Email us",
    sub: SUPPORT_EMAIL,
    Icon: Mail,
    href: `mailto:${SUPPORT_EMAIL}`,
    accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    id: "call",
    label: "Call support",
    sub: SUPPORT_PHONE,
    Icon: Phone,
    href: `tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`,
    accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    sub: "Fastest reply",
    Icon: FaWhatsapp,
    href: WHATSAPP_LINK,
    external: true,
    accent: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  },
  {
    id: "help",
    label: "Help center",
    sub: "FAQ & guides",
    Icon: HelpCircle,
    href: "/faq",
    internal: true,
    accent: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  },
];

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery is 2–4 business days across Pakistan. Express is 1–2 business days. You'll receive a tracking number by email as soon as your order ships.",
  },
  {
    q: "What's your return policy?",
    a: "You can return any unused item within 30 days of delivery. Start a return from your Orders page — we'll email you a prepaid label.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship across Pakistan only. International shipping is coming soon — sign up for our newsletter to be notified.",
  },
  {
    q: "How can I track my order?",
    a: "Visit My Orders from your account menu. Every order shows live status, tracking number, and estimated delivery date.",
  },
];

/* ════════════════════════════════════════════════════════════
   HD CSS
   ════════════════════════════════════════════════════════════ */
const HD_CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Public+Sans:wght@400..800&display=swap");

  .ct-hd-root {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }
  .ct-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0;
    letter-spacing: -0.02em;
  }
  .ct-num {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1, "kern" 1;
  }

  /* Global focus ring for buttons/links only */
  .ct-hd-root :focus-visible { outline: 2px solid #171717; outline-offset: 2px; }
  .dark .ct-hd-root :focus-visible { outline-color: #fafafa; }

  /* Inputs / textareas / selects get their own focus ring —
     strip the browser default and any leftover outline */
  .ct-hd-root input,
  .ct-hd-root textarea,
  .ct-hd-root select {
    outline: none;
  }
  .ct-hd-root input:focus,
  .ct-hd-root input:focus-visible,
  .ct-hd-root textarea:focus,
  .ct-hd-root textarea:focus-visible,
  .ct-hd-root select:focus,
  .ct-hd-root select:focus-visible {
    outline: none;
    outline-offset: 0;
    box-shadow: none;
  }
`;

/* ════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════ */
const readLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const writeLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
const removeLS = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {}
};

const getApiInstance = () => {
  const instance =
    API && typeof API.post === "function"
      ? API
      : axios.create({
          baseURL:
            (typeof import.meta !== "undefined" &&
              import.meta.env?.VITE_API_URL) ||
            "http://localhost:5000",
          headers: { "Content-Type": "application/json" },
        });
  if (!instance.__contactAuthAttached) {
    instance.interceptors.request.use(
      (config) => {
        try {
          const token = localStorage.getItem(TOKEN_KEY);
          if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch {}
        return config;
      },
      (error) => Promise.reject(error)
    );
    instance.__contactAuthAttached = true;
  }
  return instance;
};
const api = getApiInstance();

const validateEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim());

const validate = (f) => {
  const errs = {};
  if (!f.name.trim()) errs.name = "Name is required";
  else if (f.name.trim().length < 2) errs.name = "Name is too short";
  else if (f.name.trim().length > 80) errs.name = "Name is too long";

  if (!f.email.trim()) errs.email = "Email is required";
  else if (!validateEmail(f.email)) errs.email = "Enter a valid email";

  if (f.subject.trim().length > 120)
    errs.subject = "Subject must be under 120 characters";

  if (!f.message.trim()) errs.message = "Message is required";
  else if (f.message.trim().length < 10)
    errs.message = "Please write at least 10 characters";
  else if (f.message.length > MAX_MESSAGE)
    errs.message = `Keep it under ${MAX_MESSAGE} characters`;

  return errs;
};

const getSupportStatus = () => {
  const now = new Date();
  const day = now.getDay();
  const window = SUPPORT_HOURS[day];
  if (!window) {
    return { open: false, label: "Closed today · Opens Monday" };
  }
  const [start, end] = window;
  const h = now.getHours() + now.getMinutes() / 60;
  if (h < start) {
    return { open: false, label: `Opens at ${String(start).padStart(2, "0")}:00` };
  }
  if (h >= end) {
    return {
      open: false,
      label: `Closed · Opens ${day === 5 ? "Saturday" : "tomorrow"} at ${String(start).padStart(2, "0")}:00`,
    };
  }
  return { open: true, label: `Open now · Until ${String(end).padStart(2, "0")}:00` };
};

/* ════════════════════════════════════════════════════════════
   Small UI
   ════════════════════════════════════════════════════════════ */
const Card = ({ className = "", children, ...rest }) => (
  <div
    className={`rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900 ${className}`}
    {...rest}
  >
    {children}
  </div>
);

const Field = memo(function Field({
  id,
  label,
  required,
  error,
  hint,
  maxLength,
  value,
  children,
}) {
  const count = maxLength ? value?.length ?? 0 : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 sm:text-[12px]"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {maxLength && (
          <span
            className={`ct-num text-[10.5px] ${
              count > maxLength ? "text-red-600" : "text-neutral-400"
            }`}
          >
            {count}/{maxLength}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p
          role="alert"
          className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
});

const QuickChannel = memo(function QuickChannel({ channel }) {
  const { Icon, label, sub, href, external, internal, accent } = channel;
  const inner = (
    <>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[13px] font-bold text-neutral-900 dark:text-neutral-100">
          {label}
        </span>
        <span className="block truncate text-[11.5px] text-neutral-500 dark:text-neutral-400">
          {sub}
        </span>
      </span>
      <ExternalLink
        size={14}
        className="shrink-0 text-neutral-400"
        aria-hidden="true"
      />
    </>
  );

  const cls =
    "group flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900 dark:hover:border-neutral-700";

  if (internal)
    return (
      <Link to={href} className={cls}>
        {inner}
      </Link>
    );

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cls}
    >
      {inner}
    </a>
  );
});

const FAQItem = memo(function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="text-[13.5px] font-semibold text-neutral-900 dark:text-neutral-100">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.4}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="pb-4 pr-6 text-[12.5px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   Main
   ════════════════════════════════════════════════════════════ */
const Contact = () => {
  const reduceMotion = useReducedMotion();
  const formTopRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    const draft = readLS(DRAFT_KEY, null);
    return (
      draft || { name: "", email: "", subject: "", message: "" }
    );
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const supportStatus = useMemo(() => getSupportStatus(), []);

  /* ─── Page title ─── */
  useEffect(() => {
    const prev = document.title;
    document.title = "Contact us · FeatheredSHOP";
    return () => {
      document.title = prev;
    };
  }, []);

  /* ─── Draft autosave (debounced) ─── */
  useEffect(() => {
    if (submitted) return;
    const t = setTimeout(() => {
      const hasContent =
        formData.name || formData.email || formData.subject || formData.message;
      if (hasContent) writeLS(DRAFT_KEY, formData);
    }, 800);
    return () => clearTimeout(t);
  }, [formData, submitted]);

  /* ─── Handlers ─── */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      const errs = validate(formData);
      if (Object.keys(errs).length) {
        setErrors(errs);
        setTouched({
          name: true,
          email: true,
          subject: true,
          message: true,
        });
        toast.error("Please fix the highlighted fields");
        const firstId = Object.keys(errs)[0];
        setTimeout(() => document.getElementById(firstId)?.focus(), 50);
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await api.post("/api/contact", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        });

        if (res?.data?.success !== false) {
          toast.success(res?.data?.message || "Message sent!");
          setSubmitted(true);
          setFormData({ name: "", email: "", subject: "", message: "" });
          setTouched({});
          removeLS(DRAFT_KEY);
        } else {
          toast.error(res?.data?.message || "Couldn't send your message");
        }
      } catch (err) {
        console.error("Contact form error:", err);
        const msg =
          err?.response?.data?.message ||
          "Failed to send message. Please try again.";
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopiedEmail(true);
      toast.success("Email copied");
      setTimeout(() => setCopiedEmail(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  }, []);

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setTouched({});
    setTimeout(
      () => formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  }, []);

  const inputBase =
    "w-full rounded-xl border bg-white px-3.5 py-3 text-base text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:text-[13.5px]";
  const inputCls = (err) =>
    `${inputBase} ${
      err
        ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:border-red-900/60 dark:focus:ring-red-900/30"
        : "border-neutral-200 focus:border-neutral-400 focus:ring-neutral-100 dark:border-neutral-800 dark:focus:border-neutral-600 dark:focus:ring-neutral-800"
    }`;

  return (
    <div className="ct-hd-root min-h-dvh bg-neutral-50/60 pb-16 dark:bg-neutral-950">
      <style>{HD_CSS}</style>

      {/* Breadcrumb */}
      <div className="border-b border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 sm:text-xs"
          >
            <Link
              to="/"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Home
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span
              aria-current="page"
              className="font-medium text-neutral-900 dark:text-neutral-100"
            >
              Contact
            </span>
          </nav>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 sm:text-[12px]"
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
            Continue shopping
          </Link>
        </div>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-7xl px-4 pt-10 text-center sm:px-6 sm:pt-14 md:px-8 lg:px-10 lg:pt-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-zinc-900 dark:bg-white" />
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">
              Get in touch
            </span>
            <span className="h-px w-8 bg-zinc-900 dark:bg-white" />
          </div>
          <h1 className="ct-serif mt-4 text-[clamp(2.2rem,1.6rem+2.6vw,3.8rem)] font-medium leading-[1.05] tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
            Let's talk.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-[15px]">
            Questions about an order, a return, or a brand partnership? We
            reply to every message within 24 hours.
          </p>

          {/* Live support status */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${
                supportStatus.open
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  supportStatus.open ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                }`}
              />
              {supportStatus.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
              <Lock className="h-3 w-3" strokeWidth={2.4} />
              Encrypted & private
            </span>
          </div>
        </motion.div>

        {/* Quick channels */}
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_CHANNELS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <QuickChannel channel={c} />
            </motion.div>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12 md:px-8 lg:px-10 lg:pt-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-8">
          {/* Form */}
          <section aria-labelledby="form-heading" ref={formTopRef} className="min-w-0">
            <Card className="overflow-hidden p-5 sm:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="py-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    >
                      <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} />
                    </motion.div>
                    <h2 className="ct-serif text-2xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-3xl">
                      Message sent
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
                      Thanks for reaching out. Our team will reply to your
                      email within 24 hours (usually much sooner).
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        <Send className="h-3.5 w-3.5" strokeWidth={2.4} />
                        Send another
                      </button>
                      <Link
                        to="/shop"
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[13px] font-bold text-white transition-all hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
                        Continue shopping
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2
                          id="form-heading"
                          className="ct-serif text-xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-2xl"
                        >
                          Send us a message
                        </h2>
                        <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
                          We reply within 24 hours.
                        </p>
                      </div>
                      <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 sm:inline-flex">
                        <Lock className="h-3 w-3" strokeWidth={2.6} />
                        Secure
                      </span>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="mt-6 grid gap-5 sm:grid-cols-2"
                      noValidate
                    >
                      <Field
                        id="name"
                        label="Full name"
                        required
                        error={touched.name && errors.name}
                        className="sm:col-span-1"
                      >
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Your full name"
                          aria-invalid={!!(touched.name && errors.name)}
                          className={inputCls(touched.name && errors.name)}
                        />
                      </Field>

                      <Field
                        id="email"
                        label="Email"
                        required
                        error={touched.email && errors.email}
                        className="sm:col-span-1"
                      >
                        <input
                          id="email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="you@example.com"
                          aria-invalid={!!(touched.email && errors.email)}
                          className={inputCls(touched.email && errors.email)}
                        />
                      </Field>

                      <Field
                        id="subject"
                        label="Subject"
                        hint="Optional — helps us route your message faster"
                        error={touched.subject && errors.subject}
                        className="sm:col-span-2"
                      >
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Order #FS-XSTFTO-405"
                          aria-invalid={!!(touched.subject && errors.subject)}
                          className={inputCls(touched.subject && errors.subject)}
                        />
                      </Field>

                      <Field
                        id="message"
                        label="Message"
                        required
                        error={touched.message && errors.message}
                        maxLength={MAX_MESSAGE}
                        value={formData.message}
                        className="sm:col-span-2"
                      >
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          placeholder="Tell us how we can help…"
                          aria-invalid={!!(touched.message && errors.message)}
                          className={`${inputCls(touched.message && errors.message)} resize-none`}
                        />
                      </Field>

                      <div className="sm:col-span-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-neutral-400">
                          Press{" "}
                          <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                            ⌘
                          </kbd>{" "}
                          +{" "}
                          <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
                            Enter
                          </kbd>{" "}
                          to send
                        </p>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-[13.5px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                              Sending…
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" strokeWidth={2.4} />
                              Send message
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* FAQ */}
            <Card className="mt-6 p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  <HelpCircle className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div>
                  <h3 className="ct-serif text-lg font-medium text-neutral-900 dark:text-neutral-100 sm:text-xl">
                    Frequently asked questions
                  </h3>
                  <p className="mt-0.5 text-[12px] text-neutral-500 dark:text-neutral-400">
                    Quick answers before you write to us.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {FAQS.map((faq, i) => (
                  <FAQItem
                    key={i}
                    q={faq.q}
                    a={faq.a}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq((cur) => (cur === i ? null : i))}
                  />
                ))}
              </div>
            </Card>
          </section>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Email + copy */}
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  <Mail className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Email us
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="truncate text-[13.5px] font-semibold text-neutral-900 hover:underline dark:text-neutral-100"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label="Copy email"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                    >
                      {copiedEmail ? (
                        <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                      ) : (
                        <Copy className="h-3 w-3" strokeWidth={2.4} />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    Support · replies within 24 hours
                  </p>
                </div>
              </div>
            </Card>

            {/* Phone + hours */}
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Phone className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Call us
                  </p>
                  <a
                    href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                    className="mt-1 block text-[13.5px] font-semibold text-neutral-900 hover:underline dark:text-neutral-100"
                  >
                    {SUPPORT_PHONE}
                  </a>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    <Clock className="h-3 w-3" strokeWidth={2.4} />
                    Mon–Fri 9am–6pm · Sat 10am–4pm
                  </div>
                </div>
              </div>
            </Card>

            {/* WhatsApp */}
            <Card className="overflow-hidden">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300">
                  <FaWhatsapp size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    WhatsApp
                  </p>
                  <p className="mt-1 text-[13.5px] font-semibold text-neutral-900 dark:text-neutral-100">
                    Chat with us
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-neutral-500 dark:text-neutral-400">
                    Fastest reply — usually within 1 hour
                  </p>
                </div>
                <ExternalLink
                  className="h-4 w-4 shrink-0 text-neutral-400"
                  strokeWidth={2.4}
                />
              </a>
            </Card>

            {/* Social */}
            <Card className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Follow FeatheredSHOP
              </p>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[
                  { href: FACEBOOK_URL, Icon: FaFacebookF, label: "Facebook", hover: "hover:bg-blue-600 hover:text-white" },
                  { href: X_URL, Icon: FaXTwitter, label: "X (Twitter)", hover: "hover:bg-black hover:text-white" },
                  { href: INSTAGRAM_URL, Icon: FaInstagram, label: "Instagram", hover: "hover:bg-pink-600 hover:text-white" },
                  { href: YOUTUBE_URL, Icon: FaYoutube, label: "YouTube", hover: "hover:bg-red-600 hover:text-white" },
                  { href: WHATSAPP_LINK, Icon: FaWhatsapp, label: "WhatsApp", hover: "hover:bg-green-600 hover:text-white", external: true },
                ].map(({ href, Icon, label, hover, external }) => (
                  <a
                    key={label}
                    href={href}
                    {...(external || href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    aria-label={label}
                    title={label}
                    className={`flex h-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors hover:border-transparent dark:border-neutral-700 dark:text-neutral-300 ${hover}`}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </Card>

            {/* Quick links */}
            <Card className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Quick links
              </p>
              <ul className="mt-3 space-y-1">
                {[
                  { to: "/orders", label: "Track my order", Icon: ShoppingBag },
                  { to: "/addresses", label: "Manage addresses", Icon: MapPin },
                  { to: "/returns", label: "Return an item", Icon: RotateCcw },
                  { to: "/wishlist", label: "My wishlist", Icon: Heart },
                ].map(({ to, label, Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2.4} />
                      <span className="flex-1">{label}</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-neutral-300"
                        strokeWidth={2.4}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Response promise */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <Sparkles size={14} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-amber-900 dark:text-amber-200">
                    Our promise
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                    Every message is read by a real person on our team — no bots, no
                    templates. We reply within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Contact;