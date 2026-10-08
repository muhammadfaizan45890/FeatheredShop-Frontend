/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import {
  Home,
  Building2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Star,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Truck,
  Lock,
  Info,
  Search,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import API from "@/utils/api";
import { getData } from "@/context/userContext";

/* ════════════════════════════════════════════════════════════
   CONFIG
   ════════════════════════════════════════════════════════════ */
const TOKEN_KEY = "accessToken";
const LS_ADDRESSES = "fs_checkout_addresses";
const CUSTOMER_KEY = "fs_checkout_customer";

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
];

/* ════════════════════════════════════════════════════════════
   HD CSS
   ════════════════════════════════════════════════════════════ */
const HD_CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Public+Sans:wght@400..800&display=swap");

  .ad-hd-root {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  }
  .ad-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0;
    letter-spacing: -0.02em;
  }
  .ad-num {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1, "kern" 1;
  }
  .ad-hd-root :focus-visible { outline: 2px solid #171717; outline-offset: 2px; }
  .dark .ad-hd-root :focus-visible { outline-color: #fafafa; }
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

const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

/* API instance with auth interceptor */
const getApiInstance = () => {
  const instance =
    API && typeof API.get === "function"
      ? API
      : axios.create({
          baseURL:
            (typeof import.meta !== "undefined" &&
              import.meta.env?.VITE_API_URL) ||
            "http://localhost:5000",
          headers: { "Content-Type": "application/json" },
        });
  if (!instance.__addressesAuthAttached) {
    instance.interceptors.request.use(
      (config) => {
        try {
          const token = getToken();
          if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch {}
        return config;
      },
      (error) => Promise.reject(error)
    );
    instance.__addressesAuthAttached = true;
  }
  return instance;
};
const api = getApiInstance();

/* Local id generator (for offline / guest mode) */
const localId = () =>
  `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/* ─── Validation ─── */
const validators = {
  line1: (v) =>
    !v?.trim()
      ? "Street address is required"
      : v.trim().length < 5
      ? "Address is too short"
      : null,
  city: (v) => (!v?.trim() ? "City is required" : null),
  province: (v) => (!v?.trim() ? "Province is required" : null),
  postalCode: (v) =>
    !v?.trim()
      ? "Postal code is required"
      : !/^\d{5}$/.test(v.trim())
      ? "Use a 5-digit code"
      : null,
};

const emptyForm = () => ({
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Pakistan",
  isDefault: false,
});

const LABEL_OPTIONS = [
  { value: "Home", icon: Home },
  { value: "Office", icon: Building2 },
  { value: "Other", icon: MapPin },
];

/* ════════════════════════════════════════════════════════════
   Address card
   ════════════════════════════════════════════════════════════ */
const AddressCard = memo(function AddressCard({
  addr,
  index,
  busy,
  onSetDefault,
  onEdit,
  onDelete,
}) {
  const reduceMotion = useReducedMotion();
  const labelMeta = LABEL_OPTIONS.find((l) => l.value === addr.label);
  const LabelIcon = labelMeta?.icon || MapPin;

  return (
    <motion.li
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.24) }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white p-4 transition-all dark:bg-neutral-900 sm:p-5 ${
        addr.isDefault
          ? "border-neutral-900 shadow-md dark:border-neutral-100"
          : "border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800/80 dark:hover:border-neutral-700"
      }`}
    >
      {/* Default ribbon */}
      {addr.isDefault && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-neutral-100 dark:text-neutral-900">
          <Star className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
          Default
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          <LabelIcon className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1 pr-16">
          <p className="text-[13.5px] font-bold text-neutral-900 dark:text-neutral-100">
            {addr.label || "Address"}
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            {addr.line2 ? "With apartment / suite" : "Standard address"}
          </p>
        </div>
      </div>

      {/* Body */}
      <address className="mt-4 flex-1 text-[12.5px] leading-relaxed not-italic text-neutral-600 dark:text-neutral-300">
        <span className="block font-medium text-neutral-900 dark:text-neutral-100">
          {addr.line1}
        </span>
        {addr.line2 && <span className="block">{addr.line2}</span>}
        <span className="block">
          {addr.city}, {addr.province} {addr.postalCode}
        </span>
        <span className="block text-neutral-500 dark:text-neutral-400">
          {addr.country || "Pakistan"}
        </span>
      </address>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        {!addr.isDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(addr)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
          >
            <Star className="h-3 w-3" strokeWidth={2.4} />
            Set default
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(addr)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <Pencil className="h-3 w-3" strokeWidth={2.4} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(addr)}
          disabled={busy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-3 w-3" strokeWidth={2.4} />
          Delete
        </button>
      </div>
    </motion.li>
  );
});

/* ════════════════════════════════════════════════════════════
   Address form (modal / inline)
   ════════════════════════════════════════════════════════════ */
const AddressFormModal = memo(function AddressFormModal({
  open,
  initial,
  onClose,
  onSave,
  busy,
}) {
  const [form, setForm] = useState(initial || emptyForm());
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial || emptyForm());
      setErrors({});
      setTouched({});
    }
  }, [open, initial]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    const e1 = validators.line1(form.line1);
    const e2 = validators.city(form.city);
    const e3 = validators.province(form.province);
    const e4 = validators.postalCode(form.postalCode);
    if (e1) errs.line1 = e1;
    if (e2) errs.city = e2;
    if (e3) errs.province = e3;
    if (e4) errs.postalCode = e4;
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched({
        line1: true,
        city: true,
        province: true,
        postalCode: true,
      });
      toast.error("Please fix the highlighted fields");
      return;
    }
    onSave({
      ...form,
      line1: form.line1.trim(),
      line2: (form.line2 || "").trim(),
      city: form.city.trim(),
      province: form.province,
      postalCode: form.postalCode.trim(),
    });
  };

  if (!open) return null;

  const inputBase =
    "w-full rounded-xl border bg-white px-3.5 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 transition-colors dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:text-[13.5px]";
  const inputCls = (err) =>
    `${inputBase} ${
      err
        ? "border-red-300 focus:border-red-500 dark:border-red-900/60"
        : "border-neutral-200 focus:border-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-100"
    }`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-neutral-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={busy ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 sm:rounded-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div>
            <h2 id="address-form-title" className="ad-serif text-lg font-medium text-neutral-900 dark:text-neutral-100 sm:text-xl">
              {initial && initial._id ? "Edit address" : "Add new address"}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-neutral-500 dark:text-neutral-400">
              Used to deliver your orders
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* Label chips */}
            <div className="mb-4">
              <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Label
              </p>
              <div className="flex flex-wrap gap-2">
                {LABEL_OPTIONS.map(({ value, icon: Icon }) => {
                  const active = form.label === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setField("label", value)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Street */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Street address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => setField("line1", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, line1: true }))}
                  placeholder="House 12, Street 5, Block A"
                  autoComplete="address-line1"
                  className={inputCls(touched.line1 && errors.line1)}
                />
                {touched.line1 && errors.line1 && (
                  <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                    {errors.line1}
                  </p>
                )}
              </div>

              {/* Apt */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Apartment, suite, etc.{" "}
                  <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => setField("line2", e.target.value)}
                  placeholder="Apartment 4B, Floor 3"
                  autoComplete="address-line2"
                  className={inputCls(false)}
                />
              </div>

              {/* City */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, city: true }))}
                  placeholder="Karachi"
                  autoComplete="address-level2"
                  className={inputCls(touched.city && errors.city)}
                />
                {touched.city && errors.city && (
                  <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Province */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.province}
                  onChange={(e) => setField("province", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, province: true }))}
                  autoComplete="address-level1"
                  className={`${inputCls(touched.province && errors.province)} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                  }}
                >
                  <option value="">Select province</option>
                  {PAKISTAN_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {touched.province && errors.province && (
                  <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                    {errors.province}
                  </p>
                )}
              </div>

              {/* Postal */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Postal code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.postalCode}
                  onChange={(e) =>
                    setField("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                  onBlur={() => setTouched((p) => ({ ...p, postalCode: true }))}
                  placeholder="75500"
                  autoComplete="postal-code"
                  maxLength={5}
                  className={`${inputCls(touched.postalCode && errors.postalCode)} ad-num`}
                />
                {touched.postalCode && errors.postalCode && (
                  <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                    {errors.postalCode}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Country
                </label>
                <input
                  type="text"
                  value="Pakistan"
                  disabled
                  className={`${inputCls(false)} cursor-not-allowed bg-neutral-50 text-neutral-500 dark:bg-neutral-950 dark:text-neutral-400`}
                />
              </div>
            </div>

            {/* Set default */}
            <label className="mt-5 flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 text-[12.5px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={!!form.isDefault}
                onChange={(e) => setField("isDefault", e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-950"
              />
              Make this my default shipping address
            </label>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {initial && initial._id ? "Save changes" : "Add address"}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   Confirm delete dialog
   ════════════════════════════════════════════════════════════ */
const ConfirmDialog = memo(function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-neutral-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={busy ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900 sm:rounded-2xl"
      >
        <h3 className="ad-serif text-xl font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   Empty state
   ════════════════════════════════════════════════════════════ */
const EmptyAddresses = memo(function EmptyAddresses({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-md rounded-3xl border border-dashed border-neutral-300 bg-white/70 px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900/50 sm:px-10 sm:py-16"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <MapPin className="h-7 w-7 text-neutral-400" strokeWidth={1.5} />
      </div>
      <h2 className="ad-serif text-2xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        No addresses yet
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
        Save your shipping addresses so checkout is faster next time.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="group mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-[13.5px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Add your first address
      </button>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════
   Skeleton
   ════════════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <li className="rounded-2xl border border-neutral-200/70 bg-white p-5 dark:border-neutral-800/70 dark:bg-neutral-900">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-3 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
    <div className="mt-5 space-y-2">
      <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
    </div>
    <div className="mt-5 flex gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
      <div className="h-7 w-24 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-7 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
    </div>
  </li>
);

/* ════════════════════════════════════════════════════════════
   Main
   ════════════════════════════════════════════════════════════ */
const Addresses = () => {
  const navigate = useNavigate();
  const { user: ctxUser } = getData();

  const currentUser = useMemo(() => {
    if (ctxUser) return ctxUser;
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [ctxUser]);

  const loggedIn = useMemo(() => !!getToken() && !!currentUser, [currentUser]);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [usingLocal, setUsingLocal] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [query, setQuery] = useState("");

  /* ─── Load addresses ─── */
  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);

    /* Guest or offline → local only */
    if (!loggedIn) {
      const local = readLS(LS_ADDRESSES, []);
      setAddresses(Array.isArray(local) ? local : []);
      setUsingLocal(true);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/checkout/addresses");
      const server = Array.isArray(res?.data?.data) ? res.data.data : [];
      /* Shape: { _id, address: {...}, isDefault } → flatten */
      const flat = server.map((a) => ({
        _id: a._id,
        label: a.address?.label || "Home",
        line1: a.address?.line1 || "",
        line2: a.address?.line2 || "",
        city: a.address?.city || "",
        province: a.address?.province || "",
        postalCode: a.address?.postalCode || "",
        country: a.address?.country || "Pakistan",
        isDefault: !!a.isDefault,
        _source: "server",
      }));
      setAddresses(flat);
      setUsingLocal(false);
    } catch (err) {
      /* Server unreachable or endpoint missing → local fallback */
      console.warn("Addresses fetch failed, using local:", err?.message);
      const local = readLS(LS_ADDRESSES, []);
      setAddresses(Array.isArray(local) ? local : []);
      setUsingLocal(true);
      if (err?.response?.status && err.response.status !== 404) {
        setError(err?.response?.data?.message || "Couldn't load addresses");
      }
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  /* ─── Save to local mirror so checkout can reuse it ─── */
  const persistLocalMirror = useCallback((list) => {
    const plain = list.map((a) => ({
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      province: a.province,
      postalCode: a.postalCode,
      country: a.country,
    }));
    writeLS(LS_ADDRESSES, plain.slice(0, 10));
  }, []);

  /* ─── Create ─── */
  const handleAdd = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  /* ─── Edit ─── */
  const handleEdit = useCallback((addr) => {
    setEditing(addr);
    setFormOpen(true);
  }, []);

  /* ─── Submit (create or update) ─── */
  const handleSave = useCallback(
    async (form) => {
      setBusy(true);
      try {
        if (loggedIn) {
          if (editing && editing._id && !String(editing._id).startsWith("local_")) {
            /* Update existing server address */
            const res = await api.patch(
              `/api/checkout/addresses/${editing._id}`,
              {
                address: {
                  line1: form.line1,
                  line2: form.line2,
                  city: form.city,
                  province: form.province,
                  postalCode: form.postalCode,
                  country: form.country,
                  label: form.label,
                },
                isDefault: !!form.isDefault,
              }
            );
            const updated = {
              _id: res.data?.data?._id || editing._id,
              label: form.label,
              line1: form.line1,
              line2: form.line2,
              city: form.city,
              province: form.province,
              postalCode: form.postalCode,
              country: form.country,
              isDefault: !!res.data?.data?.isDefault || !!form.isDefault,
              _source: "server",
            };
            setAddresses((prev) => {
              const next = prev.map((a) => (a._id === updated._id ? updated : a));
              /* If this one is default, unset others */
              return updated.isDefault
                ? next.map((a) => (a._id === updated._id ? a : { ...a, isDefault: false }))
                : next;
            });
            toast.success("Address updated");
          } else {
            /* Create new */
            const res = await api.post("/api/checkout/addresses", {
              address: {
                line1: form.line1,
                line2: form.line2,
                city: form.city,
                province: form.province,
                postalCode: form.postalCode,
                country: form.country,
                label: form.label,
              },
              isDefault: !!form.isDefault,
            });
            const created = {
              _id: res.data?.data?._id || localId(),
              label: form.label,
              line1: form.line1,
              line2: form.line2,
              city: form.city,
              province: form.province,
              postalCode: form.postalCode,
              country: form.country,
              isDefault: !!res.data?.data?.isDefault || !!form.isDefault,
              _source: "server",
            };
            setAddresses((prev) => {
              const next = [created, ...prev];
              return created.isDefault
                ? next.map((a) => (a._id === created._id ? a : { ...a, isDefault: false }))
                : next;
            });
            toast.success("Address added");
          }
        } else {
          /* Guest / offline — local only */
          setAddresses((prev) => {
            let next;
            if (editing && editing._id) {
              next = prev.map((a) =>
                a._id === editing._id ? { ...a, ...form } : a
              );
            } else {
              next = [{ ...form, _id: localId(), _source: "local" }, ...prev];
            }
            if (form.isDefault) {
              next = next.map((a) =>
                a.isDefault && a._id !== (editing?._id || next[0]._id)
                  ? { ...a, isDefault: false }
                  : a
              );
            }
            /* Ensure at least one default */
            if (!next.some((a) => a.isDefault) && next.length > 0) {
              next[0] = { ...next[0], isDefault: true };
            }
            persistLocalMirror(next);
            return next;
          });
          toast.success(editing && editing._id ? "Address updated" : "Address added");
        }

        setFormOpen(false);
        setEditing(null);
      } catch (err) {
        console.error("Address save failed:", err);
        toast.error(
          err?.response?.data?.message || "Couldn't save the address"
        );
      } finally {
        setBusy(false);
      }
    },
    [loggedIn, editing, persistLocalMirror]
  );

  /* ─── Set default ─── */
  const handleSetDefault = useCallback(
    async (addr) => {
      setBusy(true);
      try {
        if (loggedIn && addr._id && !String(addr._id).startsWith("local_")) {
          await api.patch(`/api/checkout/addresses/${addr._id}`, {
            isDefault: true,
          });
        }
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a._id === addr._id }))
        );
        if (!loggedIn) {
          persistLocalMirror(
            addresses.map((a) => ({ ...a, isDefault: a._id === addr._id }))
          );
        }
        toast.success("Default address updated");
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Couldn't set default address"
        );
      } finally {
        setBusy(false);
      }
    },
    [loggedIn, addresses, persistLocalMirror]
  );

  /* ─── Delete ─── */
  const handleDeleteConfirm = useCallback(async () => {
    const addr = confirmDelete;
    if (!addr) return;

    setBusy(true);
    try {
      if (loggedIn && addr._id && !String(addr._id).startsWith("local_")) {
        await api.delete(`/api/checkout/addresses/${addr._id}`);
      }
      setAddresses((prev) => {
        const next = prev.filter((a) => a._id !== addr._id);
        /* If we deleted the default, promote the first one */
        if (addr.isDefault && next.length > 0) {
          next[0] = { ...next[0], isDefault: true };
        }
        if (!loggedIn) persistLocalMirror(next);
        return next;
      });
      toast.success("Address deleted");
      setConfirmDelete(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't delete the address"
      );
    } finally {
      setBusy(false);
    }
  }, [confirmDelete, loggedIn, persistLocalMirror]);

  /* ─── Filter ─── */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return addresses;
    return addresses.filter(
      (a) =>
        (a.label || "").toLowerCase().includes(q) ||
        (a.line1 || "").toLowerCase().includes(q) ||
        (a.city || "").toLowerCase().includes(q) ||
        (a.postalCode || "").toLowerCase().includes(q)
    );
  }, [addresses, query]);

  const defaultCount = useMemo(
    () => addresses.filter((a) => a.isDefault).length,
    [addresses]
  );

  /* ─── Render ─── */
  return (
    <div className="ad-hd-root min-h-dvh bg-neutral-50/60 pb-16 dark:bg-neutral-950">
      <style>{HD_CSS}</style>

      {/* Breadcrumb */}
      <div className="border-b border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 sm:text-xs"
          >
            <Link to="/" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100">
              Home
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span aria-current="page" className="font-medium text-neutral-900 dark:text-neutral-100">
              Addresses
            </span>
          </nav>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 sm:text-[12px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
            Back to profile
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 md:px-8 lg:px-10 lg:pt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-zinc-900 dark:bg-white" />
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">
                Saved addresses
              </span>
            </div>
            <h1 className="ad-serif mt-3 text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
              My Addresses
            </h1>
            <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-400 sm:text-[13.5px]">
              {loading
                ? "Loading addresses…"
                : addresses.length === 0
                ? "No addresses saved yet"
                : `${addresses.length} address${
                    addresses.length === 1 ? "" : "s"
                  } · ${defaultCount} default`}
              {usingLocal && !loggedIn && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  <Info className="h-3 w-3" strokeWidth={2.5} />
                  Guest mode
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 self-start rounded-full bg-neutral-900 px-4 py-2.5 text-[12.5px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
            Add address
          </button>
        </div>

        {!loggedIn && !loading && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" strokeWidth={2.4} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-blue-900 dark:text-blue-200">
                Guest mode
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-blue-800/80 dark:text-blue-300/70">
                <Link
                  to="/login"
                  state={{ redirectTo: "/addresses" }}
                  className="font-semibold underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  Log in
                </Link>{" "}
                to save these addresses to your account across devices.
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 lg:px-10">
        {/* Search */}
        {addresses.length > 0 && (
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              strokeWidth={2.4}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by label, street, city…"
              aria-label="Search addresses"
              className="w-full rounded-full border border-neutral-200 bg-white pl-10 pr-10 py-2.5 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={2.4} />
            <div className="flex-1 text-[12.5px] text-amber-800 dark:text-amber-300">
              {error}
            </div>
            <button
              type="button"
              onClick={loadAddresses}
              className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </ul>
          ) : visible.length === 0 ? (
            addresses.length === 0 ? (
              <EmptyAddresses onAdd={handleAdd} />
            ) : (
              <div className="mx-auto max-w-md rounded-3xl border border-dashed border-neutral-300 bg-white/70 px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400">
                  No addresses match “{query}”.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[12.5px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Clear search
                </button>
              </div>
            )
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false}>
                {visible.map((addr, i) => (
                  <AddressCard
                    key={addr._id}
                    addr={addr}
                    index={i}
                    busy={busy}
                    onSetDefault={handleSetDefault}
                    onEdit={handleEdit}
                    onDelete={(a) => setConfirmDelete(a)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Trust strip */}
        {!loading && addresses.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Shield, label: "Encrypted storage" },
              { icon: Truck, label: "Same-day dispatch" },
              { icon: Lock, label: "Secure checkout" },
              { icon: MapPin, label: "Pakistan-wide delivery" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-2xl border border-neutral-200/70 bg-white p-3 text-[11.5px] font-semibold text-neutral-600 dark:border-neutral-800/70 dark:bg-neutral-900 dark:text-neutral-400"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {formOpen && (
          <AddressFormModal
            open
            initial={editing}
            onClose={() => {
              if (!busy) {
                setFormOpen(false);
                setEditing(null);
              }
            }}
            onSave={handleSave}
            busy={busy}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            open
            busy={busy}
            title="Delete this address?"
            message={`${confirmDelete.label || "Address"} — ${confirmDelete.line1}, ${confirmDelete.city}. This action cannot be undone.`}
            confirmLabel={busy ? "Deleting…" : "Yes, delete"}
            cancelLabel="Keep it"
            onConfirm={handleDeleteConfirm}
            onCancel={() => !busy && setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Addresses;