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
  Heart,
  ShoppingBag,
  Search,
  X,
  ArrowRight,
  Sparkles,
  Trash2,
  Star,
  TrendingUp,
  Tag,
  Filter,
  Check,
  Loader2,
  Info,
  Share2,
  SlidersHorizontal,
  Grid2x2,
  Rows3,
  ArrowDownUp,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  BadgePercent,
  PackageX,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import API from "@/utils/api";
import { getData } from "@/context/userContext";

/* ════════════════════════════════════════════════════════════
   CONFIG
   ════════════════════════════════════════════════════════════ */
const WISHLIST_KEY = "fn_shop_wishlist";
const CART_KEY = "fs_cart";
const VIEW_KEY = "fs_wishlist_view";
const PREFS_KEY = "fs_wishlist_prefs";
const TOKEN_KEY = "accessToken";

const CART_EVENT = "feathered:cart:update";
const WISHLIST_EVENT = "feathered:wishlist:update";

/* ════════════════════════════════════════════════════════════
   HD CSS
   ════════════════════════════════════════════════════════════ */
const HD_CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Public+Sans:wght@400..800&display=swap");

  .wl-hd-root {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    -webkit-tap-highlight-color: transparent;
  }
  .wl-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0;
    letter-spacing: -0.02em;
  }
  .wl-num {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1, "kern" 1;
  }
  .wl-hd-root :focus-visible { outline: 2px solid #171717; outline-offset: 2px; }
  .dark .wl-hd-root :focus-visible { outline-color: #fafafa; }

  .wl-scroll::-webkit-scrollbar { height: 6px; }
  .wl-scroll::-webkit-scrollbar-track { background: transparent; }
  .wl-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 9999px; }
  .dark .wl-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); }
`;

/* ════════════════════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════════════════════ */
const formatPKR = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? `Rs ${num.toLocaleString("en-PK")}` : "Rs 0";
};

const FALLBACK_IMG =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22600%22%3E%3Crect%20width%3D%22600%22%20height%3D%22600%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Ctext%20x%3D%22300%22%20y%3D%22300%22%20font-family%3D%22Arial%22%20font-size%3D%2224%22%20fill%3D%22%23999%22%20text-anchor%3D%22middle%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

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
const readRaw = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
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
  if (!instance.__wishlistAuthAttached) {
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
    instance.__wishlistAuthAttached = true;
  }
  return instance;
};
const api = getApiInstance();

const itemKey = (productId, size) => `${productId}__${size || "one"}`;

/* Normalize any wishlist entry into a consistent shape */
const normalizeWishItem = (raw) => {
  if (!raw) return null;
  const productId = raw.productId || raw._id || raw.id;
  if (!productId) return null;
  const size = raw.size ?? null;
  const reg = Number(raw.regularPrice ?? raw.price) || 0;
  const sale = Number(raw.salePrice) || 0;
  const price = sale > 0 && sale < reg ? sale : reg;
  return {
    id: raw.id || itemKey(productId, size),
    productId: String(productId),
    slug: raw.slug || "",
    name: raw.name || raw.title || "Untitled product",
    brand: raw.brand || "",
    image: raw.image || raw.images?.[0] || null,
    price,
    regularPrice: reg || price,
    salePrice: sale,
    size,
    variant: raw.variant || (size ? `Size ${size}` : null),
    inStock: raw.inStock !== false && raw.stockQuantity !== 0,
    addedAt: raw.addedAt || Date.now(),
    /* Track the price at the time of saving so we can detect drops */
    priceAtSave: Number(raw.priceAtSave) || price,
  };
};

const discountPercent = (item) => {
  if (!item.salePrice || item.salePrice >= item.regularPrice) return 0;
  return Math.round(
    ((item.regularPrice - item.salePrice) / item.regularPrice) * 100
  );
};

const priceDroppedBy = (item) => {
  if (!item.priceAtSave || item.priceAtSave <= item.price) return 0;
  return Math.round(item.priceAtSave - item.price);
};

/* ════════════════════════════════════════════════════════════
   Hook — wishlist state (local + optional server sync)
   ════════════════════════════════════════════════════════════ */
function useWishlist() {
  const [items, setItems] = useState(() => {
    const raw = readLS(WISHLIST_KEY, []);
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map(normalizeWishItem).filter(Boolean);
  });
  const [synced, setSynced] = useState(false);

  /* ─── Server sync (only for logged-in users) ─── */
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/wishlist");
        const server = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (!cancelled && server.length > 0) {
          const merged = server.map(normalizeWishItem).filter(Boolean);
          writeLS(WISHLIST_KEY, merged);
          setItems(merged);
          setSynced(true);
        }
      } catch {
        /* Endpoint may not exist — stay local */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ─── Cross-tab & cross-component sync ─── */
  useEffect(() => {
    const sync = () => {
      const raw = readLS(WISHLIST_KEY, []);
      const arr = Array.isArray(raw) ? raw : [];
      setItems(arr.map(normalizeWishItem).filter(Boolean));
    };
    const onStorage = (e) => {
      if (!e.key || e.key === WISHLIST_KEY) sync();
    };
    const onCustom = (e) => {
      const list = e?.detail?.list;
      if (Array.isArray(list)) {
        setItems(list.map(normalizeWishItem).filter(Boolean));
      } else {
        sync();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(WISHLIST_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(WISHLIST_EVENT, onCustom);
    };
  }, []);

  const persist = useCallback((next) => {
    const clean = next.map(normalizeWishItem).filter(Boolean);
    writeLS(WISHLIST_KEY, clean);
    setItems(clean);
    try {
      window.dispatchEvent(
        new CustomEvent(WISHLIST_EVENT, { detail: { list: clean } })
      );
    } catch {
      window.dispatchEvent(new Event(WISHLIST_EVENT));
    }
  }, []);

  const remove = useCallback(
    (id) => persist(items.filter((i) => i.id !== id)),
    [items, persist]
  );

  const removeMany = useCallback(
    (ids) => {
      const set = new Set(ids);
      persist(items.filter((i) => !set.has(i.id)));
    },
    [items, persist]
  );

  const addBack = useCallback(
    (entries) => {
      const existingIds = new Set(items.map((i) => i.id));
      const toAdd = entries.filter((e) => !existingIds.has(e.id));
      persist([...toAdd, ...items]);
    },
    [items, persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, remove, removeMany, addBack, clear, synced };
}

/* ════════════════════════════════════════════════════════════
   Cart helper
   ════════════════════════════════════════════════════════════ */
const addToCart = (item, qty = 1) => {
  const existing = readLS(CART_KEY, []);
  const cart = Array.isArray(existing) ? [...existing] : [];
  const id = itemKey(item.productId, item.size);
  const found = cart.find((c) => c.id === id);
  if (found) {
    found.qty = Math.min(99, (found.qty || 0) + qty);
  } else {
    cart.push({
      id,
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      image: item.image,
      price: item.price,
      size: item.size,
      variant: item.variant,
      qty,
      addedAt: Date.now(),
    });
  }
  writeLS(CART_KEY, cart);
  try {
    window.dispatchEvent(new Event(CART_EVENT));
  } catch {}
};

/* ════════════════════════════════════════════════════════════
   Wishlist card — grid & list layouts
   ════════════════════════════════════════════════════════════ */
const WishCard = memo(function WishCard({
  item,
  index,
  view,
  selected,
  selectMode,
  onToggleSelect,
  onRemove,
  onAddToCart,
}) {
  const reduceMotion = useReducedMotion();
  const [removing, setRemoving] = useState(false);
  const [moving, setMoving] = useState(false);

  const discount = discountPercent(item);
  const drop = priceDroppedBy(item);

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    const snapshot = { ...item };
    setTimeout(() => {
      onRemove(item.id);
      toast.success("Removed from wishlist", {
        action: {
          label: "Undo",
          onClick: () => {
            const existing = readLS(WISHLIST_KEY, []);
            const arr = Array.isArray(existing) ? existing : [];
            if (!arr.find((w) => (w.id || w._id) === snapshot.id)) {
              arr.unshift(snapshot);
              writeLS(WISHLIST_KEY, arr);
              try {
                window.dispatchEvent(
                  new CustomEvent(WISHLIST_EVENT, { detail: { list: arr } })
                );
              } catch {
                window.dispatchEvent(new Event(WISHLIST_EVENT));
              }
            }
          },
        },
        duration: 5000,
      });
    }, 180);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.inStock) {
      toast.error("This item is out of stock");
      return;
    }
    setMoving(true);
    try {
      addToCart(item, 1);
      toast.success(`${item.name} added to bag`, {
        action: {
          label: "View bag",
          onClick: () => {
            window.location.href = "/cart";
          },
        },
        duration: 4000,
      });
    } catch {
      toast.error("Couldn't add to bag");
    } finally {
      setMoving(false);
    }
  };

  const handleSelectToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSelect(item.id);
  };

  /* ─── List layout ─── */
  if (view === "list") {
    return (
      <motion.li
        layout
        initial={reduceMotion ? false : { opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
        transition={{ duration: 0.28, delay: Math.min(index * 0.02, 0.16) }}
        className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-white p-3 transition-all dark:bg-neutral-900 sm:gap-4 sm:p-4 ${
          selected
            ? "border-neutral-900 ring-1 ring-neutral-900 dark:border-neutral-100 dark:ring-neutral-100"
            : "border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800/80 dark:hover:border-neutral-700"
        }`}
      >
        {selectMode && (
          <button
            type="button"
            onClick={handleSelectToggle}
            aria-label={selected ? `Deselect ${item.name}` : `Select ${item.name}`}
            aria-pressed={selected}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
              selected
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                : "border-neutral-300 bg-white hover:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
            }`}
          >
            {selected && <Check size={12} strokeWidth={3.5} />}
          </button>
        )}

        <Link
          to={`/shop/${item.slug || item.productId}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:h-24 sm:w-24"
        >
          <img
            src={item.image || FALLBACK_IMG}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          />
          {!item.inStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/60 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              Out
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          {item.brand && (
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
              {item.brand}
            </p>
          )}
          <Link
            to={`/shop/${item.slug || item.productId}`}
            className="mt-0.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
          >
            {item.name}
          </Link>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {item.size && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10.5px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                Size {item.size}
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Tag className="h-2.5 w-2.5" />-{discount}%
              </span>
            )}
            {drop > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <BadgePercent className="h-2.5 w-2.5" />
                Drop {formatPKR(drop)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="wl-num text-[15px] font-black text-neutral-900 dark:text-neutral-100">
              {formatPKR(item.price)}
            </span>
            {discount > 0 && (
              <span className="wl-num text-[11.5px] font-medium text-neutral-400 line-through">
                {formatPKR(item.regularPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!item.inStock || moving}
            aria-label={`Add ${item.name} to bag`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-3.5 text-[11.5px] font-bold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {moving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
            )}
            <span className="hidden sm:inline">Add</span>
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Remove ${item.name} from wishlist`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            {removing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-4 w-4" strokeWidth={2.4} />
            )}
          </button>
        </div>
      </motion.li>
    );
  }

  /* ─── Grid layout ─── */
  return (
    <motion.li
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.03, 0.24) }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all dark:bg-neutral-900 ${
        selected
          ? "border-neutral-900 ring-2 ring-neutral-900 dark:border-neutral-100 dark:ring-neutral-100"
          : "border-neutral-200/80 hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800/80 dark:hover:border-neutral-700"
      }`}
    >
      {/* Image */}
      <Link
        to={`/shop/${item.slug || item.productId}`}
        className="relative block aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800"
        aria-label={item.name}
      >
        <img
          src={item.image || FALLBACK_IMG}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        />

        {/* Badges (top-left) */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              <Tag className="h-2.5 w-2.5" />-{discount}%
            </span>
          )}
          {drop > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              <BadgePercent className="h-2.5 w-2.5" />
              Drop
            </span>
          )}
        </div>

        {/* Selection checkbox */}
        {selectMode && (
          <button
            type="button"
            onClick={handleSelectToggle}
            aria-label={selected ? `Deselect ${item.name}` : `Select ${item.name}`}
            aria-pressed={selected}
            className={`absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
              selected
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                : "border-white/90 bg-white/90 text-transparent backdrop-blur hover:border-neutral-400 dark:border-neutral-700/90 dark:bg-neutral-900/90"
            }`}
            style={{ left: discount > 0 || drop > 0 ? undefined : "0.75rem", top: discount > 0 || drop > 0 ? undefined : "0.75rem" }}
          >
            {selected && <Check size={12} strokeWidth={3.5} />}
          </button>
        )}

        {/* Remove button (top-right) */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          aria-label={`Remove ${item.name} from wishlist`}
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-neutral-700 shadow-md backdrop-blur transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:bg-neutral-800/95 dark:text-neutral-200 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          {removing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" strokeWidth={2.6} />
          )}
        </button>

        {!item.inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/60 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            Out of stock
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {item.brand && (
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
            {item.brand}
          </p>
        )}

        <Link
          to={`/shop/${item.slug || item.productId}`}
          className="mt-1 line-clamp-2 text-[13.5px] font-semibold leading-snug text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
        >
          {item.name}
        </Link>

        {item.size && (
          <p className="mt-1 text-[11.5px] text-neutral-500 dark:text-neutral-400">
            Size {item.size}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {discount > 0 ? (
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="wl-num text-[15px] font-black text-neutral-900 dark:text-neutral-100">
                  {formatPKR(item.price)}
                </span>
                <span className="wl-num text-[11.5px] font-medium text-neutral-400 line-through">
                  {formatPKR(item.regularPrice)}
                </span>
              </div>
            ) : (
              <span className="wl-num text-[15px] font-black text-neutral-900 dark:text-neutral-100">
                {formatPKR(item.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!item.inStock || moving}
            aria-label={`Add ${item.name} to bag`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-900 px-3 text-[11.5px] font-bold text-white transition-all hover:bg-black active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {moving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
            )}
            <span className="hidden xs:inline sm:inline">Add</span>
          </button>
        </div>
      </div>
    </motion.li>
  );
});

/* ════════════════════════════════════════════════════════════
   Empty state
   ════════════════════════════════════════════════════════════ */
const EmptyWishlist = memo(function EmptyWishlist({
  hasFilters,
  onClear,
  variant = "empty",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-md rounded-3xl border border-dashed border-neutral-300 bg-white/70 px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900/50 sm:px-10 sm:py-16"
    >
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40">
        {variant === "no-matches" ? (
          <Search className="h-7 w-7 text-rose-500" strokeWidth={1.8} />
        ) : (
          <Heart className="h-7 w-7 text-rose-500" strokeWidth={1.8} />
        )}
      </div>
      <h2 className="wl-serif text-2xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        {variant === "no-matches"
          ? "No matches"
          : hasFilters
          ? "Nothing matches"
          : "Your wishlist is empty"}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
        {variant === "no-matches"
          ? "Try adjusting your filters or search to see more saved items."
          : hasFilters
          ? "Try a different search term or clear the filters."
          : "Tap the heart icon on any product to save it here for later."}
      </p>
      <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
        {hasFilters || variant === "no-matches" ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-[13.5px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Clear filters
          </button>
        ) : (
          <>
            <Link
              to="/shop"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-[13.5px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.4} />
              Discover products
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/new-arrivals"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-[13.5px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.4} />
              New arrivals
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
});

/* ════════════════════════════════════════════════════════════
   Skeleton — matches grid density
   ════════════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <li className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-900">
    <div className="aspect-square animate-pulse bg-neutral-100 dark:bg-neutral-800" />
    <div className="space-y-2 p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="flex items-center justify-between pt-3">
        <div className="h-5 w-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-8 w-14 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  </li>
);

/* ════════════════════════════════════════════════════════════
   Filter chip
   ════════════════════════════════════════════════════════════ */
const FilterChip = memo(function FilterChip({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
        active
          ? "border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-100"
      }`}
    >
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.4} />}
      {label}
      {typeof count === "number" && count > 0 && (
        <span
          className={`rounded-full px-1.5 text-[10px] font-bold ${
            active
              ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

/* ════════════════════════════════════════════════════════════
   Main
   ════════════════════════════════════════════════════════════ */
const SORTS = [
  { value: "recent", label: "Recently added" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Price (low → high)" },
  { value: "price-desc", label: "Price (high → low)" },
  { value: "discount", label: "Biggest discount" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
];

const FILTERS = [
  { id: "all", label: "All", Icon: null },
  { id: "in-stock", label: "In stock", Icon: Check },
  { id: "on-sale", label: "On sale", Icon: Tag },
  { id: "price-drop", label: "Price dropped", Icon: BadgePercent },
];

const Wishlist = () => {
  const navigate = useNavigate();
  const { user: ctxUser } = getData();
  const { items, remove, removeMany, addBack, clear } = useWishlist();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState(() => {
    try {
      const p = readLS(PREFS_KEY, {});
      return p?.sort || "recent";
    } catch {
      return "recent";
    }
  });
  const [filter, setFilter] = useState(() => {
    try {
      const p = readLS(PREFS_KEY, {});
      return p?.filter || "all";
    } catch {
      return "all";
    }
  });
  const [view, setView] = useState(() => {
    try {
      return readRaw(VIEW_KEY) || "grid";
    } catch {
      return "grid";
    }
  });
  const [busy, setBusy] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  /* ─── Persist prefs ─── */
  useEffect(() => {
    writeLS(PREFS_KEY, { sort, filter });
  }, [sort, filter]);
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {}
  }, [view]);

  /* ─── Debounce search ─── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  /* ─── Page title ─── */
  useEffect(() => {
    const prev = document.title;
    document.title = "Wishlist · FeatheredShop";
    return () => {
      document.title = prev;
    };
  }, []);

  /* ─── Exit select mode when items clear ─── */
  useEffect(() => {
    if (items.length === 0 && selectMode) {
      setSelectMode(false);
      setSelectedIds(new Set());
    }
  }, [items.length, selectMode]);

  /* ─── Derived lists ─── */
  const visible = useMemo(() => {
    let list = [...items];

    /* Filters */
    if (filter === "in-stock") list = list.filter((i) => i.inStock);
    if (filter === "on-sale") list = list.filter((i) => discountPercent(i) > 0);
    if (filter === "price-drop") list = list.filter((i) => priceDroppedBy(i) > 0);

    /* Search */
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.brand || "").toLowerCase().includes(q)
      );
    }

    /* Sort */
    switch (sort) {
      case "oldest":
        list.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        list.sort((a, b) => discountPercent(b) - discountPercent(a));
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "recent":
      default:
        list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    }
    return list;
  }, [items, debouncedQuery, sort, filter]);

  const hasFilters =
    debouncedQuery.trim() !== "" || filter !== "all";

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const totalValue = items.reduce((s, i) => s + (i.price || 0), 0);
    const inStockCount = items.filter((i) => i.inStock).length;
    const onSaleCount = items.filter((i) => discountPercent(i) > 0).length;
    const droppedCount = items.filter((i) => priceDroppedBy(i) > 0).length;
    const savings = items.reduce((s, i) => {
      const d = i.regularPrice - i.price;
      return s + (d > 0 ? d : 0);
    }, 0);
    return { totalValue, inStockCount, onSaleCount, droppedCount, savings };
  }, [items]);

  const filterCounts = useMemo(
    () => ({
      all: items.length,
      "in-stock": stats.inStockCount,
      "on-sale": stats.onSaleCount,
      "price-drop": stats.droppedCount,
    }),
    [items.length, stats]
  );

  /* ─── Selection helpers ─── */
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = visible.every((v) => prev.has(v.id));
      if (allSelected) {
        const next = new Set(prev);
        visible.forEach((v) => next.delete(v.id));
        return next;
      }
      const next = new Set(prev);
      visible.forEach((v) => next.add(v.id));
      return next;
    });
  }, [visible]);

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds]
  );

  /* ─── Actions ─── */
  const handleClearAll = useCallback(() => {
    if (items.length === 0) return;
    const snapshot = [...items];
    setBusy(true);
    setTimeout(() => {
      clear();
      setBusy(false);
      toast.success("Wishlist cleared", {
        action: {
          label: "Undo",
          onClick: () => addBack(snapshot),
        },
        duration: 6000,
      });
    }, 180);
  }, [items, clear, addBack]);

  const handleMoveAllToCart = useCallback(() => {
    const inStock = items.filter((i) => i.inStock);
    if (inStock.length === 0) {
      toast.error("Nothing to move — all items are out of stock");
      return;
    }
    setBusy(true);
    try {
      inStock.forEach((item) => addToCart(item, 1));
      toast.success(
        `${inStock.length} item${inStock.length === 1 ? "" : "s"} added to bag`,
        {
          action: {
            label: "View bag",
            onClick: () => navigate("/cart"),
          },
          duration: 4000,
        }
      );
    } catch {
      toast.error("Couldn't move items to bag");
    } finally {
      setBusy(false);
    }
  }, [items, navigate]);

  const handleRemoveSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const snapshot = items.filter((i) => selectedIds.has(i.id));
    const ids = Array.from(selectedIds);
    setBusy(true);
    setTimeout(() => {
      removeMany(ids);
      setSelectedIds(new Set());
      setBusy(false);
      toast.success(`${ids.length} item${ids.length === 1 ? "" : "s"} removed`, {
        action: {
          label: "Undo",
          onClick: () => addBack(snapshot),
        },
        duration: 6000,
      });
    }, 180);
  }, [selectedIds, items, removeMany, addBack]);

  const handleMoveSelectedToCart = useCallback(() => {
    const chosen = items.filter((i) => selectedIds.has(i.id) && i.inStock);
    if (chosen.length === 0) {
      toast.error("No in-stock items selected");
      return;
    }
    setBusy(true);
    try {
      chosen.forEach((item) => addToCart(item, 1));
      toast.success(
        `${chosen.length} item${chosen.length === 1 ? "" : "s"} added to bag`,
        {
          action: {
            label: "View bag",
            onClick: () => navigate("/cart"),
          },
          duration: 4000,
        }
      );
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch {
      toast.error("Couldn't move items to bag");
    } finally {
      setBusy(false);
    }
  }, [items, selectedIds, navigate]);

  const handleShare = useCallback(async () => {
    if (items.length === 0) return;
    const text = items
      .slice(0, 10)
      .map((i) => `• ${i.name}${i.brand ? ` — ${i.brand}` : ""}`)
      .join("\n");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Wishlist — FeatheredShop",
          text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Wishlist copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  }, [items]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setFilter("all");
  }, []);

  /* ─── Grid density classes by view ─── */
  const gridClasses =
    view === "grid"
      ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      : "flex flex-col gap-2 sm:gap-3";

  const allVisibleSelected =
    visible.length > 0 && visible.every((v) => selectedIds.has(v.id));
  const someVisibleSelected = visible.some((v) => selectedIds.has(v.id));

  return (
    <div className="wl-hd-root min-h-dvh bg-neutral-50/60 pb-16 dark:bg-neutral-950">
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
              Wishlist
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

      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 md:px-8 lg:px-10 lg:pt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-zinc-900 dark:bg-white" />
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">
                Saved items
              </span>
            </div>
            <h1 className="wl-serif mt-3 flex items-center gap-3 text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
              My Wishlist
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-rose-500 px-2 text-[13px] font-black text-white">
                {items.length}
              </span>
            </h1>
            <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-400 sm:text-[13.5px]">
              {items.length === 0
                ? "Save your favourite products to buy them later"
                : `${items.length} item${
                    items.length === 1 ? "" : "s"
                  } · ${stats.inStockCount} in stock${
                    stats.onSaleCount
                      ? ` · ${stats.onSaleCount} on sale`
                      : ""
                  } · ${formatPKR(stats.totalValue)} total`}
              {stats.droppedCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <BadgePercent className="h-3 w-3" strokeWidth={2.5} />
                  {stats.droppedCount} price drop
                  {stats.droppedCount === 1 ? "" : "s"}
                </span>
              )}
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 self-start">
              <button
                type="button"
                onClick={() => {
                  setSelectMode((m) => !m);
                  if (selectMode) setSelectedIds(new Set());
                }}
                aria-pressed={selectMode}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                  selectMode
                    ? "border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                {selectMode ? "Done" : "Select"}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                type="button"
                onClick={handleMoveAllToCart}
                disabled={busy || stats.inStockCount === 0}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
                )}
                <span className="hidden sm:inline">Move all to bag</span>
                <span className="sm:hidden">Bag</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 lg:px-10">
        {items.length > 0 && (
          <>
            {/* Toolbar — search, filters, sort, view */}
            <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-transparent bg-neutral-50/60 px-4 py-3 backdrop-blur-md transition-colors dark:bg-neutral-950/60 sm:mx-0 sm:rounded-2xl sm:border sm:border-neutral-200/70 sm:px-4 sm:dark:border-neutral-800/70">
              <div className="flex flex-col gap-3">
                {/* Row 1 — search + sort + view */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                      strokeWidth={2.4}
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search your wishlist…"
                      aria-label="Search wishlist"
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

                  <div className="flex items-center gap-2">
                    {/* Sort */}
                    <div className="relative flex-1 sm:flex-none">
                      <ArrowDownUp
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                        strokeWidth={2.4}
                      />
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        aria-label="Sort wishlist"
                        className="w-full appearance-none rounded-full border border-neutral-200 bg-white py-2.5 pl-9 pr-9 text-[13px] font-semibold text-neutral-800 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100 sm:w-auto"
                      >
                        {SORTS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                        strokeWidth={2.4}
                      />
                    </div>

                    {/* View toggle */}
                    <div
                      role="group"
                      aria-label="View mode"
                      className="inline-flex shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <button
                        type="button"
                        onClick={() => setView("grid")}
                        aria-pressed={view === "grid"}
                        aria-label="Grid view"
                        className={`inline-flex h-10 w-10 items-center justify-center transition-colors ${
                          view === "grid"
                            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                        }`}
                      >
                        <Grid2x2 className="h-4 w-4" strokeWidth={2.4} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("list")}
                        aria-pressed={view === "list"}
                        aria-label="List view"
                        className={`inline-flex h-10 w-10 items-center justify-center transition-colors ${
                          view === "list"
                            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                        }`}
                      >
                        <Rows3 className="h-4 w-4" strokeWidth={2.4} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearAll}
                      disabled={busy}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-[12px] font-semibold text-neutral-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  </div>
                </div>

                {/* Row 2 — filter chips */}
                <div className="wl-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  {FILTERS.map((f) => (
                    <FilterChip
                      key={f.id}
                      active={filter === f.id}
                      onClick={() => setFilter(f.id)}
                      icon={f.Icon}
                      label={f.label}
                      count={filterCounts[f.id]}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Selection bar */}
            <AnimatePresence>
              {selectMode && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleSelectAllVisible}
                      aria-label={
                        allVisibleSelected
                          ? "Deselect all visible"
                          : "Select all visible"
                      }
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                        allVisibleSelected
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                          : someVisibleSelected
                          ? "border-neutral-900 dark:border-neutral-100"
                          : "border-neutral-300 bg-white hover:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
                      }`}
                    >
                      {allVisibleSelected ? (
                        <Check size={12} strokeWidth={3.5} />
                      ) : someVisibleSelected ? (
                        <span className="h-2.5 w-2.5 rounded-sm bg-neutral-900 dark:bg-neutral-100" />
                      ) : null}
                    </button>
                    <span className="text-[12.5px] font-semibold text-neutral-700 dark:text-neutral-300">
                      {selectedIds.size === 0
                        ? "Select items"
                        : `${selectedIds.size} selected`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMoveSelectedToCart}
                      disabled={busy || selectedItems.filter((i) => i.inStock).length === 0}
                      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Move to bag
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveSelected}
                      disabled={busy || selectedIds.size === 0}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:border-red-900/50 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectMode(false);
                        setSelectedIds(new Set());
                      }}
                      className="text-[12px] font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid / list */}
            <div className="mt-2">
              {visible.length === 0 ? (
                <EmptyWishlist
                  variant={items.length === 0 ? "empty" : "no-matches"}
                  hasFilters={hasFilters}
                  onClear={clearFilters}
                />
              ) : (
                <ul
                  aria-label="Wishlist items"
                  className={gridClasses}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {visible.map((item, i) => (
                      <WishCard
                        key={item.id}
                        item={item}
                        index={i}
                        view={view}
                        selectMode={selectMode}
                        selected={selectedIds.has(item.id)}
                        onToggleSelect={toggleSelect}
                        onRemove={remove}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {visible.length > 0 && (
                <p className="mt-8 text-center text-[11.5px] text-neutral-400">
                  Showing {visible.length} of {items.length} saved item
                  {items.length === 1 ? "" : "s"}
                  {hasFilters && " · filtered"}
                  {stats.savings > 0 && ` · saving ${formatPKR(stats.savings)}`}
                </p>
              )}
            </div>
          </>
        )}

        {items.length === 0 && (
          <EmptyWishlist variant="empty" hasFilters={false} onClear={() => {}} />
        )}
      </main>
    </div>
  );
};

export default Wishlist;