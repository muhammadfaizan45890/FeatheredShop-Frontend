// /* eslint-disable no-unused-vars */
// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { createPortal } from "react-dom";
// import { Link, useSearchParams } from "react-router-dom";
// import { toast } from "sonner";
// import axios from "axios";
// import {
//   ArrowLeft,
//   Search,
//   X,
//   ChevronRight,
//   ChevronLeft,
//   ChevronUp,
//   ChevronDown,
//   RefreshCw,
//   Download,
//   Package,
//   Truck,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   AlertCircle,
//   Loader2,
//   Copy,
//   Check,
//   Trash2,
//   Mail,
//   Phone,
//   MapPin,
//   User,
//   CreditCard,
//   Banknote,
//   Wallet,
//   TrendingUp,
//   ShoppingBag,
//   Save,
//   Printer,
//   MessageCircle,
//   WifiOff,
//   Command,
// } from "lucide-react";
// import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// import API from "@/utils/api";
// import { getData } from "@/context/userContext";

// /* ════════════════════════════════════════════════════════════
//    HD CSS
//    ════════════════════════════════════════════════════════════ */
// const HD_CSS = `
//   @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Public+Sans:wght@400..800&display=swap");

//   .ao-hd-root {
//     font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//     -webkit-font-smoothing: antialiased;
//     -moz-osx-font-smoothing: grayscale;
//     text-rendering: optimizeLegibility;
//     font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
//     -webkit-text-size-adjust: 100%;
//     -webkit-tap-highlight-color: transparent;
//   }
//   .ao-serif { font-family: 'Fraunces', 'Playfair Display', Georgia, serif; font-optical-sizing: auto; letter-spacing: -0.02em; }
//   .ao-num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "kern" 1; }
//   .ao-hd-root :focus-visible { outline: 2px solid #171717; outline-offset: 2px; }
//   .dark .ao-hd-root :focus-visible { outline-color: #fafafa; }
//   .ao-rail::-webkit-scrollbar { display: none; }
//   .ao-rail { scrollbar-width: none; -ms-overflow-style: none; }

//   .ao-skeleton {
//     background: linear-gradient(90deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.05) 100%);
//     background-size: 200% 100%;
//     animation: ao-shimmer 1.4s ease-in-out infinite;
//   }
//   .dark .ao-skeleton {
//     background: linear-gradient(90deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 100%);
//     background-size: 200% 100%;
//   }
//   @keyframes ao-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
//   @media (prefers-reduced-motion: reduce) { .ao-skeleton { animation: none; } }

//   /* Print: only the packing slip, portalled to <body> */
//   .ao-print-portal { display: none; }
//   @media print {
//     body > *:not(.ao-print-portal) { display: none !important; }
//     .ao-print-portal { display: block !important; color: #000; background: #fff; padding: 24px; font-size: 12px; }
//     .ao-print-portal table { width: 100%; border-collapse: collapse; }
//     .ao-print-portal th, .ao-print-portal td { border-bottom: 1px solid #ddd; padding: 6px 4px; text-align: left; }
//   }
// `;

// /* ════════════════════════════════════════════════════════════
//    Constants
//    ════════════════════════════════════════════════════════════ */
// const LS_ORDERS = "fs_orders";
// const LS_AUTO = "ao_auto_refresh";
// const PAGE_SIZES = [15, 30, 50, 100];
// const REFRESH_MS = 60000;

// const FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"];

// const STATUS_META = {
//   pending: { label: "Pending", Icon: Clock, bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50", dot: "bg-amber-500" },
//   confirmed: { label: "Confirmed", Icon: CheckCircle2, bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-900/50", dot: "bg-blue-500" },
//   processing: { label: "Processing", Icon: Package, bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-900/50", dot: "bg-violet-500" },
//   shipped: { label: "Shipped", Icon: Truck, bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-900/50", dot: "bg-cyan-500" },
//   delivered: { label: "Delivered", Icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/50", dot: "bg-emerald-500" },
//   cancelled: { label: "Cancelled", Icon: XCircle, bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/50", dot: "bg-red-500" },
//   returned: { label: "Returned", Icon: AlertCircle, bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-700 dark:text-neutral-300", border: "border-neutral-200 dark:border-neutral-700", dot: "bg-neutral-500" },
// };

// const PAYMENT_META = {
//   pending: { label: "Unpaid", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
//   paid: { label: "Paid", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
//   failed: { label: "Failed", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" },
//   refunded: { label: "Refunded", color: "text-neutral-700 dark:text-neutral-300", bg: "bg-neutral-100 dark:bg-neutral-800" },
// };
// const PAYMENT_ICONS = { cod: Banknote, card: CreditCard, wallet: Wallet };
// const PAYMENT_LABELS = { cod: "Cash on delivery", card: "Credit / debit card", wallet: "Mobile wallet" };

// const STATUS_OPTIONS = Object.keys(STATUS_META);
// const PAYMENT_STATUS_OPTIONS = Object.keys(PAYMENT_META);

// const focusRing =
//   "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950";
// const selectCls =
//   "shrink-0 cursor-pointer rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-700 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:focus:border-neutral-100";
// const inputCls =
//   "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100 sm:text-[13px]";
// const ghostBtn =
//   "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";

// /* ════════════════════════════════════════════════════════════
//    Helpers
//    ════════════════════════════════════════════════════════════ */
// const formatPKR = (value) => {
//   const num = Number(value);
//   return Number.isFinite(num) ? `Rs ${num.toLocaleString("en-PK")}` : "Rs 0";
// };

// const formatDate = (iso) => {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
// };

// const relativeTime = (iso) => {
//   if (!iso) return "";
//   const diff = Date.now() - new Date(iso).getTime();
//   if (!Number.isFinite(diff)) return "";
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1) return "just now";
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   const days = Math.floor(hrs / 24);
//   if (days < 30) return `${days}d ago`;
//   return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
// };

// const readLS = (key, fallback) => {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : fallback;
//   } catch {
//     return fallback;
//   }
// };
// const writeLS = (key, value) => {
//   try {
//     localStorage.setItem(key, JSON.stringify(value));
//   } catch {}
// };
// const getToken = () => {
//   try {
//     return localStorage.getItem("accessToken");
//   } catch {
//     return null;
//   }
// };

// const getApiInstance = () => {
//   const instance =
//     API && typeof API.get === "function"
//       ? API
//       : axios.create({
//           baseURL:
//             (typeof API === "string" && API) ||
//             (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
//             "http://localhost:8000",
//           headers: { "Content-Type": "application/json" },
//         });
//   if (!instance.__navbarAuthAttached) {
//     instance.interceptors.request.use(
//       (config) => {
//         const token = getToken();
//         if (token) config.headers.Authorization = `Bearer ${token}`;
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );
//     instance.__navbarAuthAttached = true;
//   }
//   return instance;
// };
// const api = getApiInstance();

// const isOfflineError = (err) =>
//   !!err && (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || err.message === "Network Error" || !err.response);
// const isCancel = (err) => axios.isCancel?.(err) || err?.code === "ERR_CANCELED";

// /* Stable id for locally stored orders */
// const rawKey = (raw) => raw?._id || raw?.id || raw?.orderNumber || (raw?.createdAt ? `local-${raw.createdAt}` : null);

// const normalizeOrder = (raw) => {
//   if (!raw) return null;
//   const items = Array.isArray(raw.items) ? raw.items : [];
//   const t = raw.totals || {};
//   const subtotal = Number(t.subtotal) || items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
//   const discount = Number(t.discount) || 0;
//   const shipping = Number(t.shipping) || 0;
//   const gst = Number(t.gst) || 0;
//   const total = Number(t.total) || Number(raw.total) || Math.max(0, subtotal - discount + shipping + gst);
//   return {
//     _id: rawKey(raw),
//     orderNumber: raw.orderNumber || String(rawKey(raw) || "").slice(-8).toUpperCase() || "—",
//     createdAt: raw.createdAt || null,
//     updatedAt: raw.updatedAt || raw.createdAt || null,
//     customer: raw.customer || {},
//     address: raw.address || {},
//     items,
//     shippingMethod: raw.shippingMethod || "standard",
//     paymentMethod: raw.paymentMethod || "cod",
//     paymentStatus: raw.paymentStatus || "pending",
//     status: raw.status || "pending",
//     couponCode: raw.couponCode || null,
//     totals: { subtotal, discount, shipping, gst, total },
//     adminNotes: raw.adminNotes || "",
//     trackingNumber: raw.trackingNumber || "",
//     statusHistory: Array.isArray(raw.statusHistory) ? raw.statusHistory : [],
//   };
// };

// const getDeep = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

// /* Local-mode data engine (orders saved on this device) */
// const readLocalOrders = () => {
//   const raw = readLS(LS_ORDERS, []);
//   return (Array.isArray(raw) ? raw : []).map(normalizeOrder).filter(Boolean);
// };

// const filterLocal = (list, { q, status, payment, sortBy, sortDir }) => {
//   const needle = q.toLowerCase();
//   const out = list.filter((o) => {
//     if (status && o.status !== status) return false;
//     if (payment && o.paymentStatus !== payment) return false;
//     if (needle) {
//       const hay = [o.orderNumber, o.customer.fullName, o.customer.email, o.customer.phone, ...o.items.map((i) => i.name)]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return hay.includes(needle);
//     }
//     return true;
//   });
//   const dir = sortDir === "asc" ? 1 : -1;
//   return out.sort((a, b) => {
//     const av = getDeep(a, sortBy);
//     const bv = getDeep(b, sortBy);
//     if (sortBy === "createdAt") return (new Date(av) - new Date(bv)) * dir;
//     if (typeof av === "string") return av.localeCompare(bv) * dir;
//     return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
//   });
// };

// const buildStats = (list) => {
//   const counts = { total: list.length, today: 0 };
//   STATUS_OPTIONS.forEach((s) => (counts[s] = 0));
//   const startOfDay = new Date();
//   startOfDay.setHours(0, 0, 0, 0);
//   const monthStart = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);
//   let allTime = 0;
//   let month = 0;
//   list.forEach((o) => {
//     counts[o.status] = (counts[o.status] || 0) + 1;
//     const created = o.createdAt ? new Date(o.createdAt) : null;
//     if (created && created >= startOfDay) counts.today += 1;
//     if (o.status !== "cancelled" && o.status !== "returned") {
//       allTime += o.totals.total;
//       if (created && created >= monthStart) month += o.totals.total;
//     }
//   });
//   return { counts, revenue: { allTime, month } };
// };

// const persistLocal = (id, patch) => {
//   const all = readLS(LS_ORDERS, []);
//   const next = (Array.isArray(all) ? all : []).map((o) => {
//     if (rawKey(o) !== id) return o;
//     const history = Array.isArray(o.statusHistory) ? [...o.statusHistory] : [];
//     if (patch.status && patch.status !== (o.status || "pending")) {
//       history.push({ status: patch.status, at: new Date().toISOString(), note: "Updated by admin" });
//     }
//     return { ...o, ...patch, statusHistory: history, updatedAt: new Date().toISOString() };
//   });
//   writeLS(LS_ORDERS, next);
// };
// const removeLocal = (ids) => {
//   const set = new Set(ids);
//   const all = readLS(LS_ORDERS, []);
//   writeLS(LS_ORDERS, (Array.isArray(all) ? all : []).filter((o) => !set.has(rawKey(o))));
// };

// const applyPatch = (order, patch) => {
//   const history = [...(order.statusHistory || [])];
//   if (patch.status && patch.status !== order.status) {
//     history.push({ status: patch.status, at: new Date().toISOString(), note: "Updated by admin" });
//   }
//   return { ...order, ...patch, statusHistory: history };
// };

// /* CSV (formula-injection safe, Excel-friendly BOM) */
// const csvCell = (v) => {
//   let s = String(v ?? "");
//   if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
//   return `"${s.replace(/"/g, '""')}"`;
// };
// const CSV_HEAD = ["Order Number", "Date", "Customer", "Email", "Phone", "City", "Province", "Items", "Subtotal", "Discount", "Shipping", "GST", "Total", "Payment method", "Payment status", "Status", "Tracking"];
// const downloadCSV = (orders, name) => {
//   const rows = orders.map((o) => [
//     o.orderNumber, formatDate(o.createdAt), o.customer.fullName, o.customer.email, o.customer.phone,
//     o.address.city, o.address.province, o.items.reduce((s, i) => s + (Number(i.qty) || 0), 0),
//     o.totals.subtotal, o.totals.discount, o.totals.shipping, o.totals.gst, o.totals.total,
//     o.paymentMethod, o.paymentStatus, o.status, o.trackingNumber,
//   ]);
//   const csv = "\ufeff" + [CSV_HEAD, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
//   const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = name;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   setTimeout(() => URL.revokeObjectURL(url), 1000);
// };

// const waLink = (phone, text) => {
//   let d = String(phone || "").replace(/\D/g, "");
//   if (!d) return null;
//   if (d.startsWith("0")) d = `92${d.slice(1)}`;
//   return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
// };

// /* Focus trap + scroll lock + Esc + focus restore */
// function useDialog(ref, onClose) {
//   const closeRef = useRef(onClose);
//   closeRef.current = onClose;
//   useEffect(() => {
//     const previous = document.activeElement;
//     const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
//     const focusables = () =>
//       ref.current ? Array.from(ref.current.querySelectorAll(selector)).filter((el) => el.offsetParent !== null) : [];
//     const t = setTimeout(() => ref.current?.focus?.(), 60);
//     const onKey = (e) => {
//       if (e.key === "Escape") {
//         closeRef.current?.();
//         return;
//       }
//       if (e.key !== "Tab") return;
//       const list = focusables();
//       if (!list.length) return;
//       const first = list[0];
//       const last = list[list.length - 1];
//       if (e.shiftKey && document.activeElement === first) {
//         e.preventDefault();
//         last.focus();
//       } else if (!e.shiftKey && document.activeElement === last) {
//         e.preventDefault();
//         first.focus();
//       }
//     };
//     document.addEventListener("keydown", onKey);
//     const body = document.body;
//     const orig = { overflow: body.style.overflow, pr: body.style.paddingRight };
//     const sb = window.innerWidth - document.documentElement.clientWidth;
//     body.style.overflow = "hidden";
//     if (sb > 0) body.style.paddingRight = `${sb}px`;
//     return () => {
//       clearTimeout(t);
//       document.removeEventListener("keydown", onKey);
//       body.style.overflow = orig.overflow;
//       body.style.paddingRight = orig.pr;
//       previous?.focus?.();
//     };
//   }, [ref]);
// }

// /* ════════════════════════════════════════════════════════════
//    Small UI pieces
//    ════════════════════════════════════════════════════════════ */
// const StatusPill = memo(function StatusPill({ status, size = "md" }) {
//   const meta = STATUS_META[status] || STATUS_META.pending;
//   const Icon = meta.Icon;
//   return (
//     <span className={`inline-flex items-center rounded-full border font-bold ${meta.bg} ${meta.text} ${meta.border} ${size === "sm" ? "h-6 gap-1 px-2 text-[10.5px]" : "h-7 gap-1.5 px-2.5 text-[11.5px]"}`}>
//       <Icon className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />
//       {meta.label}
//     </span>
//   );
// });

// const PaymentPill = memo(function PaymentPill({ status }) {
//   const meta = PAYMENT_META[status] || PAYMENT_META.pending;
//   return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold ${meta.bg} ${meta.color}`}>{meta.label}</span>;
// });

// const ACCENTS = {
//   neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
//   amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
//   emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
//   blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
//   violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
// };

// const StatCard = memo(function StatCard({ icon: Icon, label, value, sub, accent = "neutral", delay = 0, onClick, active, className = "" }) {
//   const body = (
//     <div className="flex items-start justify-between gap-3">
//       <div className="min-w-0 text-left">
//         <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-neutral-500">{label}</p>
//         <p className="ao-num mt-2 truncate text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">{value}</p>
//         {sub && <p className="mt-1 truncate text-[11px] text-neutral-500 dark:text-neutral-400">{sub}</p>}
//       </div>
//       <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent]}`}>
//         <Icon className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
//       </span>
//     </div>
//   );
//   const cls = `block w-full rounded-2xl border bg-white p-4 transition-colors dark:bg-neutral-900 sm:p-5 ${
//     active ? "border-neutral-900 dark:border-neutral-100" : "border-neutral-200/80 dark:border-neutral-800/80"
//   } ${onClick ? "cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600" : ""} ${focusRing}`;
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
//       className={className}
//     >
//       {onClick ? (
//         <button type="button" onClick={onClick} aria-pressed={active} className={cls}>{body}</button>
//       ) : (
//         <div className={cls}>{body}</div>
//       )}
//     </motion.div>
//   );
// });

// const Checkbox = ({ checked, indeterminate, onChange, label, className = "" }) => {
//   const ref = useRef(null);
//   useEffect(() => {
//     if (ref.current) ref.current.indeterminate = !!indeterminate && !checked;
//   }, [indeterminate, checked]);
//   return (
//     <input
//       ref={ref}
//       type="checkbox"
//       checked={checked}
//       onChange={onChange}
//       onClick={(e) => e.stopPropagation()}
//       aria-label={label}
//       className={`h-4 w-4 cursor-pointer rounded border-neutral-300 accent-neutral-900 dark:accent-neutral-100 ${className}`}
//     />
//   );
// };

// const SkeletonRow = () => (
//   <tr className="border-b border-neutral-100 dark:border-neutral-800">
//     {Array.from({ length: 8 }).map((_, i) => (
//       <td key={i} className={`px-4 py-4 ${i === 3 || i === 5 ? "hidden lg:table-cell" : ""}`}>
//         <div className="h-4 w-full rounded ao-skeleton" />
//       </td>
//     ))}
//   </tr>
// );

// /* Clickable progress rail (sets the draft status) */
// const OrderProgress = memo(function OrderProgress({ draft, saved, onPick }) {
//   const terminal = draft === "cancelled" || draft === "returned";
//   const idx = FLOW.indexOf(draft);
//   return (
//     <div className="shrink-0 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800 sm:px-5">
//       {terminal && (
//         <p className={`mb-2 text-[11.5px] font-semibold ${STATUS_META[draft].text}`}>
//           This order is {STATUS_META[draft].label.toLowerCase()}. Pick a step to reopen it.
//         </p>
//       )}
//       <ol className="flex items-center" aria-label="Order progress">
//         {FLOW.map((s, i) => {
//           const meta = STATUS_META[s];
//           const Icon = meta.Icon;
//           const done = !terminal && i <= idx;
//           return (
//             <li key={s} className="flex flex-1 items-center last:flex-none">
//               <button
//                 type="button"
//                 onClick={() => onPick(s)}
//                 aria-label={`Set status to ${meta.label}`}
//                 aria-current={draft === s ? "step" : undefined}
//                 title={meta.label}
//                 className={`flex flex-col items-center gap-1 ${focusRing} rounded-lg`}
//               >
//                 <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${done ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900" : "border-neutral-200 text-neutral-400 dark:border-neutral-700"} ${saved === s ? "ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900" : ""}`}>
//                   <Icon className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
//                 </span>
//                 <span className={`hidden text-[10px] font-semibold sm:block ${done ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}`}>{meta.label}</span>
//               </button>
//               {i < FLOW.length - 1 && (
//                 <span className={`mx-1 mb-0 h-0.5 flex-1 rounded sm:mb-4 ${!terminal && i < idx ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-200 dark:bg-neutral-800"}`} aria-hidden="true" />
//               )}
//             </li>
//           );
//         })}
//       </ol>
//     </div>
//   );
// });

// /* Printable packing slip (portalled to <body>) */
// const PrintSheet = ({ order }) =>
//   createPortal(
//     <div className="ao-print-portal">
//       <h1 style={{ fontSize: 20, margin: 0 }}>FeatheredSHOP — Packing slip</h1>
//       <p style={{ margin: "4px 0 16px" }}>
//         Order <strong>{order.orderNumber}</strong> · {formatDate(order.createdAt)}
//       </p>
//       <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
//         <div>
//           <strong>Ship to</strong>
//           <div>{order.customer.fullName}</div>
//           <div>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</div>
//           <div>{[order.address.city, order.address.province, order.address.postalCode].filter(Boolean).join(", ")}</div>
//           <div>{order.address.country}</div>
//           <div>{order.customer.phone}</div>
//         </div>
//         <div>
//           <strong>Payment</strong>
//           <div>{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</div>
//           <div>{(PAYMENT_META[order.paymentStatus] || PAYMENT_META.pending).label}</div>
//           {order.trackingNumber && <div>Tracking: {order.trackingNumber}</div>}
//         </div>
//       </div>
//       <table>
//         <thead><tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
//         <tbody>
//           {order.items.map((i, idx) => (
//             <tr key={idx}>
//               <td>{i.name}</td><td>{i.size || "—"}</td><td>{i.qty}</td>
//               <td>{formatPKR(i.price)}</td><td>{formatPKR((Number(i.price) || 0) * (Number(i.qty) || 1))}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <p style={{ textAlign: "right", marginTop: 12 }}>
//         Subtotal {formatPKR(order.totals.subtotal)}
//         {order.totals.discount > 0 && <> · Discount −{formatPKR(order.totals.discount)}</>}
//         {" "}· Shipping {order.totals.shipping === 0 ? "Free" : formatPKR(order.totals.shipping)}
//         {" "}· GST {formatPKR(order.totals.gst)}
//         <br />
//         <strong style={{ fontSize: 15 }}>Total {formatPKR(order.totals.total)}</strong>
//       </p>
//     </div>,
//     document.body
//   );

// /* ════════════════════════════════════════════════════════════
//    Order drawer
//    ════════════════════════════════════════════════════════════ */
// const DRAWER_TABS = [
//   { id: "items", label: "Items" },
//   { id: "customer", label: "Customer" },
//   { id: "shipping", label: "Shipping" },
//   { id: "notes", label: "Notes" },
// ];

// const OrderDrawer = memo(function OrderDrawer({ order, onClose, onUpdate, onDelete, onNav, position }) {
//   const reduceMotion = useReducedMotion();
//   const ref = useRef(null);
//   const [tab, setTab] = useState("items");
//   const [statusDraft, setStatusDraft] = useState(order.status);
//   const [paymentDraft, setPaymentDraft] = useState(order.paymentStatus);
//   const [trackingDraft, setTrackingDraft] = useState(order.trackingNumber || "");
//   const [notesDraft, setNotesDraft] = useState(order.adminNotes || "");
//   const [saving, setSaving] = useState(false);
//   const [copied, setCopied] = useState("");

//   /* Reset drafts when navigating to another order */
//   useEffect(() => {
//     setStatusDraft(order.status);
//     setPaymentDraft(order.paymentStatus);
//     setTrackingDraft(order.trackingNumber || "");
//     setNotesDraft(order.adminNotes || "");
//     setTab("items");
//   }, [order._id]); // eslint-disable-line react-hooks/exhaustive-deps

//   const dirty =
//     statusDraft !== order.status ||
//     paymentDraft !== order.paymentStatus ||
//     trackingDraft !== (order.trackingNumber || "") ||
//     notesDraft !== (order.adminNotes || "");

//   const guardedClose = useCallback(() => {
//     if (dirty && !window.confirm("Discard unsaved changes?")) return;
//     onClose();
//   }, [dirty, onClose]);

//   useDialog(ref, guardedClose);

//   const guardedNav = (dir) => {
//     if (dirty && !window.confirm("Discard unsaved changes?")) return;
//     onNav(dir);
//   };

//   const copy = useCallback(async (text, key, msg) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(key);
//       toast.success(msg);
//       setTimeout(() => setCopied(""), 1500);
//     } catch {
//       toast.error("Couldn't copy");
//     }
//   }, []);

//   const handleSave = useCallback(async () => {
//     if (!dirty || saving) return;
//     if (statusDraft === "cancelled" && order.status !== "cancelled" && !window.confirm("Cancel this order?")) return;
//     setSaving(true);
//     try {
//       const statusChanged =
//         statusDraft !== order.status || paymentDraft !== order.paymentStatus || trackingDraft !== (order.trackingNumber || "");
//       if (statusChanged) {
//         await onUpdate(order._id, { status: statusDraft, paymentStatus: paymentDraft, trackingNumber: trackingDraft.trim() });
//       }
//       if (notesDraft !== (order.adminNotes || "")) {
//         await onUpdate(order._id, { adminNotes: notesDraft }, { notesOnly: true });
//       }
//       toast.success("Order updated");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to update order");
//     } finally {
//       setSaving(false);
//     }
//   }, [dirty, saving, order, statusDraft, paymentDraft, trackingDraft, notesDraft, onUpdate]);

//   /* Ctrl/⌘+S saves */
//   useEffect(() => {
//     const onKey = (e) => {
//       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
//         e.preventDefault();
//         handleSave();
//       }
//     };
//     document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [handleSave]);

//   const onTabKey = (e) => {
//     const i = DRAWER_TABS.findIndex((t) => t.id === tab);
//     let n = i;
//     if (e.key === "ArrowRight") n = (i + 1) % DRAWER_TABS.length;
//     else if (e.key === "ArrowLeft") n = (i - 1 + DRAWER_TABS.length) % DRAWER_TABS.length;
//     else return;
//     e.preventDefault();
//     setTab(DRAWER_TABS[n].id);
//     document.getElementById(`ao-tab-${DRAWER_TABS[n].id}`)?.focus();
//   };

//   const addressText = [
//     order.address.line1, order.address.line2,
//     [order.address.city, order.address.province, order.address.postalCode].filter(Boolean).join(", "),
//     order.address.country,
//   ].filter(Boolean).join("\n");

//   const wa = waLink(
//     order.customer.phone,
//     `Hi ${order.customer.fullName || ""}, this is FeatheredSHOP about your order ${order.orderNumber} (${(STATUS_META[order.status] || STATUS_META.pending).label.toLowerCase()}).`
//   );
//   const PayIcon = PAYMENT_ICONS[order.paymentMethod] || CreditCard;
//   const navBtn = "rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800";
//   const card = "rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/40";
//   const cardTitle = "text-[11px] font-bold uppercase tracking-wider text-neutral-500";

//   return (
//     <div role="dialog" aria-modal="true" aria-label={`Order ${order.orderNumber}`} className="fixed inset-0 z-[100] flex justify-end">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.2 }}
//         onClick={guardedClose}
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         aria-hidden="true"
//       />
//       <motion.aside
//         ref={ref}
//         tabIndex={-1}
//         initial={reduceMotion ? false : { x: "100%" }}
//         animate={{ x: 0 }}
//         exit={{ x: "100%" }}
//         transition={{ type: "spring", damping: 34, stiffness: 340 }}
//         className="relative flex h-dvh w-full max-w-xl flex-col border-l border-neutral-200 bg-white outline-none dark:border-neutral-800 dark:bg-neutral-900 sm:max-w-2xl"
//       >
//         {/* Header */}
//         <header className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800 sm:p-5">
//           <div className="min-w-0">
//             <div className="flex items-center gap-2">
//               <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-neutral-500">Order</span>
//               <StatusPill status={order.status} size="sm" />
//               {position && <span className="ao-num text-[10.5px] text-neutral-400">{position}</span>}
//             </div>
//             <button onClick={() => copy(order.orderNumber, "order", "Order number copied")} className={`group mt-1.5 inline-flex items-center gap-2 rounded text-left ${focusRing}`}>
//               <span className="ao-num truncate text-base font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-lg">{order.orderNumber}</span>
//               {copied === "order" ? <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5 text-neutral-400 opacity-60 group-hover:opacity-100" strokeWidth={2.5} />}
//             </button>
//             <p className="mt-0.5 text-[11px] text-neutral-400">{formatDate(order.createdAt)} · {relativeTime(order.createdAt)}</p>
//           </div>
//           <div className="flex shrink-0 items-center">
//             <button type="button" onClick={() => guardedNav(-1)} disabled={!position} aria-label="Previous order" className={navBtn}><ChevronLeft className="h-4 w-4" strokeWidth={2.5} /></button>
//             <button type="button" onClick={() => guardedNav(1)} disabled={!position} aria-label="Next order" className={navBtn}><ChevronRight className="h-4 w-4" strokeWidth={2.5} /></button>
//             <button type="button" onClick={() => window.print()} aria-label="Print packing slip" className={navBtn}><Printer className="h-4 w-4" strokeWidth={2.4} /></button>
//             <button type="button" onClick={() => onDelete(order._id)} aria-label="Delete order" className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"><Trash2 className="h-4 w-4" strokeWidth={2.4} /></button>
//             <button type="button" onClick={guardedClose} aria-label="Close" className={navBtn}><X className="h-4 w-4" strokeWidth={2.5} /></button>
//           </div>
//         </header>

//         <OrderProgress draft={statusDraft} saved={order.status} onPick={setStatusDraft} />

//         {/* Tabs */}
//         <div role="tablist" aria-label="Order details" onKeyDown={onTabKey} className="ao-rail flex shrink-0 items-center gap-1 overflow-x-auto border-b border-neutral-100 px-2 dark:border-neutral-800 sm:px-3">
//           {DRAWER_TABS.map((t) => {
//             const active = tab === t.id;
//             return (
//               <button
//                 key={t.id}
//                 id={`ao-tab-${t.id}`}
//                 role="tab"
//                 aria-selected={active}
//                 aria-controls={`ao-panel-${t.id}`}
//                 tabIndex={active ? 0 : -1}
//                 onClick={() => setTab(t.id)}
//                 className={`relative shrink-0 px-3 py-3 text-[12.5px] font-semibold transition-colors ${active ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"}`}
//               >
//                 {t.label}
//                 {t.id === "notes" && order.adminNotes && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" aria-label="Has notes" />}
//                 {active && <motion.span layoutId="ao-active-tab" className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-neutral-900 dark:bg-neutral-100" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
//               </button>
//             );
//           })}
//         </div>

//         {/* Body */}
//         <div id={`ao-panel-${tab}`} role="tabpanel" aria-labelledby={`ao-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
//           {tab === "items" && (
//             <div>
//               <ul className="space-y-3">
//                 {order.items.map((item, i) => (
//                   <li key={`${item.productId}-${i}`} className="flex gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-950/40">
//                     <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
//                       {item.image ? (
//                         <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
//                       ) : (
//                         <Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
//                       )}
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="line-clamp-2 text-[13.5px] font-bold text-neutral-900 dark:text-neutral-100">{item.name}</p>
//                       <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-neutral-500 dark:text-neutral-400">
//                         {item.brand && <span>{item.brand}</span>}
//                         {item.size && <span>Size {item.size}</span>}
//                         <span className="ao-num">{formatPKR(item.price)}</span>
//                       </div>
//                       <div className="mt-1.5 flex items-center justify-between">
//                         <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">× {item.qty}</span>
//                         <span className="ao-num text-[13px] font-black text-neutral-900 dark:text-neutral-100">{formatPKR((Number(item.price) || 0) * (Number(item.qty) || 1))}</span>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//                 {order.items.length === 0 && <li className="py-8 text-center text-[13px] text-neutral-400">No items recorded for this order.</li>}
//               </ul>

//               <div className={`mt-5 ${card}`}>
//                 <h4 className={cardTitle}>Order total</h4>
//                 <dl className="mt-3 space-y-1.5">
//                   {[
//                     ["Subtotal", formatPKR(order.totals.subtotal)],
//                     order.totals.discount > 0 && [`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `− ${formatPKR(order.totals.discount)}`, "accent"],
//                     ["Shipping", order.totals.shipping === 0 ? "Free" : formatPKR(order.totals.shipping), order.totals.shipping === 0 ? "accent" : ""],
//                     ["GST", formatPKR(order.totals.gst)],
//                     ["Total", formatPKR(order.totals.total), "total"],
//                   ].filter(Boolean).map(([label, value, kind], i) => (
//                     <div key={i} className={`flex items-center justify-between gap-3 ${kind === "total" ? "mt-2.5 border-t border-neutral-200 pt-2.5 dark:border-neutral-800" : ""}`}>
//                       <dt className={`text-[12.5px] ${kind === "total" ? "font-bold text-neutral-900 dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-400"}`}>{label}</dt>
//                       <dd className={`ao-num text-[13px] ${kind === "total" ? "text-base font-black text-neutral-900 dark:text-neutral-100" : kind === "accent" ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-semibold text-neutral-800 dark:text-neutral-200"}`}>{value}</dd>
//                     </div>
//                   ))}
//                 </dl>
//               </div>
//             </div>
//           )}

//           {tab === "customer" && (
//             <div className="space-y-4">
//               <div className={card}>
//                 <h4 className={cardTitle}>Contact</h4>
//                 <div className="mt-3 space-y-2.5">
//                   <p className="flex items-center gap-2.5 text-[13px] font-semibold text-neutral-900 dark:text-neutral-100"><User className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2.4} aria-hidden="true" />{order.customer.fullName || "Guest"}</p>
//                   {order.customer.email && <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2.5 text-[12.5px] text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"><Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" /><span className="truncate">{order.customer.email}</span></a>}
//                   {order.customer.phone && <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2.5 text-[12.5px] text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"><Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" /><span className="ao-num">{order.customer.phone}</span></a>}
//                 </div>
//                 <div className="mt-4 flex flex-wrap gap-2">
//                   {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"><MessageCircle className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" /> WhatsApp</a>}
//                   {order.customer.phone && <a href={`tel:${order.customer.phone}`} className={ghostBtn}><Phone className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" /> Call</a>}
//                   {order.customer.email && <a href={`mailto:${order.customer.email}`} className={ghostBtn}><Mail className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" /> Email</a>}
//                 </div>
//               </div>

//               <div className={card}>
//                 <h4 className={cardTitle}>Payment</h4>
//                 <div className="mt-3 space-y-3">
//                   <div className="flex items-center justify-between gap-3">
//                     <span className="flex items-center gap-2 text-[12.5px] text-neutral-600 dark:text-neutral-400"><PayIcon className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
//                     <PaymentPill status={order.paymentStatus} />
//                   </div>
//                   <div className="flex items-center justify-between gap-3 text-[12.5px]">
//                     <span className="text-neutral-600 dark:text-neutral-400">Shipping method</span>
//                     <span className="font-semibold capitalize text-neutral-900 dark:text-neutral-100">{order.shippingMethod}</span>
//                   </div>
//                   {order.trackingNumber && (
//                     <div className="flex items-center justify-between gap-3 text-[12.5px]">
//                       <span className="text-neutral-600 dark:text-neutral-400">Tracking</span>
//                       <button onClick={() => copy(order.trackingNumber, "track", "Tracking number copied")} className="ao-num inline-flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
//                         {order.trackingNumber}{copied === "track" ? <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} /> : <Copy className="h-3 w-3 text-neutral-400" strokeWidth={2.5} />}
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {tab === "shipping" && (
//             <div className="space-y-4">
//               <div className={card}>
//                 <div className="flex items-center justify-between gap-2">
//                   <h4 className={cardTitle}>Delivery address</h4>
//                   <button onClick={() => copy(addressText, "addr", "Address copied")} disabled={!addressText} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-neutral-100">
//                     {copied === "addr" ? <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} /> : <Copy className="h-3 w-3" strokeWidth={2.5} />} Copy
//                   </button>
//                 </div>
//                 <div className="mt-3 flex items-start gap-2.5">
//                   <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2.4} aria-hidden="true" />
//                   <p className="whitespace-pre-line text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">{addressText || "No address on file"}</p>
//                 </div>
//               </div>

//               <div className={card}>
//                 <h4 className={cardTitle}>Update status</h4>
//                 <div className="mt-3 space-y-3">
//                   <div>
//                     <label htmlFor="ao-status" className="mb-1 block text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">Order status</label>
//                     <select id="ao-status" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} className={inputCls}>
//                       {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="ao-payment" className="mb-1 block text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">Payment status</label>
//                     <select id="ao-payment" value={paymentDraft} onChange={(e) => setPaymentDraft(e.target.value)} className={inputCls}>
//                       {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{PAYMENT_META[s].label}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="ao-tracking" className="mb-1 block text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">Tracking number</label>
//                     <input id="ao-tracking" type="text" value={trackingDraft} onChange={(e) => setTrackingDraft(e.target.value)} placeholder="e.g. TCS-123456789" autoComplete="off" className={`ao-num ${inputCls}`} />
//                   </div>
//                 </div>
//               </div>

//               {order.statusHistory?.length > 0 && (
//                 <div className={card}>
//                   <h4 className={cardTitle}>History</h4>
//                   <ol className="mt-3 space-y-3">
//                     {[...order.statusHistory].reverse().map((h, i) => {
//                       const m = STATUS_META[h.status] || STATUS_META.pending;
//                       const Icon = m.Icon;
//                       return (
//                         <li key={i} className="flex items-start gap-2.5">
//                           <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${m.bg} ${m.text}`}><Icon className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" /></span>
//                           <div className="min-w-0 flex-1">
//                             <p className="text-[12.5px] font-semibold text-neutral-900 dark:text-neutral-100">{m.label}</p>
//                             <p className="text-[11px] text-neutral-400">{formatDate(h.at)}{h.note && ` · ${h.note}`}</p>
//                           </div>
//                         </li>
//                       );
//                     })}
//                   </ol>
//                 </div>
//               )}
//             </div>
//           )}

//           {tab === "notes" && (
//             <div>
//               <label htmlFor="ao-notes" className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Internal notes</label>
//               <textarea id="ao-notes" value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={8} maxLength={2000} placeholder="Add notes visible only to your team…" className={`resize-none leading-relaxed ${inputCls}`} />
//               <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
//                 <span>Saved when you click “Save changes”.</span>
//                 <span className="ao-num">{notesDraft.length}/2000</span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-neutral-800 dark:bg-neutral-900">
//           <button type="button" onClick={guardedClose} className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">Close</button>
//           <div className="flex items-center gap-3">
//             {dirty && <span className="hidden text-[11px] font-semibold text-amber-600 sm:inline">Unsaved changes</span>}
//             <button type="button" onClick={handleSave} disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900">
//               {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} /> Saving…</> : <><Save className="h-3.5 w-3.5" strokeWidth={2.5} /> Save changes</>}
//             </button>
//           </div>
//         </footer>
//       </motion.aside>

//       <PrintSheet order={order} />
//     </div>
//   );
// });

// /* ════════════════════════════════════════════════════════════
//    Toolbar bits
//    ════════════════════════════════════════════════════════════ */
// const ExportMenu = memo(function ExportMenu({ onPage, onAll, disabled, busy }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);
//   useEffect(() => {
//     if (!open) return;
//     const down = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
//     const key = (e) => e.key === "Escape" && setOpen(false);
//     document.addEventListener("pointerdown", down);
//     document.addEventListener("keydown", key);
//     return () => {
//       document.removeEventListener("pointerdown", down);
//       document.removeEventListener("keydown", key);
//     };
//   }, [open]);
//   return (
//     <div ref={ref} className="relative">
//       <button type="button" onClick={() => setOpen((v) => !v)} disabled={disabled || busy} aria-haspopup="menu" aria-expanded={open} className={ghostBtn}>
//         {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.4} /> : <Download className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />}
//         Export
//         <ChevronDown className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
//       </button>
//       {open && (
//         <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
//           <button role="menuitem" onClick={() => { setOpen(false); onPage(); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-[12.5px] font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800">This page</button>
//           <button role="menuitem" onClick={() => { setOpen(false); onAll(); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-[12.5px] font-semibold text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800">All matching orders</button>
//         </div>
//       )}
//     </div>
//   );
// });

// const pageWindow = (page, total) => {
//   const set = new Set([1, total, page - 1, page, page + 1]);
//   const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
//   const out = [];
//   nums.forEach((n, i) => {
//     if (i > 0 && n - nums[i - 1] > 1) out.push(-i);
//     out.push(n);
//   });
//   return out;
// };

// /* ════════════════════════════════════════════════════════════
//    Main — AdminOrders
//    ════════════════════════════════════════════════════════════ */
// const AdminOrders = () => {
//   const reduceMotion = useReducedMotion();
//   const ctx = getData?.() || {};
//   const user = ctx.user || readLS("user", null);
//   const admin = !!user && (user.role === "admin" || user.userRole === "admin" || user.isAdmin === true);
//   const loggedIn = !!getToken() || !!user;

//   /* ─── URL-synced filters ─────────────────────────── */
//   const [sp, setSp] = useSearchParams();
//   const qParam = sp.get("q") || "";
//   const statusFilter = STATUS_OPTIONS.includes(sp.get("status")) ? sp.get("status") : "";
//   const paymentFilter = PAYMENT_STATUS_OPTIONS.includes(sp.get("payment")) ? sp.get("payment") : "";
//   const sortParam = sp.get("sort") || "createdAt:desc";
//   const [sortBy, sortDir] = sortParam.split(":").length === 2 ? sortParam.split(":") : ["createdAt", "desc"];
//   const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
//   const pageSize = PAGE_SIZES.includes(Number(sp.get("size"))) ? Number(sp.get("size")) : PAGE_SIZES[0];

//   const updateParams = useCallback(
//     (patch) =>
//       setSp(
//         (prev) => {
//           const n = new URLSearchParams(prev);
//           Object.entries(patch).forEach(([k, v]) => {
//             const empty = v === "" || v == null || (k === "page" && Number(v) === 1) || (k === "sort" && v === "createdAt:desc") || (k === "size" && Number(v) === PAGE_SIZES[0]);
//             if (empty) n.delete(k);
//             else n.set(k, String(v));
//           });
//           return n;
//         },
//         { replace: true }
//       ),
//     [setSp]
//   );

//   const [searchInput, setSearchInput] = useState(qParam);
//   const searchRef = useRef(null);
//   useEffect(() => setSearchInput(qParam), [qParam]);
//   useEffect(() => {
//     if (searchInput.trim() === qParam) return;
//     const t = setTimeout(() => updateParams({ q: searchInput.trim(), page: 1 }), 350);
//     return () => clearTimeout(t);
//   }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

//   /* ─── Data ───────────────────────────────────────── */
//   const [orders, setOrders] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [source, setSource] = useState("server");
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [, setTick] = useState(0);
//   const [autoRefresh, setAutoRefresh] = useState(() => readLS(LS_AUTO, true));
//   const [selected, setSelected] = useState(null);
//   const [checked, setChecked] = useState(() => new Set());
//   const [exporting, setExporting] = useState(false);
//   const [bulkBusy, setBulkBusy] = useState(false);

//   const abortRef = useRef(null);
//   const seqRef = useRef(0);
//   const knownIds = useRef(null);
//   const sourceRef = useRef(source);
//   sourceRef.current = source;
//   const ordersRef = useRef(orders);
//   ordersRef.current = orders;
//   const selectedRef = useRef(selected);
//   selectedRef.current = selected;

//   const load = useCallback(
//     async ({ silent = false } = {}) => {
//       if (!admin || !loggedIn) return;
//       abortRef.current?.abort();
//       const controller = new AbortController();
//       abortRef.current = controller;
//       const seq = ++seqRef.current;
//       silent ? setRefreshing(true) : setLoading(true);
//       if (!silent) setError(null);

//       const params = { page, limit: pageSize, search: qParam, status: statusFilter, paymentStatus: paymentFilter, sort: sortBy, dir: sortDir };

//       const fromLocal = () => {
//         const all = readLocalOrders();
//         const filtered = filterLocal(all, { q: qParam, status: statusFilter, payment: paymentFilter, sortBy, sortDir });
//         const start = (page - 1) * pageSize;
//         return { list: filtered.slice(start, start + pageSize), total: filtered.length, stats: buildStats(all) };
//       };

//       try {
//         const [listRes, statsRes] = await Promise.all([
//           api.get("/api/orders", { params, signal: controller.signal }),
//           api.get("/api/orders/stats", { signal: controller.signal }).catch((e) => (isCancel(e) ? Promise.reject(e) : null)),
//         ]);
//         if (seq !== seqRef.current) return;
//         const data = Array.isArray(listRes?.data?.data) ? listRes.data.data : [];
//         const pag = listRes?.data?.pagination || {};
//         const list = data.map(normalizeOrder).filter(Boolean);
//         setOrders(list);
//         setTotal(Number(pag.total) || list.length);
//         setStats(statsRes?.data?.data || null);
//         setSource("server");
//         setError(null);

//         /* New-order toast on silent refresh of the default view */
//         const defaultView = page === 1 && !qParam && !statusFilter && !paymentFilter && sortParam === "createdAt:desc";
//         if (defaultView) {
//           if (silent && knownIds.current) {
//             const fresh = list.filter((o) => !knownIds.current.has(o._id));
//             if (fresh.length) toast.info(`${fresh.length} new order${fresh.length > 1 ? "s" : ""} received`);
//           }
//           knownIds.current = new Set(list.map((o) => o._id));
//         }
//         setSelected((prev) => (prev ? list.find((o) => o._id === prev._id) || prev : prev));
//       } catch (err) {
//         if (isCancel(err) || seq !== seqRef.current) return;
//         const status = err?.response?.status;
//         if (isOfflineError(err) || status === 404 || status === 501) {
//           const local = fromLocal();
//           setOrders(local.list);
//           setTotal(local.total);
//           setStats(local.stats);
//           setSource("local");
//           setError(null);
//         } else {
//           console.error("Fetch orders error:", err);
//           setError(err?.response?.data?.message || "Failed to load orders");
//         }
//       } finally {
//         if (seq === seqRef.current) {
//           setLoading(false);
//           setRefreshing(false);
//           setLastUpdated(new Date().toISOString());
//         }
//       }
//     },
//     [admin, loggedIn, page, pageSize, qParam, statusFilter, paymentFilter, sortBy, sortDir, sortParam]
//   );
//   const loadRef = useRef(load);
//   loadRef.current = load;

//   useEffect(() => {
//     load();
//     return () => abortRef.current?.abort();
//   }, [load]);

//   /* Auto-refresh (paused when hidden / drawer open) */
//   useEffect(() => {
//     writeLS(LS_AUTO, autoRefresh);
//     if (!autoRefresh) return;
//     const id = setInterval(() => {
//       if (document.hidden || selectedRef.current) return;
//       loadRef.current({ silent: true });
//     }, REFRESH_MS);
//     return () => clearInterval(id);
//   }, [autoRefresh]);

//   /* Keep "updated x ago" fresh */
//   useEffect(() => {
//     const id = setInterval(() => setTick((t) => t + 1), 15000);
//     return () => clearInterval(id);
//   }, []);

//   /* Prune selection to rows still on screen */
//   useEffect(() => {
//     setChecked((prev) => {
//       if (prev.size === 0) return prev;
//       const ids = new Set(orders.map((o) => o._id));
//       const next = new Set([...prev].filter((id) => ids.has(id)));
//       return next.size === prev.size ? prev : next;
//     });
//   }, [orders]);

//   /* "/" focuses search */
//   useEffect(() => {
//     const onKey = (e) => {
//       const el = document.activeElement;
//       const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.tagName === "SELECT" || el?.isContentEditable;
//       if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !selectedRef.current) {
//         e.preventDefault();
//         searchRef.current?.focus();
//       }
//     };
//     document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, []);

//   /* ─── Mutations ──────────────────────────────────── */
//   const sendPatch = useCallback(async (id, patch, opts = {}) => {
//     if (sourceRef.current === "server") {
//       const res = opts.notesOnly
//         ? await api.patch(`/api/orders/${id}/notes`, { adminNotes: patch.adminNotes })
//         : await api.patch(`/api/orders/${id}/status`, patch);
//       return res?.data?.data || null;
//     }
//     persistLocal(id, patch);
//     return null;
//   }, []);

//   const handleUpdate = useCallback(
//     async (id, patch, opts = {}) => {
//       const current = ordersRef.current.find((o) => o._id === id) || (selectedRef.current?._id === id ? selectedRef.current : null);
//       if (!current) return;
//       const optimistic = applyPatch(current, patch);
//       setOrders((prev) => prev.map((o) => (o._id === id ? optimistic : o)));
//       setSelected((prev) => (prev && prev._id === id ? optimistic : prev));
//       try {
//         const server = await sendPatch(id, patch, opts);
//         if (server && server._id) {
//           const merged = normalizeOrder(server);
//           setOrders((prev) => prev.map((o) => (o._id === id ? merged : o)));
//           setSelected((prev) => (prev && prev._id === id ? merged : prev));
//         }
//         if (!opts.notesOnly) loadRef.current({ silent: true });
//       } catch (err) {
//         setOrders((prev) => prev.map((o) => (o._id === id ? current : o)));
//         setSelected((prev) => (prev && prev._id === id ? current : prev));
//         throw err;
//       }
//     },
//     [sendPatch]
//   );

//   const sendDelete = useCallback(async (id) => {
//     if (sourceRef.current === "server") await api.delete(`/api/orders/${id}`);
//     else removeLocal([id]);
//   }, []);

//   const handleDelete = useCallback(
//     async (id) => {
//       if (!window.confirm("Delete this order permanently?")) return;
//       try {
//         await sendDelete(id);
//         setOrders((prev) => prev.filter((o) => o._id !== id));
//         setSelected(null);
//         toast.success("Order deleted");
//         loadRef.current({ silent: true });
//       } catch (err) {
//         toast.error(err?.response?.data?.message || "Failed to delete");
//       }
//     },
//     [sendDelete]
//   );

//   const bulkStatus = useCallback(
//     async (status) => {
//       const ids = [...checked];
//       if (!ids.length || !status) return;
//       if ((status === "cancelled" || status === "returned") && !window.confirm(`Mark ${ids.length} order(s) as ${STATUS_META[status].label.toLowerCase()}?`)) return;
//       setBulkBusy(true);
//       const results = await Promise.allSettled(ids.map((id) => sendPatch(id, { status })));
//       const ok = results.filter((r) => r.status === "fulfilled").length;
//       const failed = ids.length - ok;
//       if (ok) toast.success(`${ok} order${ok > 1 ? "s" : ""} marked ${STATUS_META[status].label.toLowerCase()}`);
//       if (failed) toast.error(`${failed} order${failed > 1 ? "s" : ""} failed to update`);
//       setChecked(new Set());
//       setBulkBusy(false);
//       loadRef.current({ silent: true });
//     },
//     [checked, sendPatch]
//   );

//   const bulkDelete = useCallback(async () => {
//     const ids = [...checked];
//     if (!ids.length || !window.confirm(`Delete ${ids.length} order(s) permanently?`)) return;
//     setBulkBusy(true);
//     const results = await Promise.allSettled(ids.map((id) => sendDelete(id)));
//     const ok = results.filter((r) => r.status === "fulfilled").length;
//     if (ok) toast.success(`${ok} order${ok > 1 ? "s" : ""} deleted`);
//     if (ok < ids.length) toast.error(`${ids.length - ok} failed to delete`);
//     setChecked(new Set());
//     setBulkBusy(false);
//     loadRef.current({ silent: true });
//   }, [checked, sendDelete]);

//   /* ─── Export ─────────────────────────────────────── */
//   const fileName = () => `featheredshop-orders-${new Date().toISOString().slice(0, 10)}.csv`;

//   const exportPage = useCallback(() => {
//     if (!orders.length) return toast.error("No orders to export");
//     downloadCSV(orders, fileName());
//     toast.success(`Exported ${orders.length} orders`);
//   }, [orders]);

//   const exportSelected = useCallback(() => {
//     const rows = orders.filter((o) => checked.has(o._id));
//     if (!rows.length) return;
//     downloadCSV(rows, fileName());
//     toast.success(`Exported ${rows.length} orders`);
//   }, [orders, checked]);

//   const exportAll = useCallback(async () => {
//     setExporting(true);
//     try {
//       let all = [];
//       if (sourceRef.current === "local") {
//         all = filterLocal(readLocalOrders(), { q: qParam, status: statusFilter, payment: paymentFilter, sortBy, sortDir });
//       } else {
//         const limit = 100;
//         for (let p = 1; p <= 50; p++) {
//           const res = await api.get("/api/orders", { params: { page: p, limit, search: qParam, status: statusFilter, paymentStatus: paymentFilter, sort: sortBy, dir: sortDir } });
//           const chunk = (res?.data?.data || []).map(normalizeOrder).filter(Boolean);
//           all = all.concat(chunk);
//           if (chunk.length < limit) break;
//         }
//       }
//       if (!all.length) return toast.error("No orders to export");
//       downloadCSV(all, fileName());
//       toast.success(`Exported ${all.length} orders`);
//     } catch {
//       toast.error("Export failed");
//     } finally {
//       setExporting(false);
//     }
//   }, [qParam, statusFilter, paymentFilter, sortBy, sortDir]);

//   /* ─── Drawer navigation ──────────────────────────── */
//   const selectedIndex = selected ? orders.findIndex((o) => o._id === selected._id) : -1;
//   const navigateDrawer = useCallback(
//     (dir) => {
//       if (selectedIndex < 0) return;
//       const next = orders[(selectedIndex + dir + orders.length) % orders.length];
//       if (next) setSelected(next);
//     },
//     [orders, selectedIndex]
//   );

//   /* ─── Selection helpers ──────────────────────────── */
//   const allChecked = orders.length > 0 && orders.every((o) => checked.has(o._id));
//   const someChecked = checked.size > 0;
//   const toggleAll = () => setChecked(allChecked ? new Set() : new Set(orders.map((o) => o._id)));
//   const toggleOne = (id) =>
//     setChecked((prev) => {
//       const n = new Set(prev);
//       n.has(id) ? n.delete(id) : n.add(id);
//       return n;
//     });

//   const toggleSort = (field) => updateParams({ sort: sortBy === field ? `${field}:${sortDir === "asc" ? "desc" : "asc"}` : `${field}:desc`, page: 1 });
//   const clearFilters = () => {
//     setSearchInput("");
//     updateParams({ q: "", status: "", payment: "", page: 1 });
//   };

//   /* ═════════════════════════════════════════════════════════
//      Auth gate (after all hooks)
//      ═════════════════════════════════════════════════════════ */
//   if (!loggedIn || !admin) {
//     return (
//       <div className="ao-hd-root flex min-h-dvh items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
//         <style>{HD_CSS}</style>
//         <div className="mx-auto max-w-md text-center">
//           <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40"><AlertCircle className="h-7 w-7 text-red-500" strokeWidth={1.5} /></div>
//           <h1 className="ao-serif text-2xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-3xl">{loggedIn ? "Admin access required" : "Please log in"}</h1>
//           <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">{loggedIn ? "You don't have permission to view this page." : "Log in with your admin account to manage orders."}</p>
//           <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
//             <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[13.5px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"><ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} /> Go home</Link>
//             {!loggedIn && <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[13.5px] font-bold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900">Log in</Link>}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   const hasFilters = !!(qParam || statusFilter || paymentFilter);
//   const counts = stats?.counts || {};
//   const SortIcon = ({ field }) =>
//     sortBy === field ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" strokeWidth={3} aria-hidden="true" /> : <ChevronDown className="h-3 w-3" strokeWidth={3} aria-hidden="true" />) : null;
//   const ariaSort = (field) => (sortBy === field ? (sortDir === "asc" ? "ascending" : "descending") : "none");
//   const thBase = "whitespace-nowrap px-4 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.16em] text-neutral-500";

//   /* ═════════════════════════════════════════════════════════
//      Render
//      ═════════════════════════════════════════════════════════ */
//   return (
//     <div className="ao-hd-root min-h-dvh bg-neutral-50/60 pb-28 dark:bg-neutral-950">
//       <style>{HD_CSS}</style>

//       {/* Header */}
//       <header className="border-b border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950">
//         <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-10 md:px-8 lg:px-10 3xl:max-w-[110rem]">
//           <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//             <div className="min-w-0">
//               <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
//                 <span className="inline-flex items-center gap-2">
//                   <span className="h-px w-8 bg-neutral-900 dark:bg-white" aria-hidden="true" />
//                   <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">Admin · Orders</span>
//                 </span>
//                 <Link to="/admin/dashboard" className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">← Dashboard</Link>
//               </div>
//               <h1 className="ao-serif mt-3 text-[clamp(1.9rem,1.3rem+2.4vw,2.75rem)] font-medium leading-[1.05] text-neutral-900 dark:text-neutral-100">Orders</h1>
//               <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-neutral-500 dark:text-neutral-400">
//                 <span className="ao-num">{total.toLocaleString()} order{total === 1 ? "" : "s"}{hasFilters && " · filtered"}</span>
//                 {source === "local" ? (
//                   <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"><WifiOff className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" /> Local data</span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</span>
//                 )}
//                 {lastUpdated && <span className="text-[11px] text-neutral-400">Updated {relativeTime(lastUpdated)}</span>}
//               </p>
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
//                 <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="h-3.5 w-3.5 accent-neutral-900 dark:accent-neutral-100" />
//                 Auto-refresh
//               </label>
//               <button type="button" onClick={() => { load({ silent: true }); toast.success("Orders refreshed"); }} aria-label="Refresh orders" className={ghostBtn}>
//                 <RefreshCw className={`h-3.5 w-3.5 ${loading || refreshing ? "animate-spin" : ""}`} strokeWidth={2.4} aria-hidden="true" /> Refresh
//               </button>
//               <ExportMenu onPage={exportPage} onAll={exportAll} disabled={orders.length === 0} busy={exporting} />
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 lg:px-10 3xl:max-w-[110rem]">
//         {source === "local" && (
//           <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20" role="status">
//             <WifiOff className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={2.4} aria-hidden="true" />
//             <p className="min-w-0 flex-1 text-[12.5px] text-amber-800 dark:text-amber-300">The orders server isn't reachable. Showing orders saved on this device — changes stay here until the server is back.</p>
//             <button type="button" onClick={() => load()} className="shrink-0 rounded-full bg-amber-900 px-3.5 py-1.5 text-[11px] font-bold text-amber-50 hover:opacity-90 dark:bg-amber-200 dark:text-amber-950">Retry server</button>
//           </div>
//         )}

//         {/* Stats */}
//         {stats && (
//           <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 lg:gap-4">
//             <StatCard icon={ShoppingBag} label="Total orders" value={Number(counts.total || 0).toLocaleString()} sub={`${counts.today || 0} today`} delay={0.02} onClick={clearFilters} active={!hasFilters} />
//             <StatCard icon={Clock} label="Pending" value={Number(counts.pending || 0).toLocaleString()} sub="Awaiting action" accent="amber" delay={0.06} onClick={() => updateParams({ status: statusFilter === "pending" ? "" : "pending", page: 1 })} active={statusFilter === "pending"} />
//             <StatCard icon={Package} label="Processing" value={Number(counts.processing || 0).toLocaleString()} sub="Being prepared" accent="violet" delay={0.1} onClick={() => updateParams({ status: statusFilter === "processing" ? "" : "processing", page: 1 })} active={statusFilter === "processing"} />
//             <StatCard icon={Truck} label="Shipped" value={Number(counts.shipped || 0).toLocaleString()} sub="In transit" accent="blue" delay={0.14} onClick={() => updateParams({ status: statusFilter === "shipped" ? "" : "shipped", page: 1 })} active={statusFilter === "shipped"} />
//             <StatCard icon={TrendingUp} label="Revenue" value={formatPKR(stats.revenue?.allTime)} sub={`${formatPKR(stats.revenue?.month)} this month`} accent="emerald" delay={0.18} className="col-span-2 md:col-span-1" />
//           </div>
//         )}

//         {/* Status chips */}
//         <div className="ao-rail -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Filter by status">
//           {[["", "All"], ...STATUS_OPTIONS.map((s) => [s, STATUS_META[s].label])].map(([val, label]) => {
//             const on = statusFilter === val;
//             const n = val ? counts[val] : counts.total;
//             return (
//               <button
//                 key={val || "all"}
//                 type="button"
//                 onClick={() => updateParams({ status: val, page: 1 })}
//                 aria-pressed={on}
//                 className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
//                   on ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600"
//                 }`}
//               >
//                 {val && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[val].dot}`} aria-hidden="true" />}
//                 {label}
//                 {typeof n === "number" && <span className={`ao-num text-[10.5px] ${on ? "opacity-70" : "text-neutral-400"}`}>{n}</span>}
//               </button>
//             );
//           })}
//         </div>

//         {/* Filters */}
//         <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
//           <div className="relative col-span-2 min-w-0 flex-1 sm:min-w-[240px]">
//             <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={2.4} aria-hidden="true" />
//             <input
//               ref={searchRef}
//               type="search"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               placeholder="Search order #, customer, email, phone…"
//               aria-label="Search orders"
//               className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-16 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100 sm:text-[13.5px]"
//             />
//             {searchInput ? (
//               <button type="button" onClick={() => { setSearchInput(""); updateParams({ q: "", page: 1 }); }} aria-label="Clear search" className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"><X className="h-3.5 w-3.5" strokeWidth={2.5} /></button>
//             ) : (
//               <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-neutral-200 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 dark:border-neutral-700 sm:block">/</kbd>
//             )}
//           </div>

//           <select value={paymentFilter} onChange={(e) => updateParams({ payment: e.target.value, page: 1 })} aria-label="Filter by payment" className={selectCls}>
//             <option value="">All payments</option>
//             {PAYMENT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{PAYMENT_META[s].label}</option>)}
//           </select>

//           <select value={`${sortBy}:${sortDir}`} onChange={(e) => updateParams({ sort: e.target.value, page: 1 })} aria-label="Sort orders" className={selectCls}>
//             <option value="createdAt:desc">Newest first</option>
//             <option value="createdAt:asc">Oldest first</option>
//             <option value="totals.total:desc">Highest total</option>
//             <option value="totals.total:asc">Lowest total</option>
//           </select>

//           {hasFilters && (
//             <button type="button" onClick={clearFilters} className="col-span-2 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 sm:col-span-1">
//               <X className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" /> Clear filters
//             </button>
//           )}
//         </div>

//         {/* Error */}
//         {error && (
//           <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/20">
//             <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={2.4} aria-hidden="true" />
//             <div className="flex-1 text-[12.5px] text-red-700 dark:text-red-300">{error}</div>
//             <button type="button" onClick={() => load()} className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90">Retry</button>
//           </div>
//         )}

//         {/* Orders */}
//         <div className={`mt-5 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-opacity dark:border-neutral-800/80 dark:bg-neutral-900 ${refreshing ? "opacity-80" : ""}`}>
//           {/* Table (md+) */}
//           <div className="hidden overflow-x-auto md:block">
//             <table className="w-full">
//               <thead className="border-b border-neutral-100 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-950/40">
//                 <tr>
//                   <th scope="col" className="w-10 py-3 pl-4"><Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} label="Select all orders on this page" /></th>
//                   <th scope="col" aria-sort={ariaSort("createdAt")} className={thBase}><button type="button" onClick={() => toggleSort("createdAt")} className="inline-flex items-center gap-1 uppercase tracking-[0.16em] hover:text-neutral-900 dark:hover:text-neutral-100">Order <SortIcon field="createdAt" /></button></th>
//                   <th scope="col" className={thBase}>Customer</th>
//                   <th scope="col" className={`${thBase} hidden lg:table-cell`}>Items</th>
//                   <th scope="col" aria-sort={ariaSort("totals.total")} className={thBase}><button type="button" onClick={() => toggleSort("totals.total")} className="inline-flex items-center gap-1 uppercase tracking-[0.16em] hover:text-neutral-900 dark:hover:text-neutral-100">Total <SortIcon field="totals.total" /></button></th>
//                   <th scope="col" className={`${thBase} hidden lg:table-cell`}>Payment</th>
//                   <th scope="col" className={thBase}>Status</th>
//                   <th scope="col" className="w-10"><span className="sr-only">Open</span></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
//                 ) : orders.length === 0 ? (
//                   <tr>
//                     <td colSpan={8} className="py-16 text-center">
//                       <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"><Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} /></span>
//                       <p className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{hasFilters ? "No orders match these filters" : "No orders yet"}</p>
//                       <p className="mt-1 text-xs text-neutral-400">{hasFilters ? "Try changing or clearing the filters." : "New orders will appear here."}</p>
//                       {hasFilters && <button onClick={clearFilters} className="mt-4 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800">Clear filters</button>}
//                     </td>
//                   </tr>
//                 ) : (
//                   orders.map((o) => {
//                     const itemCount = o.items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
//                     const isChecked = checked.has(o._id);
//                     return (
//                       <tr
//                         key={o._id}
//                         tabIndex={0}
//                         onClick={() => setSelected(o)}
//                         onKeyDown={(e) => {
//                           if (e.target !== e.currentTarget) return;
//                           if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(o); }
//                         }}
//                         className={`cursor-pointer border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/70 focus-visible:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-950/40 dark:focus-visible:bg-neutral-950/40 ${isChecked ? "bg-neutral-50 dark:bg-neutral-950/50" : ""}`}
//                       >
//                         <td className="py-3.5 pl-4"><Checkbox checked={isChecked} onChange={() => toggleOne(o._id)} label={`Select order ${o.orderNumber}`} /></td>
//                         <td className="px-4 py-3.5">
//                           <span className="ao-num block text-[13px] font-bold text-neutral-900 dark:text-neutral-100">{o.orderNumber}</span>
//                           <span className="text-[11px] text-neutral-400">{relativeTime(o.createdAt)}</span>
//                         </td>
//                         <td className="max-w-[16rem] px-4 py-3.5">
//                           <span className="line-clamp-1 block text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{o.customer.fullName || "Guest"}</span>
//                           <span className="block truncate text-[11.5px] text-neutral-400">{o.customer.email}</span>
//                         </td>
//                         <td className="ao-num hidden whitespace-nowrap px-4 py-3.5 text-[13px] text-neutral-700 dark:text-neutral-300 lg:table-cell">{itemCount}</td>
//                         <td className="ao-num whitespace-nowrap px-4 py-3.5 text-[13px] font-bold text-neutral-900 dark:text-neutral-100">{formatPKR(o.totals.total)}</td>
//                         <td className="hidden whitespace-nowrap px-4 py-3.5 lg:table-cell"><PaymentPill status={o.paymentStatus} /></td>
//                         <td className="whitespace-nowrap px-4 py-3.5"><StatusPill status={o.status} size="sm" /></td>
//                         <td className="pr-4 text-right"><ChevronRight className="inline h-4 w-4 text-neutral-400" strokeWidth={2.4} aria-hidden="true" /></td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Cards (< md) */}
//           <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 md:hidden">
//             {loading ? (
//               Array.from({ length: 5 }).map((_, i) => (
//                 <li key={i} className="flex gap-3 p-4">
//                   <div className="h-16 w-16 shrink-0 rounded-xl ao-skeleton" />
//                   <div className="flex-1 space-y-2"><div className="h-4 w-3/4 rounded ao-skeleton" /><div className="h-3 w-1/2 rounded ao-skeleton" /></div>
//                 </li>
//               ))
//             ) : orders.length === 0 ? (
//               <li className="px-4 py-14 text-center">
//                 <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"><Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} /></span>
//                 <p className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{hasFilters ? "No orders match" : "No orders yet"}</p>
//                 {hasFilters && <button onClick={clearFilters} className="mt-3 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">Clear filters</button>}
//               </li>
//             ) : (
//               orders.map((o) => {
//                 const itemCount = o.items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
//                 const first = o.items[0];
//                 const isChecked = checked.has(o._id);
//                 return (
//                   <li key={o._id} className={`relative ${isChecked ? "bg-neutral-50 dark:bg-neutral-950/50" : ""}`}>
//                     <button type="button" onClick={() => setSelected(o)} className="flex w-full items-start gap-3 p-4 pl-12 text-left transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-950/40">
//                       <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
//                         {first?.image ? <img src={first.image} alt="" loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} /> : <Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />}
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <div className="flex items-start justify-between gap-2">
//                           <span className="ao-num truncate text-[12.5px] font-bold text-neutral-900 dark:text-neutral-100">{o.orderNumber}</span>
//                           <StatusPill status={o.status} size="sm" />
//                         </div>
//                         <p className="mt-1 truncate text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">{o.customer.fullName || "Guest"}</p>
//                         <div className="mt-1.5 flex items-center justify-between gap-2">
//                           <span className="ao-num text-[13px] font-black text-neutral-900 dark:text-neutral-100">{formatPKR(o.totals.total)}</span>
//                           <span className="flex items-center gap-2"><PaymentPill status={o.paymentStatus} /></span>
//                         </div>
//                         <p className="mt-1 text-[10.5px] text-neutral-400">{itemCount} item{itemCount === 1 ? "" : "s"} · {relativeTime(o.createdAt)}</p>
//                       </div>
//                     </button>
//                     <span className="absolute left-4 top-5"><Checkbox checked={isChecked} onChange={() => toggleOne(o._id)} label={`Select order ${o.orderNumber}`} /></span>
//                   </li>
//                 );
//               })
//             )}
//           </ul>
//         </div>

//         {/* Pagination */}
//         {!loading && total > 0 && (
//           <nav aria-label="Orders pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3">
//             <div className="flex flex-wrap items-center gap-3">
//               <p className="ao-num text-[12.5px] text-neutral-500 dark:text-neutral-400">
//                 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}
//               </p>
//               <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-400">
//                 Rows
//                 <select value={pageSize} onChange={(e) => updateParams({ size: e.target.value, page: 1 })} className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
//                   {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
//                 </select>
//               </label>
//             </div>
//             {totalPages > 1 && (
//               <div className="flex items-center gap-1">
//                 <button type="button" onClick={() => updateParams({ page: Math.max(1, page - 1) })} disabled={page <= 1} aria-label="Previous page" className={`${ghostBtn} !px-3`}><ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} /></button>
//                 <span className="hidden items-center gap-1 sm:flex">
//                   {pageWindow(page, totalPages).map((n) =>
//                     n < 0 ? <span key={n} className="px-1 text-neutral-400" aria-hidden="true">…</span> : (
//                       <button key={n} type="button" onClick={() => updateParams({ page: n })} aria-current={n === page ? "page" : undefined} className={`ao-num h-8 min-w-8 rounded-full px-2 text-xs font-bold transition-colors ${n === page ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>{n}</button>
//                     )
//                   )}
//                 </span>
//                 <span className="ao-num rounded-full bg-neutral-100 px-3.5 py-2 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 sm:hidden">{page} / {totalPages}</span>
//                 <button type="button" onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })} disabled={page >= totalPages} aria-label="Next page" className={`${ghostBtn} !px-3`}><ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} /></button>
//               </div>
//             )}
//           </nav>
//         )}
//       </main>

//       {/* Bulk action bar */}
//       <AnimatePresence>
//         {someChecked && (
//           <motion.div
//             initial={reduceMotion ? false : { y: 80, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 80, opacity: 0 }}
//             transition={{ duration: 0.22, ease: "easeOut" }}
//             className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-2.5 pl-4 text-white shadow-2xl dark:border-neutral-200 dark:bg-white dark:text-neutral-900"
//             role="region"
//             aria-label="Bulk actions"
//           >
//             <span className="ao-num mr-auto text-[13px] font-bold">{checked.size} selected</span>
//             <select
//               value=""
//               disabled={bulkBusy}
//               onChange={(e) => bulkStatus(e.target.value)}
//               aria-label="Set status for selected orders"
//               className="cursor-pointer rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-inherit focus:outline-none dark:bg-neutral-900/10 [&>option]:text-neutral-900"
//             >
//               <option value="">Set status…</option>
//               {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
//             </select>
//             <button type="button" onClick={exportSelected} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold hover:bg-white/20 dark:bg-neutral-900/10 dark:hover:bg-neutral-900/20"><Download className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" /> Export</button>
//             <button type="button" onClick={bulkDelete} disabled={bulkBusy} className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" /> Delete</button>
//             <button type="button" onClick={() => setChecked(new Set())} aria-label="Clear selection" className="rounded-full p-2 hover:bg-white/10 dark:hover:bg-neutral-900/10"><X className="h-4 w-4" strokeWidth={2.5} /></button>
//             {bulkBusy && <Loader2 className="h-4 w-4 animate-spin" aria-label="Working" />}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Drawer */}
//       <AnimatePresence>
//         {selected && (
//           <OrderDrawer
//             order={selected}
//             onClose={() => setSelected(null)}
//             onUpdate={handleUpdate}
//             onDelete={handleDelete}
//             onNav={navigateDrawer}
//             position={selectedIndex >= 0 ? `${selectedIndex + 1} of ${orders.length}` : null}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default AdminOrders;
























/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Eye,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  User,
  CreditCard,
  Banknote,
  Wallet,
  Receipt,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Calendar,
  MoreVertical,
  MessageSquare,
  Save,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import API from "@/utils/api";

/* ════════════════════════════════════════════════════════════
   HD CSS — same language across the app
   ════════════════════════════════════════════════════════════ */
const HD_CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Public+Sans:wght@400..800&display=swap");

  .ao-hd-root {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    -webkit-tap-highlight-color: transparent;
  }
  .ao-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    letter-spacing: -0.02em;
  }
  .ao-num {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1, "kern" 1;
  }
  .ao-hd-root :focus-visible { outline: 2px solid #171717; outline-offset: 2px; }
  .dark .ao-hd-root :focus-visible { outline-color: #fafafa; }
  .ao-rail::-webkit-scrollbar { display: none; }
  .ao-rail { scrollbar-width: none; -ms-overflow-style: none; }

  .ao-skeleton {
    background: linear-gradient(90deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.05) 100%);
    background-size: 200% 100%;
    animation: ao-shimmer 1.4s ease-in-out infinite;
  }
  .dark .ao-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 100%);
    background-size: 200% 100%;
  }
  @keyframes ao-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @media (prefers-reduced-motion: reduce) { .ao-skeleton { animation: none; } }
`;

/* ════════════════════════════════════════════════════════════
   Constants
   ════════════════════════════════════════════════════════════ */
const LS_ORDERS = "fs_orders";
const PAGE_SIZE = 15;

const STATUS_META = {
  pending: { label: "Pending", color: "#F59E0B", Icon: Clock, bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50" },
  confirmed: { label: "Confirmed", color: "#3B82F6", Icon: CheckCircle2, bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-900/50" },
  processing: { label: "Processing", color: "#8B5CF6", Icon: Package, bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400", border: "border-violet-200 dark:border-violet-900/50" },
  shipped: { label: "Shipped", color: "#06B6D4", Icon: Truck, bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-900/50" },
  delivered: { label: "Delivered", color: "#10B981", Icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/50" },
  cancelled: { label: "Cancelled", color: "#EF4444", Icon: XCircle, bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-900/50" },
  returned: { label: "Returned", color: "#737373", Icon: AlertCircle, bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-700 dark:text-neutral-300", border: "border-neutral-200 dark:border-neutral-700" },
};

const PAYMENT_META = {
  pending: { label: "Unpaid", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  paid: { label: "Paid", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  failed: { label: "Failed", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" },
  refunded: { label: "Refunded", color: "text-neutral-700 dark:text-neutral-300", bg: "bg-neutral-100 dark:bg-neutral-800" },
};

const PAYMENT_ICONS = {
  cod: Banknote,
  card: CreditCard,
  wallet: Wallet,
};

const STATUS_OPTIONS = Object.keys(STATUS_META);
const PAYMENT_STATUS_OPTIONS = Object.keys(PAYMENT_META);

const formatPKR = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? `Rs ${num.toLocaleString("en-PK")}` : "Rs 0";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const relativeTime = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ─── Safe LS ─────────────────────────────────────── */
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

/* ─── Auth ────────────────────────────────────────── */
const isLoggedIn = () => {
  try {
    return !!localStorage.getItem("accessToken");
  } catch {
    return false;
  }
};
const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const isAdmin = () => {
  const u = getUser();
  return !!u && (u.role === "admin" || u.isAdmin === true);
};

/* ─── API ─────────────────────────────────────────── */
const getApiInstance = () => {
  const instance =
    API && typeof API.get === "function"
      ? API
      : axios.create({
          baseURL:
            (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
            "http://localhost:8000",
          headers: { "Content-Type": "application/json" },
        });
  if (!instance.__adminOrdersAuthAttached) {
    instance.interceptors.request.use(
      (config) => {
        try {
          const token = localStorage.getItem("accessToken");
          if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch {}
        return config;
      },
      (error) => Promise.reject(error)
    );
    instance.__adminOrdersAuthAttached = true;
  }
  return instance;
};
const api = getApiInstance();

/* ─── Normalize orders (works with server or local) ─── */
const normalizeOrder = (raw) => {
  if (!raw) return null;
  const items = Array.isArray(raw.items) ? raw.items : [];
  const totals = raw.totals || {};
  return {
    _id: raw._id || raw.id || raw.orderNumber,
    orderNumber:
      raw.orderNumber ||
      `FS-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt,
    customer: raw.customer || {},
    address: raw.address || {},
    items,
    shippingMethod: raw.shippingMethod || "standard",
    paymentMethod: raw.paymentMethod || "cod",
    paymentStatus: raw.paymentStatus || "pending",
    status: raw.status || "pending",
    couponCode: raw.couponCode || null,
    totals: {
      subtotal: Number(totals.subtotal) || 0,
      discount: Number(totals.discount) || 0,
      shipping: Number(totals.shipping) || 0,
      gst: Number(totals.gst) || 0,
      total: Number(totals.total) || Number(raw.total) || 0,
    },
    adminNotes: raw.adminNotes || "",
    trackingNumber: raw.trackingNumber || "",
    statusHistory: raw.statusHistory || [],
  };
};

/* ════════════════════════════════════════════════════════════
   Small UI pieces
   ════════════════════════════════════════════════════════════ */
const StatusPill = memo(function StatusPill({ status, size = "md" }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.Icon;
  const sizeCls =
    size === "sm"
      ? "h-6 px-2 text-[10.5px] gap-1"
      : "h-7 px-2.5 text-[11.5px] gap-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${meta.bg} ${meta.text} ${meta.border} ${sizeCls}`}
    >
      <Icon className="h-3 w-3" strokeWidth={2.6} />
      {meta.label}
    </span>
  );
});

const PaymentPill = memo(function PaymentPill({ status }) {
  const meta = PAYMENT_META[status] || PAYMENT_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${meta.bg} px-2 py-0.5 text-[10.5px] font-bold ${meta.color}`}
    >
      {meta.label}
    </span>
  );
});

const StatCard = memo(function StatCard({ icon: Icon, label, value, sub, accent = "neutral", delay = 0 }) {
  const accentMap = {
    neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500">
            {label}
          </p>
          <p className="ao-num mt-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              {sub}
            </p>
          )}
        </div>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentMap[accent]}`}>
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </span>
      </div>
    </motion.div>
  );
});

const SkeletonRow = () => (
  <tr className="border-b border-neutral-100 dark:border-neutral-800">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 w-full rounded ao-skeleton" />
      </td>
    ))}
  </tr>
);

/* ════════════════════════════════════════════════════════════
   Order details drawer
   ════════════════════════════════════════════════════════════ */
const OrderDrawer = memo(function OrderDrawer({ order, onClose, onUpdate, onDelete }) {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState("items");
  const [statusDraft, setStatusDraft] = useState(order.status);
  const [paymentDraft, setPaymentDraft] = useState(order.paymentStatus);
  const [trackingDraft, setTrackingDraft] = useState(order.trackingNumber || "");
  const [notesDraft, setNotesDraft] = useState(order.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const ref = useRef(null);

  /* Focus trap + Esc + scroll lock */
  useEffect(() => {
    const prev = document.activeElement;
    const body = document.body;
    const orig = { overflow: body.style.overflow, pr: body.style.paddingRight };
    const sb = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (sb > 0) body.style.paddingRight = `${sb}px`;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => ref.current?.focus?.(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = orig.overflow;
      body.style.paddingRight = orig.pr;
      prev?.focus?.();
    };
  }, [onClose]);

  const copyOrderNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast.success("Order number copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, [order.orderNumber]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onUpdate(order._id, {
        status: statusDraft,
        paymentStatus: paymentDraft,
        trackingNumber: trackingDraft,
      });
      if (notesDraft !== order.adminNotes) {
        await onUpdate(order._id, { adminNotes: notesDraft }, { notesOnly: true });
      }
      toast.success("Order updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  }, [order, statusDraft, paymentDraft, trackingDraft, notesDraft, onUpdate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const meta = STATUS_META[order.status] || STATUS_META.pending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${order.orderNumber}`}
      className="fixed inset-0 z-[100] flex justify-end"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <motion.aside
        ref={ref}
        tabIndex={-1}
        initial={reduceMotion ? false : { x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 34, stiffness: 340 }}
        className="relative flex h-full w-full max-w-xl flex-col border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 sm:max-w-2xl"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800 sm:p-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-500">
                Order
              </span>
              <StatusPill status={order.status} size="sm" />
            </div>
            <button
              onClick={copyOrderNumber}
              className="group mt-1.5 inline-flex items-center gap-2 text-left"
            >
              <span className="ao-num truncate text-base font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-lg">
                {order.orderNumber}
              </span>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
              ) : (
                <Copy className="h-3.5 w-3.5 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2.5} />
              )}
            </button>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              {formatDate(order.createdAt)} · {relativeTime(order.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print order"
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Printer className="h-4 w-4" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(order._id)}
              aria-label="Delete order"
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <nav
          role="tablist"
          aria-label="Order details"
          className="flex shrink-0 items-center gap-1 border-b border-neutral-100 px-2 dark:border-neutral-800 sm:px-3"
        >
          {[
            { id: "items", label: "Items" },
            { id: "customer", label: "Customer" },
            { id: "shipping", label: "Shipping" },
            { id: "notes", label: "Notes" },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`relative px-3 py-3 text-[12.5px] font-semibold transition-colors ${
                  active
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
              >
                {t.label}
                {active && (
                  <motion.span
                    layoutId="ao-active-tab"
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-neutral-900 dark:bg-neutral-100"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* ITEMS */}
          {tab === "items" && (
            <div>
              <ul className="space-y-3">
                {order.items.map((item, i) => (
                  <li
                    key={`${item.productId}-${i}`}
                    className="flex gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-950/40"
                  >
                    {item.image ? (
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13.5px] font-bold text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-neutral-500 dark:text-neutral-400">
                        {item.brand && <span>{item.brand}</span>}
                        {item.size && <span>Size {item.size}</span>}
                        <span className="ao-num">{formatPKR(item.price)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                          × {item.qty}
                        </span>
                        <span className="ao-num text-[13px] font-black text-neutral-900 dark:text-neutral-100">
                          {formatPKR((item.price || 0) * (item.qty || 1))}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="mt-5 rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  Order total
                </h4>
                <dl className="mt-3 space-y-1.5">
                  {[
                    ["Subtotal", formatPKR(order.totals.subtotal)],
                    order.totals.discount > 0 && [
                      `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
                      `− ${formatPKR(order.totals.discount)}`,
                      true,
                    ],
                    ["Shipping", order.totals.shipping === 0 ? "Free" : formatPKR(order.totals.shipping), false, order.totals.shipping === 0],
                    ["GST (5%)", formatPKR(order.totals.gst)],
                    ["Total", formatPKR(order.totals.total), false, false, true],
                  ]
                    .filter(Boolean)
                    .map((row, i) => {
                      const [label, value, isDiscount, isAccent, isTotal] = row;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between gap-3 ${
                            isTotal
                              ? "border-t border-neutral-200 pt-2.5 mt-2.5 dark:border-neutral-800"
                              : ""
                          }`}
                        >
                          <dt
                            className={`text-[12.5px] ${
                              isTotal
                                ? "font-bold text-neutral-900 dark:text-neutral-100"
                                : "text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {label}
                          </dt>
                          <dd
                            className={`ao-num text-[13px] ${
                              isTotal
                                ? "text-base font-black text-neutral-900 dark:text-neutral-100"
                                : isDiscount || isAccent
                                ? "font-bold text-emerald-600 dark:text-emerald-400"
                                : "font-semibold text-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            {value}
                          </dd>
                        </div>
                      );
                    })}
                </dl>
              </div>
            </div>
          )}

          {/* CUSTOMER */}
          {tab === "customer" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  Contact
                </h4>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <User className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2.4} />
                    <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                      {order.customer.fullName}
                    </span>
                  </div>
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="flex items-center gap-2.5 text-[12.5px] text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                    <span className="truncate">{order.customer.email}</span>
                  </a>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="flex items-center gap-2.5 text-[12.5px] text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                    <span className="ao-num">{order.customer.phone}</span>
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  Payment
                </h4>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[12.5px] text-neutral-600 dark:text-neutral-400">
                      {React.createElement(PAYMENT_ICONS[order.paymentMethod] || CreditCard, {
                        className: "h-3.5 w-3.5",
                        strokeWidth: 2.4,
                      })}
                      {order.paymentMethod === "cod"
                        ? "Cash on delivery"
                        : order.paymentMethod === "card"
                        ? "Credit / Debit card"
                        : "Mobile wallet"}
                    </span>
                    <PaymentPill status={order.paymentStatus} />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="text-neutral-600 dark:text-neutral-400">Shipping method</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                      {order.shippingMethod}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between gap-3 text-[12.5px]">
                      <span className="text-neutral-600 dark:text-neutral-400">Tracking</span>
                      <span className="ao-num font-semibold text-neutral-900 dark:text-neutral-100">
                        {order.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SHIPPING */}
          {tab === "shipping" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  Delivery address
                </h4>
                <div className="mt-3 flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2.4} />
                  <p className="text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {order.address.line1}
                    {order.address.line2 && (
                      <>
                        <br />
                        {order.address.line2}
                      </>
                    )}
                    <br />
                    {order.address.city}, {order.address.province} {order.address.postalCode}
                    <br />
                    {order.address.country}
                  </p>
                </div>
              </div>

              {/* Update status form */}
              <div className="rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  Update status
                </h4>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Order status
                    </label>
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Payment status
                    </label>
                    <select
                      value={paymentDraft}
                      onChange={(e) => setPaymentDraft(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                    >
                      {PAYMENT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {PAYMENT_META[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11.5px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Tracking number
                    </label>
                    <input
                      type="text"
                      value={trackingDraft}
                      onChange={(e) => setTrackingDraft(e.target.value)}
                      placeholder="e.g. TCS-123456789"
                      className="ao-num w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100"
                    />
                  </div>
                </div>
              </div>

              {/* Status history */}
              {order.statusHistory?.length > 0 && (
                <div className="rounded-2xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                    History
                  </h4>
                  <ol className="mt-3 space-y-3">
                    {[...order.statusHistory].reverse().map((h, i) => {
                      const m = STATUS_META[h.status] || STATUS_META.pending;
                      const Icon = m.Icon;
                      return (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${m.bg} ${m.text}`}>
                            <Icon className="h-3 w-3" strokeWidth={2.6} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-semibold text-neutral-900 dark:text-neutral-100">
                              {m.label}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {formatDate(h.at)}
                              {h.note && ` · ${h.note}`}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* NOTES */}
          {tab === "notes" && (
            <div>
              <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Internal notes
              </label>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={6}
                placeholder="Add notes visible only to your team…"
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white p-3.5 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100"
              />
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Notes are saved when you click "Save changes" below.
              </p>
            </div>
          )}
        </div>

        {/* Footer — Save */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" strokeWidth={2.5} />
                Save changes
              </>
            )}
          </button>
        </footer>
      </motion.aside>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   Main — AdminOrders
   ════════════════════════════════════════════════════════════ */
const AdminOrders = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  /* Gate: admin only */
  const admin = useMemo(() => isAdmin(), []);
  const loggedIn = useMemo(() => isLoggedIn(), []);

  /* Data */
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingLocal, setUsingLocal] = useState(false);

  /* Filters + sort + pagination */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  /* Selected order drawer */
  const [selected, setSelected] = useState(null);

  /* Debounced search */
  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  /* Reset page on filter change */
  useEffect(() => {
    setPage(1);
  }, [searchDebounced, statusFilter, paymentFilter, sortBy, sortDir]);

  /* Fetch orders + stats */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (admin && loggedIn) {
        const res = await api.get("/api/orders", {
          params: {
            page,
            limit: PAGE_SIZE,
            search: searchDebounced,
            status: statusFilter,
            paymentStatus: paymentFilter,
            sort: sortBy,
            dir: sortDir,
          },
        });

        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        const pag = res?.data?.pagination || {};

        setOrders(data.map(normalizeOrder));
        setTotal(pag.total || data.length);
        setHasMore(!!pag.hasMore);
        setUsingLocal(false);

        /* Load stats separately */
        try {
          const statsRes = await api.get("/api/orders/stats");
          setStats(statsRes?.data?.data || null);
        } catch (e) {
          // Non-fatal
        }
      } else {
        /* Fallback: read local orders from fs_orders (guest/checkout-placed) */
        const local = readLS(LS_ORDERS, []);
        const normalized = (Array.isArray(local) ? local : []).map(normalizeOrder);
        const filtered = normalized.filter((o) => {
          if (statusFilter && o.status !== statusFilter) return false;
          if (paymentFilter && o.paymentStatus !== paymentFilter) return false;
          if (searchDebounced) {
            const q = searchDebounced.toLowerCase();
            return (
              o.orderNumber.toLowerCase().includes(q) ||
              o.customer.fullName?.toLowerCase().includes(q) ||
              o.customer.email?.toLowerCase().includes(q) ||
              o.customer.phone?.toLowerCase().includes(q)
            );
          }
          return true;
        });

        const sorted = [...filtered].sort((a, b) => {
          const av = a[sortBy];
          const bv = b[sortBy];
          if (sortBy === "createdAt") {
            const d = new Date(a.createdAt) - new Date(b.createdAt);
            return sortDir === "asc" ? d : -d;
          }
          if (typeof av === "string") {
            return sortDir === "asc"
              ? av.localeCompare(bv)
              : bv.localeCompare(av);
          }
          return sortDir === "asc" ? av - bv : bv - av;
        });

        const start = (page - 1) * PAGE_SIZE;
        const paged = sorted.slice(start, start + PAGE_SIZE);

        setOrders(paged);
        setTotal(sorted.length);
        setHasMore(start + paged.length < sorted.length);
        setUsingLocal(true);
        setStats(null);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, searchDebounced, statusFilter, paymentFilter, sortBy, sortDir, admin, loggedIn]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* Update order */
  const handleUpdate = useCallback(
    async (id, patch, opts = {}) => {
      /* Optimistic */
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, ...patch } : o))
      );
      setSelected((prev) => (prev && prev._id === id ? { ...prev, ...patch } : prev));

      if (!usingLocal && admin && loggedIn) {
        if (opts.notesOnly) {
          await api.patch(`/api/orders/${id}/notes`, {
            adminNotes: patch.adminNotes,
          });
        } else {
          await api.patch(`/api/orders/${id}/status`, patch);
        }
      } else {
        /* Persist to fs_orders */
        const all = readLS(LS_ORDERS, []);
        const next = (Array.isArray(all) ? all : []).map((o) =>
          (o._id || o.orderNumber) === id ? { ...o, ...patch } : o
        );
        writeLS(LS_ORDERS, next);
      }
    },
    [usingLocal, admin, loggedIn]
  );

  /* Delete order */
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this order permanently?")) return;
      try {
        if (!usingLocal && admin && loggedIn) {
          await api.delete(`/api/orders/${id}`);
        } else {
          const all = readLS(LS_ORDERS, []);
          const next = (Array.isArray(all) ? all : []).filter(
            (o) => (o._id || o.orderNumber) !== id
          );
          writeLS(LS_ORDERS, next);
        }
        setOrders((prev) => prev.filter((o) => o._id !== id));
        setSelected(null);
        toast.success("Order deleted");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete");
      }
    },
    [usingLocal, admin, loggedIn]
  );

  /* Refresh */
  const refresh = useCallback(() => {
    fetchOrders();
    toast.success("Orders refreshed");
  }, [fetchOrders]);

  /* Export CSV */
  const exportCSV = useCallback(() => {
    if (orders.length === 0) {
      toast.error("No orders to export");
      return;
    }
    const headers = [
      "Order Number",
      "Date",
      "Customer",
      "Email",
      "Phone",
      "City",
      "Province",
      "Items",
      "Subtotal",
      "Discount",
      "Shipping",
      "GST",
      "Total",
      "Payment",
      "Status",
    ];
    const rows = orders.map((o) => [
      o.orderNumber,
      formatDate(o.createdAt),
      o.customer.fullName,
      o.customer.email,
      o.customer.phone,
      o.address.city,
      o.address.province,
      o.items.reduce((s, i) => s + (i.qty || 0), 0),
      o.totals.subtotal,
      o.totals.discount,
      o.totals.shipping,
      o.totals.gst,
      o.totals.total,
      o.paymentMethod,
      o.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `featheredshop-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  }, [orders]);

  /* ─── Auth gate ─────────────────────────────── */
  if (!loggedIn || !admin) {
    return (
      <div className="ao-hd-root flex min-h-dvh items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
        <style>{HD_CSS}</style>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <AlertCircle className="h-7 w-7 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="ao-serif text-2xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            {loggedIn ? "Admin access required" : "Please log in"}
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {loggedIn
              ? "You don't have permission to view this page."
              : "Log in with your admin account to manage orders."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[13.5px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Go home
            </Link>
            {!loggedIn && (
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[13.5px] font-bold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = search || statusFilter || paymentFilter;

  return (
    <div className="ao-hd-root min-h-dvh bg-neutral-50/60 pb-10 dark:bg-neutral-950">
      <style>{HD_CSS}</style>

      {/* Header */}
      <header className="border-b border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 sm:pt-10 md:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="h-px w-8 bg-zinc-900 dark:bg-white" />
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">
                  Admin · Orders
                </span>
              </div>
              <h1 className="ao-serif mt-3 text-[clamp(1.9rem,1.3rem+2.4vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                Orders
              </h1>
              <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-400 sm:text-[13.5px]">
                {total.toLocaleString()} order{total === 1 ? "" : "s"}
                {hasFilters && " · filtered"}
                {usingLocal && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    Local data
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                aria-label="Refresh orders"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2.4} />
                Refresh
              </button>
              <button
                type="button"
                onClick={exportCSV}
                disabled={orders.length === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.4} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 lg:px-10">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.counts.total.toLocaleString()} sub={`${stats.counts.today} today`} delay={0.02} />
            <StatCard icon={Clock} label="Pending" value={stats.counts.pending.toLocaleString()} sub="Awaiting action" accent="amber" delay={0.06} />
            <StatCard icon={Package} label="Processing" value={stats.counts.processing.toLocaleString()} sub="Being prepared" accent="violet" delay={0.1} />
            <StatCard icon={Truck} label="Shipped" value={stats.counts.shipped.toLocaleString()} sub="In transit" accent="blue" delay={0.14} />
            <StatCard icon={TrendingUp} label="Revenue" value={formatPKR(stats.revenue.allTime)} sub={`${formatPKR(stats.revenue.month)} this month`} accent="emerald" delay={0.18} />
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={2.4} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, customer, email, phone…"
              aria-label="Search orders"
              className="w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 py-2.5 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-700 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:focus:border-neutral-100"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter by payment"
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-700 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:focus:border-neutral-100"
          >
            <option value="">All payments</option>
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_META[s].label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}:${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split(":");
              setSortBy(sb);
              setSortDir(sd);
            }}
            aria-label="Sort orders"
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-700 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:focus:border-neutral-100"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="totals.total:desc">Highest total</option>
            <option value="totals.total:asc">Lowest total</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setPaymentFilter("");
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
              Clear
            </button>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" strokeWidth={2.4} />
            <div className="flex-1 text-[12.5px] text-red-700 dark:text-red-300">
              {error}
            </div>
            <button
              type="button"
              onClick={refresh}
              className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Orders table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40">
                <tr>
                  {["Order", "Customer", "Items", "Total", "Payment", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
                      </div>
                      <p className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                        {hasFilters ? "No orders match these filters" : "No orders yet"}
                      </p>
                      <p className="mt-1 text-[12px] text-neutral-400">
                        {hasFilters ? "Try clearing filters" : "New orders will appear here"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const itemCount = o.items.reduce((s, i) => s + (i.qty || 0), 0);
                    return (
                      <tr
                        key={o._id}
                        onClick={() => setSelected(o)}
                        className="cursor-pointer border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-950/40"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="ao-num text-[13px] font-bold text-neutral-900 dark:text-neutral-100">
                              {o.orderNumber}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {relativeTime(o.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="line-clamp-1 text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                              {o.customer.fullName}
                            </span>
                            <span className="truncate text-[11.5px] text-neutral-400">
                              {o.customer.email}
                            </span>
                          </div>
                        </td>
                        <td className="ao-num whitespace-nowrap px-4 py-3.5 text-[13px] text-neutral-700 dark:text-neutral-300">
                          {itemCount}
                        </td>
                        <td className="ao-num whitespace-nowrap px-4 py-3.5 text-[13px] font-bold text-neutral-900 dark:text-neutral-100">
                          {formatPKR(o.totals.total)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <PaymentPill status={o.paymentStatus} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <StatusPill status={o.status} size="sm" />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <ChevronRight className="inline h-4 w-4 text-neutral-400" strokeWidth={2.4} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 lg:hidden">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex gap-3 p-4">
                  <div className="h-16 w-16 shrink-0 rounded-xl ao-skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded ao-skeleton" />
                    <div className="h-3 w-1/2 rounded ao-skeleton" />
                  </div>
                </li>
              ))
            ) : orders.length === 0 ? (
              <li className="py-16 text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
                </div>
                <p className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                  {hasFilters ? "No orders match" : "No orders yet"}
                </p>
              </li>
            ) : (
              orders.map((o) => {
                const itemCount = o.items.reduce((s, i) => s + (i.qty || 0), 0);
                const firstItem = o.items[0];
                return (
                  <li key={o._id}>
                    <button
                      type="button"
                      onClick={() => setSelected(o)}
                      className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-950/40"
                    >
                      {firstItem?.image ? (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                          <img
                            src={firstItem.image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                          <Package className="h-6 w-6 text-neutral-400" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="ao-num truncate text-[12.5px] font-bold text-neutral-900 dark:text-neutral-100">
                            {o.orderNumber}
                          </span>
                          <StatusPill status={o.status} size="sm" />
                        </div>
                        <p className="mt-1 truncate text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
                          {o.customer.fullName}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="ao-num text-[13px] font-black text-neutral-900 dark:text-neutral-100">
                            {formatPKR(o.totals.total)}
                          </span>
                          <span className="text-[10.5px] text-neutral-400">
                            {itemCount} item{itemCount === 1 ? "" : "s"} · {relativeTime(o.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Pagination */}
        {!loading && total > PAGE_SIZE && (
          <nav
            aria-label="Orders pagination"
            className="mt-5 flex flex-wrap items-center justify-between gap-3"
          >
            <p className="ao-num text-[12.5px] text-neutral-500 dark:text-neutral-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                Prev
              </button>
              <span className="ao-num rounded-full bg-neutral-100 px-3.5 py-2 text-[12px] font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            </div>
          </nav>
        )}
      </main>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <OrderDrawer
            key={selected._id}
            order={selected}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
