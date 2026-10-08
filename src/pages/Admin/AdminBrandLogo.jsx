/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import API from "@/utils/api";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check,
  GripVertical,
  Save,
  RefreshCw,
  ArrowLeft,
  Package,
  ExternalLink,
  Globe,
  Sparkles,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  Reorder,
  useReducedMotion,
} from "framer-motion";

/* ════════════════════════════════════════════════════════════
   CONFIG
   ════════════════════════════════════════════════════════════ */
const TOKEN_KEY = "accessToken";
const BRANDS_UPDATE_EVENT = "feathered:brands:update";
const BRANDS_VERSION_KEY = "fs_brands_version";

/* ════════════════════════════════════════════════════════════
   Notify the storefront that brands changed
   - fires a custom window event (same-tab listeners)
   - bumps a sessionStorage version marker so OTHER tabs pick
     up the change via the native "storage" event
   ════════════════════════════════════════════════════════════ */
const announceBrandsUpdate = () => {
  try {
    sessionStorage.setItem(BRANDS_VERSION_KEY, String(Date.now()));
  } catch {}
  try {
    window.dispatchEvent(new Event(BRANDS_UPDATE_EVENT));
  } catch {}
};

/* ════════════════════════════════════════════════════════════
   HD CSS
   ════════════════════════════════════════════════════════════ */
const HD_CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Public+Sans:wght@400..800&display=swap");

  .ab-hd-root {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  .ab-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0;
    letter-spacing: -0.02em;
  }
  .ab-num { font-variant-numeric: tabular-nums; }

  .ab-hd-root :focus-visible {
    outline: 2px solid #171717;
    outline-offset: 2px;
  }
  .dark .ab-hd-root :focus-visible {
    outline-color: #fafafa;
  }

  .ab-hd-root input,
  .ab-hd-root textarea,
  .ab-hd-root select { outline: none; }
  .ab-hd-root input:focus,
  .ab-hd-root input:focus-visible,
  .ab-hd-root textarea:focus,
  .ab-hd-root textarea:focus-visible,
  .ab-hd-root select:focus,
  .ab-hd-root select:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .ab-skeleton {
    background: linear-gradient(90deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.05) 100%);
    background-size: 200% 100%;
    animation: ab-shimmer 1.4s ease-in-out infinite;
  }
  .dark .ab-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 100%);
    background-size: 200% 100%;
  }
  @keyframes ab-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @media (prefers-reduced-motion: reduce) { .ab-skeleton { animation: none; } }
`;

/* ════════════════════════════════════════════════════════════
   API
   ════════════════════════════════════════════════════════════ */
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
  if (!instance.__adminBrandsAttached) {
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
    instance.__adminBrandsAttached = true;
  }
  return instance;
};
const api = getApiInstance();

/* ════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════ */
const normalizeBrand = (raw) => ({
  _id: raw._id,
  name: raw.name || "",
  slug: raw.slug || "",
  description: raw.description || "",
  logo: raw.logo || "",
  coverImage: raw.coverImage || "",
  website: raw.website || "",
  featured: !!raw.featured,
  isActive: raw.isActive !== false,
  order: Number(raw.order) || 0,
  productCount: Number(raw.productCount) || 0,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const emptyForm = () => ({
  name: "",
  description: "",
  logo: "",
  coverImage: "",
  website: "",
  featured: false,
  isActive: true,
});

/* ════════════════════════════════════════════════════════════
   BrandAvatar
   ════════════════════════════════════════════════════════════ */
const BrandAvatar = memo(function BrandAvatar({ brand, size = 48 }) {
  const [broken, setBroken] = useState(false);
  const dims = { width: size, height: size };

  useEffect(() => {
    setBroken(false);
  }, [brand.logo]);

  if (brand.logo && !broken) {
    return (
      <div
        style={dims}
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <img
          src={brand.logo}
          alt={brand.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-1.5"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  return (
    <div
      style={dims}
      className="flex shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[13px] font-black tracking-tight text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
    >
      {initials(brand.name)}
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   BrandFormModal
   ════════════════════════════════════════════════════════════ */
const BrandFormModal = memo(function BrandFormModal({
  open,
  initial,
  onClose,
  onSave,
  busy,
}) {
  const [form, setForm] = useState(initial || emptyForm());
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial || emptyForm());
      setErrors({});
    }
  }, [open, initial]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length > 80) errs.name = "Max 80 characters";

    if (form.website && !/^https?:\/\/[^\s]+$/i.test(form.website.trim())) {
      errs.website = "Must be a valid URL (http:// or https://)";
    }
    if (form.description.length > 300) {
      errs.description = "Max 300 characters";
    }
    return errs;
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await api.post("/api/brands/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res?.data?.data?.url || res?.data?.url;
      if (url) {
        setField("logo", url);
        toast.success("Logo uploaded");
      } else {
        toast.error("Upload succeeded but no URL returned");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't upload the image"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      logo: form.logo.trim(),
      coverImage: form.coverImage.trim(),
      website: form.website.trim(),
    });
  };

  if (!open) return null;

  const inputBase =
    "w-full rounded-xl border bg-white px-3.5 py-3 text-base text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:text-[13.5px]";
  const inputCls = (err) =>
    `${inputBase} ${
      err
        ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:border-red-900/60 dark:focus:ring-red-900/30"
        : "border-neutral-200 focus:border-neutral-400 focus:ring-neutral-100 dark:border-neutral-800 dark:focus:border-neutral-600 dark:focus:ring-neutral-800"
    }`;

  const isEdit = !!(initial && initial._id);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-neutral-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={busy ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-form-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900 sm:rounded-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div>
            <h2
              id="brand-form-title"
              className="ab-serif text-lg font-medium text-neutral-900 dark:text-neutral-100 sm:text-xl"
            >
              {isEdit ? "Edit brand" : "Add new brand"}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-neutral-500 dark:text-neutral-400">
              {isEdit ? "Update details and logo" : "Add a new brand to your storefront"}
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="ab-hd-root flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {/* Logo + name */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Logo
                </p>
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950">
                  {form.logo ? (
                    <img
                      src={form.logo}
                      alt=""
                      className="h-full w-full object-contain p-2"
                      onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-neutral-300 dark:text-neutral-600" strokeWidth={1.5} />
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    handleUpload(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" strokeWidth={2.4} />
                  )}
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                {form.logo && (
                  <button
                    type="button"
                    onClick={() => setField("logo", "")}
                    className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-neutral-400 transition-colors hover:text-red-600"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                    Remove
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="e.g. New Balance"
                    autoFocus
                    className={inputCls(errors.name)}
                  />
                  {errors.name && (
                    <p
                      role="alert"
                      className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Logo URL{" "}
                    <span className="font-normal normal-case text-neutral-400">
                      (or upload above)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => setField("logo", e.target.value)}
                    placeholder="https://cdn.simpleicons.org/nike/1A1A1A"
                    className={inputCls(false)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
                maxLength={350}
                placeholder="Short blurb shown on the brand card"
                className={`${inputCls(errors.description)} resize-none`}
              />
              <div className="mt-1 flex justify-between text-[10.5px] text-neutral-400">
                <span>{errors.description || "Optional"}</span>
                <span
                  className={`ab-num ${
                    form.description.length > 300
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {form.description.length}/300
                </span>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://example.com"
                className={inputCls(errors.website)}
              />
              {errors.website && (
                <p
                  role="alert"
                  className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
                  {errors.website}
                </p>
              )}
            </div>

            {/* Toggles */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/40">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-neutral-900 dark:text-neutral-100">
                    Featured
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Highlight at the top of the list
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField("featured", e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/40">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-neutral-900 dark:text-neutral-100">
                    Active
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Visible on the storefront
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>
            </div>
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
              {isEdit ? "Save changes" : "Add brand"}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   ConfirmDialog
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
        <h3 className="ab-serif text-xl font-medium text-neutral-900 dark:text-neutral-100">
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
   BrandRow
   ════════════════════════════════════════════════════════════ */
const BrandRow = memo(function BrandRow({
  brand,
  busy,
  onEdit,
  onToggleFeatured,
  onToggleActive,
  onDelete,
}) {
  const reduceMotion = useReducedMotion();
  return (
    <Reorder.Item
      value={brand}
      id={brand._id}
      className={`group relative flex flex-col gap-3 rounded-2xl border bg-white p-3 transition-all dark:bg-neutral-900 sm:flex-row sm:items-center sm:gap-4 sm:p-4 ${
        brand.isActive
          ? "border-neutral-200/80 dark:border-neutral-800/80"
          : "border-dashed border-neutral-300 opacity-70 dark:border-neutral-700"
      } ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      <button
        type="button"
        aria-label={`Drag ${brand.name} to reorder`}
        className="absolute left-1 top-1/2 hidden h-8 w-8 -translate-y-1/2 cursor-grab items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing dark:hover:bg-neutral-800 dark:hover:text-neutral-300 sm:flex"
      >
        <GripVertical className="h-4 w-4" strokeWidth={2.4} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3 pl-0 sm:pl-8">
        <BrandAvatar brand={brand} size={52} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[14px] font-bold text-neutral-900 dark:text-neutral-100">
              {brand.name}
            </h3>
            {brand.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-amber-950">
                <Star className="h-2.5 w-2.5 fill-amber-950" strokeWidth={0} />
                Featured
              </span>
            )}
            {!brand.isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Hidden
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-neutral-500 dark:text-neutral-400">
            <span className="ab-num">
              {brand.productCount} product
              {brand.productCount === 1 ? "" : "s"}
            </span>
            {brand.description && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span className="line-clamp-1">{brand.description}</span>
              </>
            )}
            {brand.website && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <Globe className="h-3 w-3" strokeWidth={2.4} />
                  Visit
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 pl-0 sm:pl-2">
        <button
          type="button"
          onClick={() => onToggleFeatured(brand)}
          disabled={busy}
          title={brand.featured ? "Unfeature" : "Feature"}
          aria-label={brand.featured ? "Unfeature" : "Feature"}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
            brand.featured
              ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          }`}
        >
          <Star
            className={`h-4 w-4 ${brand.featured ? "fill-amber-500" : ""}`}
            strokeWidth={2}
          />
        </button>

        <button
          type="button"
          onClick={() => onToggleActive(brand)}
          disabled={busy}
          title={brand.isActive ? "Hide from storefront" : "Show on storefront"}
          aria-label={brand.isActive ? "Hide from storefront" : "Show on storefront"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          {brand.isActive ? (
            <Eye className="h-4 w-4" strokeWidth={2} />
          ) : (
            <EyeOff className="h-4 w-4" strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={() => onEdit(brand)}
          disabled={busy}
          title="Edit"
          aria-label={`Edit ${brand.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <Pencil className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(brand)}
          disabled={busy}
          title="Delete"
          aria-label={`Delete ${brand.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </Reorder.Item>
  );
});

/* ════════════════════════════════════════════════════════════
   Skeleton
   ════════════════════════════════════════════════════════════ */
const SkeletonRow = () => (
  <li className="flex items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800/70 dark:bg-neutral-900">
    <div className="h-12 w-12 shrink-0 rounded-xl ab-skeleton" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 rounded ab-skeleton" />
      <div className="h-3 w-48 rounded ab-skeleton" />
    </div>
    <div className="h-8 w-8 rounded-full ab-skeleton" />
    <div className="h-8 w-8 rounded-full ab-skeleton" />
    <div className="h-8 w-8 rounded-full ab-skeleton" />
  </li>
);

/* ════════════════════════════════════════════════════════════
   EmptyState
   ════════════════════════════════════════════════════════════ */
const EmptyState = memo(function EmptyState({ hasFilters, onAdd, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-md rounded-3xl border border-dashed border-neutral-300 bg-white/70 px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900/50 sm:px-10 sm:py-16"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        <Sparkles className="h-7 w-7 text-neutral-400" strokeWidth={1.5} />
      </div>
      <h2 className="ab-serif text-2xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        {hasFilters ? "No matches" : "No brands yet"}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
        {hasFilters
          ? "Try a different search or clear the filters."
          : "Add your first brand to get started."}
      </p>
      <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-[13.5px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Clear filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-[13.5px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            Add your first brand
          </button>
        )}
      </div>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════
   Main
   ════════════════════════════════════════════════════════════ */
const AdminBrandLogo = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* ── Fetch ──────────────────────────────────────── */
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: 1,
        limit: 200,
        sort: "order",
        dir: "asc",
      };
      if (searchInput.trim()) params.search = searchInput.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (featuredFilter) params.featured = "true";

      const res = await api.get("/api/brands/admin", { params });
      const raw = Array.isArray(res?.data?.data) ? res.data.data : [];
      if (!mountedRef.current) return;
      setBrands(raw.map(normalizeBrand));
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("fetchBrands:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load brands"
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [searchInput, statusFilter, featuredFilter]);

  useEffect(() => {
    const t = setTimeout(fetchBrands, searchInput ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchBrands, retryKey]);

  /* ── Actions ────────────────────────────────────── */
  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (brand) => {
    setEditing(brand);
    setFormOpen(true);
  };

  const handleSave = async (form) => {
    setBusy(true);
    try {
      if (editing && editing._id) {
        const res = await api.patch(`/api/brands/${editing._id}`, form);
        const updated = normalizeBrand(res?.data?.data || form);
        setBrands((prev) =>
          prev.map((b) => (b._id === editing._id ? updated : b))
        );
        toast.success("Brand updated");
      } else {
        const res = await api.post("/api/brands", form);
        const created = normalizeBrand(res?.data?.data);
        setBrands((prev) => [...prev, created]);
        toast.success("Brand added");
      }
      /* Notify storefront */
      announceBrandsUpdate();
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't save the brand"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleToggleFeatured = async (brand) => {
    const prev = [...brands];
    setBrands((list) =>
      list.map((b) =>
        b._id === brand._id ? { ...b, featured: !b.featured } : b
      )
    );
    try {
      await api.patch(`/api/brands/${brand._id}/toggle-featured`);
      announceBrandsUpdate();
    } catch (err) {
      setBrands(prev);
      toast.error(
        err?.response?.data?.message || "Couldn't update featured"
      );
    }
  };

  const handleToggleActive = async (brand) => {
    const prev = [...brands];
    setBrands((list) =>
      list.map((b) =>
        b._id === brand._id ? { ...b, isActive: !b.isActive } : b
      )
    );
    try {
      await api.patch(`/api/brands/${brand._id}/toggle-active`);
      announceBrandsUpdate();
    } catch (err) {
      setBrands(prev);
      toast.error(
        err?.response?.data?.message || "Couldn't update visibility"
      );
    }
  };

  const handleDeleteConfirm = async () => {
    const brand = confirmDelete;
    if (!brand) return;
    setBusy(true);
    try {
      await api.delete(`/api/brands/${brand._id}`);
      setBrands((prev) => prev.filter((b) => b._id !== brand._id));
      announceBrandsUpdate();
      toast.success("Brand deleted");
      setConfirmDelete(null);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message || "Couldn't delete the brand";
      if (status === 409) {
        toast.error(msg, {
          description:
            "Reassign the products to a different brand, or hide this one instead.",
          duration: 7000,
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  /* ── Reorder ────────────────────────────────────── */
  const handleReorder = useCallback(async (reordered) => {
    setBrands(reordered);
    try {
      await api.patch("/api/brands/reorder", {
        order: reordered.map((b) => b._id),
      });
      announceBrandsUpdate();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't save the new order"
      );
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setStatusFilter("all");
    setFeaturedFilter(false);
  }, []);

  /* ── Derived ────────────────────────────────────── */
  const filtered = brands;

  const stats = useMemo(
    () => ({
      total: brands.length,
      active: brands.filter((b) => b.isActive).length,
      featured: brands.filter((b) => b.featured).length,
    }),
    [brands]
  );

  const hasFilters =
    searchInput.trim() !== "" ||
    statusFilter !== "all" ||
    featuredFilter;

  return (
    <div className="ab-hd-root min-h-dvh bg-neutral-50/60 pb-16 dark:bg-neutral-950">
      <style>{HD_CSS}</style>

      {/* Breadcrumb */}
      <div className="border-b border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 sm:text-xs"
          >
            <Link
              to="/admin/dashboard"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Admin
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span
              aria-current="page"
              className="font-medium text-neutral-900 dark:text-neutral-100"
            >
              Brands
            </span>
          </nav>
          <Link
            to="/brands"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 sm:text-[12px]"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.4} />
            View public page
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
                Admin
              </span>
            </div>
            <h1 className="ab-serif mt-3 text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
              Manage Brands
            </h1>
            <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-400 sm:text-[13.5px]">
              {loading
                ? "Loading brands…"
                : `${stats.total} brand${
                    stats.total === 1 ? "" : "s"
                  } · ${stats.active} active · ${stats.featured} featured`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              aria-label="Refresh brands"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                strokeWidth={2.4}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2.5 text-[12.5px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
              Add brand
            </button>
          </div>
        </div>

        {/* Stat tiles */}
        {!loading && brands.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: stats.total },
              { label: "Active", value: stats.active },
              { label: "Featured", value: stats.featured },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-neutral-200/70 bg-white p-3 dark:border-neutral-800/70 dark:bg-neutral-900 sm:p-4"
              >
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
                  {s.label}
                </p>
                <p className="ab-num mt-1 text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 lg:px-10">
        {/* Search + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              strokeWidth={2.4}
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search brands by name…"
              aria-label="Search brands"
              className="w-full rounded-full border border-neutral-200 bg-white pl-10 pr-10 py-2.5 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="rounded-full border border-neutral-200 bg-white py-2.5 pl-4 pr-9 text-[13px] font-semibold text-neutral-800 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Hidden only</option>
            </select>

            <button
              type="button"
              onClick={() => setFeaturedFilter((v) => !v)}
              aria-pressed={featuredFilter}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-[12px] font-semibold transition-colors ${
                featuredFilter
                  ? "border-transparent bg-amber-400 text-amber-950"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600"
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  featuredFilter ? "fill-amber-950" : ""
                }`}
                strokeWidth={featuredFilter ? 0 : 2.4}
              />
              Featured
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/20">
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              strokeWidth={2.4}
            />
            <div className="flex-1 text-[12.5px] text-red-700 dark:text-red-300">
              {error}
            </div>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="shrink-0 rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <ul className="space-y-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onAdd={handleAdd}
              onClear={clearFilters}
            />
          ) : (
            <Reorder.Group
              axis="y"
              values={brands}
              onReorder={handleReorder}
              className="space-y-2.5"
              as="ul"
            >
              {brands.map((brand) => (
                <BrandRow
                  key={brand._id}
                  brand={brand}
                  busy={busy}
                  onEdit={handleEdit}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleActive={handleToggleActive}
                  onDelete={(b) => setConfirmDelete(b)}
                />
              ))}
            </Reorder.Group>
          )}

          {!loading && filtered.length > 0 && (
            <p className="mt-6 text-center text-[11.5px] text-neutral-400">
              Showing {filtered.length} of {brands.length} brand
              {brands.length === 1 ? "" : "s"}
              {hasFilters && " · filtered"} · drag to reorder
            </p>
          )}
        </div>
      </main>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {formOpen && (
          <BrandFormModal
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
            title="Delete this brand?"
            message={`"${confirmDelete.name}" will be permanently removed. This cannot be undone.`}
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

export default AdminBrandLogo;