/* eslint-disable no-unused-vars */
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Ruler,
  Search,
  X,
  ChevronRight,
  Printer,
  Info,
  ArrowLeft,
  Sparkles,
  Shirt,
  Footprints,
  Baby,
  User,
  Check,
  AlertCircle,
  HelpCircle,
  Download,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ════════════════════════════════════════════════════════════
   CONFIG
   ════════════════════════════════════════════════════════════ */
const BRAND = "FeatheredSHOP";

/* Measurement systems (top-level tabs) */
const SYSTEMS = [
  { id: "apparel", label: "Apparel", Icon: Shirt },
  { id: "footwear", label: "Footwear", Icon: Footprints },
  { id: "bottoms", label: "Bottoms", Icon: Ruler },
  { id: "kids", label: "Kids", Icon: Baby },
];

/* Gender filters (secondary) */
const GENDERS = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "unisex", label: "Unisex" },
  { id: "all", label: "All" },
];

/* Unit options */
const UNITS = [
  { id: "cm", label: "cm" },
  { id: "in", label: "inches" },
];

/* ── Size charts ─────────────────────────────────────────── */
const CHARTS = {
  apparel: {
    men: {
      title: "Men's apparel sizes",
      note: "Measure around the fullest part of your chest, keeping the tape horizontal.",
      columns: ["Size", "Chest (cm)", "Waist (cm)", "Length (cm)", "Shoulder (cm)"],
      rows: [
        ["XS", "86–91", "71–76", "66", "42"],
        ["S", "91–96", "76–81", "68", "44"],
        ["M", "96–101", "81–86", "70", "46"],
        ["L", "101–106", "86–91", "72", "48"],
        ["XL", "106–111", "91–96", "74", "50"],
        ["XXL", "111–116", "96–101", "76", "52"],
        ["XXXL", "116–121", "101–106", "78", "54"],
      ],
    },
    women: {
      title: "Women's apparel sizes",
      note: "Measure around the fullest part of your bust and the narrowest part of your waist.",
      columns: ["Size", "Bust (cm)", "Waist (cm)", "Hip (cm)", "Length (cm)"],
      rows: [
        ["XS", "78–82", "60–64", "86–90", "60"],
        ["S", "82–86", "64–68", "90–94", "62"],
        ["M", "86–90", "68–72", "94–98", "64"],
        ["L", "90–96", "72–78", "98–104", "66"],
        ["XL", "96–102", "78–84", "104–110", "68"],
        ["XXL", "102–108", "84–90", "110–116", "70"],
      ],
    },
    unisex: {
      title: "Unisex apparel sizes",
      note: "A relaxed fit — size down for a slimmer fit.",
      columns: ["Size", "Chest (cm)", "Waist (cm)", "Length (cm)"],
      rows: [
        ["XS", "84–89", "70–75", "65"],
        ["S", "89–94", "75–80", "67"],
        ["M", "94–99", "80–85", "69"],
        ["L", "99–104", "85–90", "71"],
        ["XL", "104–109", "90–95", "73"],
        ["XXL", "109–114", "95–100", "75"],
      ],
    },
  },
  footwear: {
    men: {
      title: "Men's footwear sizes",
      note: "Stand on a piece of paper, mark your longest toe, and measure in cm.",
      columns: ["EU", "UK", "US", "Foot length (cm)"],
      rows: [
        ["39", "6", "7", "24.5"],
        ["40", "6.5", "7.5", "25.0"],
        ["41", "7", "8", "25.7"],
        ["42", "8", "9", "26.3"],
        ["43", "8.5", "9.5", "27.0"],
        ["44", "9.5", "10.5", "27.7"],
        ["45", "10", "11", "28.3"],
        ["46", "11", "12", "29.0"],
      ],
    },
    women: {
      title: "Women's footwear sizes",
      note: "Between sizes? Size up for a roomier fit.",
      columns: ["EU", "UK", "US", "Foot length (cm)"],
      rows: [
        ["35", "2.5", "5", "22.2"],
        ["36", "3", "5.5", "22.9"],
        ["37", "4", "6.5", "23.5"],
        ["38", "5", "7.5", "24.1"],
        ["39", "6", "8.5", "24.8"],
        ["40", "6.5", "9", "25.4"],
        ["41", "7.5", "10", "26.0"],
      ],
    },
    unisex: {
      title: "Unisex footwear sizes",
      note: "Common for sneakers. Feet slightly wider than average should size up.",
      columns: ["EU", "UK", "US", "Foot length (cm)"],
      rows: [
        ["36", "3", "4", "22.9"],
        ["37", "4", "5", "23.5"],
        ["38", "5", "6", "24.1"],
        ["39", "6", "7", "24.8"],
        ["40", "6.5", "7.5", "25.4"],
        ["41", "7", "8", "25.7"],
        ["42", "8", "9", "26.3"],
        ["43", "8.5", "9.5", "27.0"],
        ["44", "9.5", "10.5", "27.7"],
      ],
    },
  },
  bottoms: {
    men: {
      title: "Men's waist sizes",
      note: "Measure around your natural waistline, just above the hip bone.",
      columns: ["Size", "Waist (in)", "Waist (cm)", "Hip (cm)"],
      rows: [
        ["28", "28", "71", "89"],
        ["30", "30", "76", "94"],
        ["32", "32", "81", "99"],
        ["34", "34", "86", "104"],
        ["36", "36", "91", "109"],
        ["38", "38", "96", "114"],
        ["40", "40", "102", "119"],
      ],
    },
    women: {
      title: "Women's waist sizes",
      note: "Measure at the narrowest part of your waist, then compare to your hip measurement.",
      columns: ["Size", "UK", "US", "Waist (cm)", "Hip (cm)"],
      rows: [
        ["24", "6", "2", "61", "86"],
        ["26", "8", "4", "66", "91"],
        ["28", "10", "6", "71", "96"],
        ["30", "12", "8", "76", "101"],
        ["32", "14", "10", "81", "106"],
        ["34", "16", "12", "86", "111"],
      ],
    },
    unisex: {
      title: "Unisex bottoms",
      note: "Choose by waist in cm for a comfortable fit.",
      columns: ["Size", "Waist (in)", "Waist (cm)", "Inseam (cm)"],
      rows: [
        ["XS", "26–28", "66–71", "76"],
        ["S", "28–30", "71–76", "78"],
        ["M", "30–32", "76–81", "80"],
        ["L", "32–34", "81–86", "82"],
        ["XL", "34–36", "86–91", "84"],
        ["XXL", "36–38", "91–96", "86"],
      ],
    },
  },
  kids: {
    all: {
      title: "Kids sizes (by age)",
      note: "Kids grow fast — when in doubt, size up for longer wear.",
      columns: ["Age", "Height (cm)", "Chest (cm)", "Waist (cm)", "Foot (cm)"],
      rows: [
        ["2–3 yrs", "92–98", "53–55", "50–52", "15"],
        ["4–5 yrs", "104–110", "57–59", "53–55", "16.5"],
        ["6–7 yrs", "116–122", "61–63", "56–58", "18"],
        ["8–9 yrs", "128–134", "65–68", "59–61", "20"],
        ["10–11 yrs", "140–146", "70–73", "62–64", "22"],
        ["12–13 yrs", "152–158", "76–79", "65–68", "23.5"],
      ],
    },
  },
};

/* ── Measurement steps (illustrated) ─────────────────────── */
const MEASUREMENT_STEPS = [
  {
    id: "chest",
    title: "Chest / Bust",
    body: "Wrap the tape around the fullest part of your chest. Keep it horizontal and snug — but not tight.",
    Icon: Ruler,
  },
  {
    id: "waist",
    title: "Waist",
    body: "Measure around your natural waistline — the narrowest point between your ribs and hips.",
    Icon: Ruler,
  },
  {
    id: "hip",
    title: "Hip",
    body: "Stand with feet together and measure around the widest part of your hips.",
    Icon: Ruler,
  },
  {
    id: "foot",
    title: "Foot length",
    body: "Stand on a sheet of paper, mark your longest toe and heel, then measure the distance.",
    Icon: Footprints,
  },
];

/* ── Unit helpers ────────────────────────────────────────── */
const CM_TO_IN = 0.393701;
const IN_TO_CM = 2.54;

/* Convert a numeric string, range ("86–91"), or anything else */
const convertValue = (str, toUnit) => {
  if (!str) return str;
  if (toUnit === "cm") return str; // data stored in cm → no change

  // Handle ranges like "86–91"
  return String(str)
    .split(/[–\-]/)
    .map((part) => {
      const n = Number(part);
      if (!Number.isFinite(n)) return part;
      return (n * CM_TO_IN).toFixed(1);
    })
    .join("–");
};

const isNumericish = (str) => /^[\d.,\s–\-]+$/.test(String(str).trim());

/* ════════════════════════════════════════════════════════════
   HD CSS
   ════════════════════════════════════════════════════════════ */
const HD_CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Public+Sans:wght@400..800&display=swap");

  .sz-hd-root {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }
  .sz-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-optical-sizing: auto;
    font-variation-settings: "SOFT" 0, "WONK" 0;
    letter-spacing: -0.02em;
  }
  .sz-num {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1, "kern" 1;
  }
  .sz-hd-root :focus-visible { outline: 2px solid #171717; outline-offset: 2px; }
  .dark .sz-hd-root :focus-visible { outline-color: #fafafa; }

  /* Inputs get their own ring — no leftover outline */
  .sz-hd-root input:focus,
  .sz-hd-root input:focus-visible,
  .sz-hd-root textarea:focus,
  .sz-hd-root textarea:focus-visible,
  .sz-hd-root select:focus,
  .sz-hd-root select:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .sz-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
  .sz-scroll::-webkit-scrollbar-track { background: transparent; }
  .sz-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 9999px; }
  .dark .sz-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); }

  /* Print: keep tables crisp, hide chrome */
  @media print {
    .sz-no-print { display: none !important; }
    .sz-print-reset { box-shadow: none !important; background: white !important; }
  }
`;

/* ════════════════════════════════════════════════════════════
   Small components
   ════════════════════════════════════════════════════════════ */
const Tab = memo(function Tab({ active, onClick, Icon, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors sm:px-5 sm:text-[13.5px] ${
        active
          ? "border-transparent bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={2.4} />}
      {children}
    </button>
  );
});

const UnitToggle = memo(function UnitToggle({ unit, onChange }) {
  return (
    <div
      role="group"
      aria-label="Measurement unit"
      className="inline-flex shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      {UNITS.map((u) => {
        const active = unit === u.id;
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => onChange(u.id)}
            aria-pressed={active}
            className={`inline-flex h-10 items-center justify-center px-4 text-[12.5px] font-bold transition-colors ${
              active
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {u.label}
          </button>
        );
      })}
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   SizeTable
   ════════════════════════════════════════════════════════════ */
const SizeTable = memo(function SizeTable({ chart, unit, query }) {
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chart.rows;
    return chart.rows.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(q))
    );
  }, [chart, query]);

  const columns = chart.columns;

  return (
    <div className="sz-print-reset overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <h3 className="sz-serif text-base font-medium text-neutral-900 dark:text-neutral-100 sm:text-lg">
            {chart.title}
          </h3>
          <p className="mt-0.5 text-[11.5px] leading-snug text-neutral-500 dark:text-neutral-400 sm:text-[12.5px]">
            {chart.note}
          </p>
        </div>
        <span className="sz-num shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {unit === "cm" ? "Centimetres" : "Inches"}
        </span>
      </div>

      {/* Table */}
      <div className="sz-scroll -mx-0 overflow-x-auto">
        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Search className="h-6 w-6 text-neutral-300 dark:text-neutral-600" strokeWidth={1.6} />
            <p className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
              No sizes match "{query}"
            </p>
            <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
              Try clearing the search or switching units.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950/60">
                {columns.map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 sm:text-[11px]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-neutral-100 transition-colors hover:bg-neutral-50/70 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                >
                  {row.map((cell, j) => {
                    const isFirst = j === 0;
                    const display =
                      isFirst || !isNumericish(cell)
                        ? cell
                        : convertValue(cell, unit);
                    return (
                      <td
                        key={j}
                        className={`whitespace-nowrap px-4 py-3 text-[13px] ${
                          isFirst
                            ? "font-bold text-neutral-900 dark:text-neutral-100"
                            : "sz-num font-medium text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
});

/* ════════════════════════════════════════════════════════════
   MeasurementCard
   ════════════════════════════════════════════════════════════ */
const MeasurementCard = memo(function MeasurementCard({ step, index }) {
  const Icon = step.Icon;
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2) }}
      className="flex gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">
          {step.title}
        </p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {step.body}
        </p>
      </div>
    </motion.li>
  );
});

/* ════════════════════════════════════════════════════════════
   Main — SizeGuide
   ════════════════════════════════════════════════════════════ */
const SizeGuide = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduceMotion = useReducedMotion();

  /* URL-driven state */
  const system = searchParams.get("system") || "apparel";
  const gender = searchParams.get("gender") || "men";
  const unit = searchParams.get("unit") || "cm";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  /* Guard against invalid URL values */
  const validSystem = SYSTEMS.some((s) => s.id === system) ? system : "apparel";
  const validGender = GENDERS.some((g) => g.id === gender) ? gender : "men";
  const validUnit = UNITS.some((u) => u.id === unit) ? unit : "cm";

  /* Reset gender to "all" when the system doesn't support it */
  const genderSafe = useMemo(() => {
    if (validSystem === "kids") return "all";
    const available = CHARTS[validSystem] || {};
    return available[validGender] ? validGender : "men";
  }, [validSystem, validGender]);

  const chart = useMemo(() => {
    const sysCharts = CHARTS[validSystem] || {};
    return sysCharts[genderSafe] || Object.values(sysCharts)[0] || null;
  }, [validSystem, genderSafe]);

  /* Debounce search input */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  /* Set/update a URL param */
  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (!value) next.delete(key);
      else next.set(key, value);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  /* Page title */
  useEffect(() => {
    const prev = document.title;
    document.title = "Size Guide · FeatheredSHOP";
    return () => {
      document.title = prev;
    };
  }, []);

  /* Print handler */
  const handlePrint = useCallback(() => {
    try {
      window.print();
    } catch {
      toast.error("Couldn't open the print dialog");
    }
  }, []);

  /* Copy link (deep-linkable) */
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }, []);

  return (
    <div className="sz-hd-root min-h-dvh bg-neutral-50/60 pb-16 dark:bg-neutral-950">
      <style>{HD_CSS}</style>

      {/* Breadcrumb */}
      <div className="border-b border-neutral-200/70 bg-white dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-10">
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
              Size Guide
            </span>
          </nav>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 sm:text-[12px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
            Back
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 md:px-8 lg:px-10 lg:pt-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-zinc-900 dark:bg-white" />
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-400">
              Find your fit
            </span>
          </div>
          <h1 className="sz-serif mt-3 text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
            Size Guide
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-[14px]">
            Every brand fits a little differently. Use the charts below — combined
            with the measurement guide — to pick the right size the first time.
          </p>

          {/* Quick actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2 sz-no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={2.4} />
              Print
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2.4} />
              Copy link
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.4} />
              Need help?
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Controls — tabs, units, search */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 md:px-8 lg:px-10 sz-no-print">
        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900 sm:p-5">
          {/* Systems */}
          <div>
            <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Category
            </p>
            <div
              role="tablist"
              aria-label="Measurement category"
              className="sz-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              {SYSTEMS.map((s) => (
                <Tab
                  key={s.id}
                  active={validSystem === s.id}
                  Icon={s.Icon}
                  onClick={() => {
                    setParam("system", s.id);
                    if (s.id === "kids") setParam("gender", "all");
                    else setParam("gender", "men");
                  }}
                >
                  {s.label}
                </Tab>
              ))}
            </div>
          </div>

          {/* Genders (hidden for kids) */}
          {validSystem !== "kids" && (
            <div>
              <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Fit
              </p>
              <div
                role="tablist"
                aria-label="Gender"
                className="sz-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
              >
                {GENDERS.map((g) => (
                  <Tab
                    key={g.id}
                    active={genderSafe === g.id}
                    onClick={() => setParam("gender", g.id)}
                  >
                    {g.label}
                  </Tab>
                ))}
              </div>
            </div>
          )}

          {/* Unit + Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <UnitToggle unit={validUnit} onChange={(u) => setParam("unit", u)} />

            <div className="relative flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                strokeWidth={2.4}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sizes…"
                aria-label="Search size chart"
                className="w-full rounded-full border border-neutral-200 bg-white pl-10 pr-10 py-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600"
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
          </div>
        </div>
      </div>

      {/* Chart */}
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${validSystem}-${genderSafe}-${validUnit}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {chart ? (
              <SizeTable chart={chart} unit={validUnit} query={debouncedQuery} />
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
                <AlertCircle className="mx-auto h-7 w-7 text-neutral-400" strokeWidth={1.6} />
                <p className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                  Chart unavailable
                </p>
                <p className="mt-1 text-[12.5px] text-neutral-500 dark:text-neutral-400">
                  Pick a different category or fit.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Measurement guide */}
        <section className="mt-10 sm:mt-12" aria-labelledby="how-to-measure">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <Ruler className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div>
              <h2
                id="how-to-measure"
                className="sz-serif text-xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-2xl"
              >
                How to measure
              </h2>
              <p className="mt-0.5 text-[12.5px] text-neutral-500 dark:text-neutral-400">
                You'll need a soft measuring tape. Measure over underwear or
                light clothing.
              </p>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {MEASUREMENT_STEPS.map((step, i) => (
              <MeasurementCard key={step.id} step={step} index={i} />
            ))}
          </ul>
        </section>

        {/* Tips */}
        <section className="mt-10 sm:mt-12" aria-labelledby="size-tips">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" strokeWidth={2.4} />
            <h2
              id="size-tips"
              className="text-[13px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
            >
              Fit tips
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Between sizes?",
                body: "For a relaxed fit, size up. For a snug fit, size down.",
              },
              {
                title: "Shoes at the end of the day",
                body: "Feet swell slightly during the day. Measure in the evening for the most accurate size.",
              },
              {
                title: "Check the brand",
                body: "Fits vary between brands. When in doubt, compare the cm measurements — they're universal.",
              },
            ].map((tip) => (
              <li
                key={tip.title}
                className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900"
              >
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {tip.title}
                  </p>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {tip.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mt-10 sm:mt-12 sz-no-print">
          <div className="rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white p-6 text-center dark:border-neutral-800/80 dark:from-neutral-900 dark:to-neutral-950 sm:p-8">
            <h3 className="sz-serif text-xl font-medium text-neutral-900 dark:text-neutral-100 sm:text-2xl">
              Still unsure?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              Our team can help you find the perfect fit. Send us your measurements
              and we'll recommend a size.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
              >
                Contact support
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.6} />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SizeGuide;