import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Search, Filter, RotateCcw, Copy, Check, Factory, MapPin, Phone, User, TrendingUp, ChevronDown, Leaf, Coffee } from "lucide-react";

/* ─── DESIGN TOKENS ────────────────────────────────────── */
const PALETTE = {
  obsidian: "#0D0D0F",
  carbon:   "#16161A",
  slate:    "#1E1E24",
  smoke:    "#2A2A33",
  fog:      "#9898A6",
  ghost:    "#C8C8D4",
  snow:     "#F0F0F6",
  jade:     "#3ECF8E",
  amber:    "#F5A623",
  rose:     "#FF6B6B",
  violet:   "#7C5CFC",
};

const CHART_COLORS = ["#3ECF8E", "#F5A623", "#7C5CFC", "#FF6B6B", "#38BDF8", "#FB7185", "#A3E635", "#FB923C"];

/* ─── FONT INJECT ───────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --obsidian: #0D0D0F;
      --carbon:   #16161A;
      --slate:    #1E1E24;
      --smoke:    #2A2A33;
      --fog:      #9898A6;
      --ghost:    #C8C8D4;
      --snow:     #F0F0F6;
      --jade:     #3ECF8E;
      --amber:    #F5A623;
      --violet:   #7C5CFC;
      --rose:     #FF6B6B;
    }

    html { scroll-behavior: smooth; }

    .glass {
      background: rgba(30, 30, 36, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.06);
    }

    .glow-jade { box-shadow: 0 0 40px rgba(62, 207, 142, 0.15); }
    .glow-amber { box-shadow: 0 0 40px rgba(245, 166, 35, 0.15); }

    .noise-bg {
      position: relative;
    }
    .noise-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      opacity: 0.4;
      border-radius: inherit;
    }

    .scan-lines {
      background-image: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255,255,255,0.01) 2px,
        rgba(255,255,255,0.01) 4px
      );
    }

    input::placeholder { color: #4A4A58; }
    input:focus { outline: none; }
    select:focus { outline: none; }
    button:focus { outline: none; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--obsidian); }
    ::-webkit-scrollbar-thumb { background: var(--smoke); border-radius: 2px; }
    
    .mono { font-family: 'DM Mono', monospace; }
    .syne { font-family: 'Syne', sans-serif; }
    .serif { font-family: 'Instrument Serif', serif; }

    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .live-dot::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--jade);
      animation: pulse-ring 2s infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .shimmer-text {
      background: linear-gradient(90deg, #9898A6 0%, #F0F0F6 40%, #3ECF8E 60%, #9898A6 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 4s linear infinite;
    }

    @keyframes border-spin {
      to { --angle: 360deg; }
    }
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    .spinning-border {
      --angle: 0deg;
      border: 1.5px solid;
      border-image: conic-gradient(from var(--angle), transparent 70%, #3ECF8E, transparent) 1;
      animation: border-spin 4s linear infinite;
    }
  `}</style>
);

/* ─── CURSOR BLOB ───────────────────────────────────────── */
function CursorBlob() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 18 });
  const sy = useSpring(y, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <motion.div
      style={{
        left: sx, top: sy,
        position: "fixed", pointerEvents: "none", zIndex: 0,
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(62,207,142,0.04) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

/* ─── STAT TICKER ───────────────────────────────────────── */
function StatTicker({ profiles }) {
  const avg = profiles.length ? (profiles.reduce((s, p) => s + p.pricePerKilo, 0) / profiles.length).toFixed(2) : 0;
  const max = profiles.length ? Math.max(...profiles.map(p => p.pricePerKilo)) : 0;
  const min = profiles.length ? Math.min(...profiles.map(p => p.pricePerKilo)) : 0;

  const items = [
    { label: "FACTORIES ONLINE", value: profiles.length, suffix: "" },
    { label: "AVG PRICE / KG", value: `₹${avg}`, suffix: "" },
    { label: "MARKET HIGH", value: `₹${max}`, suffix: "" },
    { label: "MARKET LOW", value: `₹${min}`, suffix: "" },
    { label: "TEA UNITS", value: profiles.filter(p => p.commodityType === "Tea").length, suffix: "" },
    { label: "COFFEE UNITS", value: profiles.filter(p => p.commodityType === "Coffee").length, suffix: "" },
  ];

  return (
    <div style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 11, letterSpacing: "0.12em",
      background: "rgba(62,207,142,0.04)",
      borderTop: "1px solid rgba(62,207,142,0.15)",
      borderBottom: "1px solid rgba(62,207,142,0.15)",
      padding: "10px 0",
      overflow: "hidden",
      position: "relative",
    }}>
      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        style={{ display: "flex", gap: 64, whiteSpace: "nowrap", width: "max-content" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} style={{ color: PALETTE.fog, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: PALETTE.jade }}>◆</span>
            <span>{item.label}</span>
            <span style={{ color: PALETTE.snow, fontWeight: 500 }}>{item.value}{item.suffix}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── LOADING SCREEN ────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: PALETTE.obsidian,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32,
    }}>
      <motion.div
        style={{
          width: 80, height: 80, position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 80 - i * 20, height: 80 - i * 20,
              borderRadius: "50%",
              border: `1.5px solid ${PALETTE.jade}`,
            }}
          />
        ))}
        <Factory size={24} color={PALETTE.jade} />
      </motion.div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: PALETTE.jade, letterSpacing: "0.3em", marginBottom: 8 }}>
          SYNCHRONIZING
        </p>
        <p style={{ fontFamily: "'Syne', sans-serif", color: PALETTE.fog, fontSize: 14 }}>
          Fetching market intelligence...
        </p>
      </div>
      <div style={{
        width: 200, height: 2, background: PALETTE.smoke, borderRadius: 1, overflow: "hidden"
      }}>
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ height: "100%", width: "50%", background: `linear-gradient(90deg, transparent, ${PALETTE.jade}, transparent)` }}
        />
      </div>
    </div>
  );
}

/* ─── CUSTOM TOOLTIP ─────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: PALETTE.slate, border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 16, padding: "16px 20px",
      fontFamily: "'DM Mono', monospace", fontSize: 12,
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    }}>
      <p style={{ color: PALETTE.fog, marginBottom: 12, letterSpacing: "0.1em" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill }} />
          <span style={{ color: PALETTE.ghost, fontSize: 11 }}>{p.name}</span>
          <span style={{ color: PALETTE.snow, marginLeft: "auto", fontWeight: 500 }}>₹{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── FACTORY CARD ───────────────────────────────────────── */
function FactoryCard({ p, index, onNavigate, copied, onCopy }) {
  const isTea = p.commodityType === "Tea";
  const accent = isTea ? PALETTE.jade : PALETTE.amber;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.94 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      onClick={() => onNavigate(`/factory/${p._id}`)}
      style={{
        background: PALETTE.slate,
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.06)",
        padding: 28,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent corner glow */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <motion.div
          whileHover={{ rotate: 15 }}
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: `${accent}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${accent}30`,
          }}
        >
          {isTea ? <Leaf size={22} color={accent} /> : <Coffee size={22} color={accent} />}
        </motion.div>

        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9, letterSpacing: "0.2em",
          color: accent,
          background: `${accent}12`,
          border: `1px solid ${accent}30`,
          padding: "5px 12px", borderRadius: 8,
          textTransform: "uppercase",
        }}>
          {p.commodityType}
        </span>
      </div>

      {/* Name & Price */}
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 18, fontWeight: 700,
        color: PALETTE.snow, marginBottom: 6,
        letterSpacing: "-0.02em",
      }}>
        {p.factoryName}
      </h3>

      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 36, fontWeight: 800,
          color: accent, letterSpacing: "-0.03em", lineHeight: 1,
        }}>
          ₹{p.pricePerKilo}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: PALETTE.fog }}>/kg</span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 20 }} />

      {/* Info rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <InfoRow icon={<User size={13} color={accent} />} label={p.ownerName} />
        <div
          onClick={(e) => onCopy(e, p.contactNumber, p._id)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "copy" }}
        >
          <InfoRow icon={<Phone size={13} color={accent} />} label={p.contactNumber} />
          <motion.div whileTap={{ scale: 0.8 }}>
            {copied === p._id
              ? <Check size={13} color={PALETTE.jade} />
              : <Copy size={13} color={PALETTE.fog} />}
          </motion.div>
        </div>
        <InfoRow icon={<MapPin size={13} color={accent} />} label={p.address} truncate />
      </div>
    </motion.div>
  );
}

function InfoRow({ icon, label, truncate }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 12, color: PALETTE.fog, lineHeight: 1.5,
        overflow: truncate ? "hidden" : undefined,
        textOverflow: truncate ? "ellipsis" : undefined,
        whiteSpace: truncate ? "nowrap" : undefined,
      }}>
        {label}
      </span>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function PublicProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [search, setSearch] = useState("");
  const [commodityFilter, setCommodityFilter] = useState("All");
  const [sortOption, setSortOption] = useState("none");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await API.get("/profile");
        const profileList = profileRes.data;
        setProfiles(profileList);
        if (!profileList.length) { setLoading(false); return; }

        const historyResults = await Promise.all(profileList.map(p => API.get(`/profile/${p._id}/history`)));
        const dateSet = new Set();
        historyResults.forEach(res => res.data.forEach(item => {
          dateSet.add(new Date(item.date).toISOString().split("T")[0]);
        }));

        const weeklyDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
        const finalData = weeklyDates.map(date => {
          const row = { date };
          historyResults.forEach((res, i) => {
            const r = res.data.find(item => new Date(item.date).toISOString().split("T")[0] === date);
            row[profileList[i].factoryName] = r?.price || 0;
          });
          return row;
        });
        setChartData(finalData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProfiles = useMemo(() => {
    let f = [...profiles];
    if (search) f = f.filter(p => p.factoryName.toLowerCase().includes(search.toLowerCase()));
    if (commodityFilter !== "All") f = f.filter(p => p.commodityType === commodityFilter);
    if (sortOption === "priceHigh") f.sort((a, b) => b.pricePerKilo - a.pricePerKilo);
    if (sortOption === "priceLow") f.sort((a, b) => a.pricePerKilo - b.pricePerKilo);
    return f;
  }, [profiles, search, commodityFilter, sortOption]);

  const copyToClipboard = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return (<><FontStyle /><LoadingScreen /></>);

  return (
    <>
      <FontStyle />
      <CursorBlob />

      <div style={{
        minHeight: "100vh",
        background: PALETTE.obsidian,
        color: PALETTE.snow,
        position: "relative",
        zIndex: 1,
      }}>

        {/* AMBIENT BG GRADIENTS */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 0% 0%, rgba(62,207,142,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 100% 100%, rgba(124,92,252,0.06) 0%, transparent 60%)
          `,
        }} />

        {/* HEADER NAV BAR */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "sticky", top: 0, zIndex: 100,
            background: "rgba(13,13,15,0.8)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            padding: "0 40px",
          }}
        >
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "linear-gradient(135deg, #3ECF8E, #7C5CFC)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Factory size={16} color="#fff" />
              </div>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 16, fontWeight: 700,
                color: PALETTE.snow, letterSpacing: "-0.02em",
              }}>
                MarketCore
              </span>
            </div>

            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", width: 8, height: 8 }} className="live-dot">
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: PALETTE.jade, position: "relative", zIndex: 1,
                }} />
              </div>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10, color: PALETTE.jade, letterSpacing: "0.2em",
              }}>
                LIVE
              </span>
            </div>
          </div>
        </motion.header>

        {/* TICKER */}
        <StatTicker profiles={profiles} />

        {/* HERO SECTION */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 40px 48px", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 24, height: 1, background: PALETTE.jade }} />
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10, letterSpacing: "0.3em",
                color: PALETTE.jade, textTransform: "uppercase",
              }}>
                Commodity Intelligence Platform
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: 20,
            }}>
              <span style={{ color: PALETTE.snow }}>Factory</span>
              {" "}
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                background: "linear-gradient(135deg, #3ECF8E 0%, #7C5CFC 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Directory
              </span>
            </h1>

            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13, color: PALETTE.fog, maxWidth: 500, lineHeight: 1.8,
            }}>
              Real-time procurement monitoring across {profiles.length} registered commodity units.
              Price intelligence updated live.
            </p>
          </motion.div>
        </div>

        {/* FILTER BAR */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            maxWidth: 1280, margin: "0 auto 48px",
            padding: "0 40px",
            position: "relative", zIndex: 1,
          }}
        >
          <div style={{
            background: PALETTE.slate,
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, padding: 8,
            display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center",
          }}>
            {/* Search */}
            <div style={{
              flex: "1 1 220px",
              display: "flex", alignItems: "center", gap: 10,
              background: PALETTE.smoke,
              borderRadius: 14, padding: "0 16px", height: 46,
            }}>
              <Search size={15} color={PALETTE.fog} />
              <input
                type="text"
                placeholder="Search factories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: "transparent", border: "none",
                  color: PALETTE.snow, flex: 1,
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  letterSpacing: "0.05em",
                }}
              />
            </div>

            {/* Commodity filter */}
            {["All", "Tea", "Coffee"].map(opt => (
              <button
                key={opt}
                onClick={() => setCommodityFilter(opt)}
                style={{
                  height: 46, padding: "0 18px", borderRadius: 14,
                  border: "none", cursor: "pointer",
                  background: commodityFilter === opt
                    ? (opt === "Tea" ? `${PALETTE.jade}20` : opt === "Coffee" ? `${PALETTE.amber}20` : `${PALETTE.violet}20`)
                    : "transparent",
                  color: commodityFilter === opt
                    ? (opt === "Tea" ? PALETTE.jade : opt === "Coffee" ? PALETTE.amber : PALETTE.violet)
                    : PALETTE.fog,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11, letterSpacing: "0.1em",
                  transition: "all 0.2s",
                  border: commodityFilter === opt
                    ? `1px solid ${opt === "Tea" ? PALETTE.jade : opt === "Coffee" ? PALETTE.amber : PALETTE.violet}30`
                    : "1px solid transparent",
                }}
              >
                {opt === "All" ? "ALL TYPES" : opt.toUpperCase()}
              </button>
            ))}

            {/* Sort */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: PALETTE.smoke, borderRadius: 14,
              padding: "0 16px", height: 46,
              borderLeft: "1px solid rgba(255,255,255,0.05)",
            }}>
              <Filter size={13} color={PALETTE.fog} />
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                style={{
                  background: "transparent", border: "none",
                  color: PALETTE.ghost, fontFamily: "'DM Mono', monospace",
                  fontSize: 11, letterSpacing: "0.08em", cursor: "pointer",
                }}
              >
                <option value="none">SORT</option>
                <option value="priceHigh">↑ HIGHEST</option>
                <option value="priceLow">↓ LOWEST</option>
              </select>
            </div>

            {/* Reset */}
            <motion.button
              whileHover={{ rotate: -180 }}
              transition={{ duration: 0.3 }}
              onClick={() => { setSearch(""); setCommodityFilter("All"); setSortOption("none"); }}
              style={{
                width: 46, height: 46, borderRadius: 14,
                background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: PALETTE.fog,
              }}
              title="Reset"
            >
              <RotateCcw size={15} />
            </motion.button>
          </div>
        </motion.div>

        {/* GRID */}
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 40px 80px",
          position: "relative", zIndex: 1,
        }}>
          {/* Count badge */}
          <motion.div
            layout
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11, color: PALETTE.fog,
              letterSpacing: "0.15em", marginBottom: 28,
            }}
          >
            <span style={{ color: PALETTE.jade }}>{filteredProfiles.length}</span>
            {" "} UNITS MATCHING
          </motion.div>

          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {filteredProfiles.map((p, i) => (
                <FactoryCard
                  key={p._id}
                  p={p}
                  index={i}
                  onNavigate={navigate}
                  copied={copied}
                  onCopy={copyToClipboard}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProfiles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "80px 0" }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
              <p style={{ fontFamily: "'Syne', sans-serif", color: PALETTE.fog, fontSize: 16 }}>
                No factories match your filters
              </p>
            </motion.div>
          )}
        </div>

        {/* CHART SECTION */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: 1280, margin: "0 auto 80px",
              padding: "0 40px",
              position: "relative", zIndex: 1,
            }}
          >
            <div style={{
              background: PALETTE.carbon,
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 32, padding: "48px",
              position: "relative", overflow: "hidden",
            }}>
              {/* BG decoration */}
              <div style={{
                position: "absolute", bottom: -60, right: -60,
                width: 300, height: 300,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              <div style={{ marginBottom: 40 }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10, letterSpacing: "0.25em",
                  color: PALETTE.violet, textTransform: "uppercase",
                  display: "block", marginBottom: 12,
                }}>
                  ◈ Price Intelligence
                </span>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 28, fontWeight: 800,
                  color: PALETTE.snow, letterSpacing: "-0.03em",
                }}>
                  7-Session Price Flux
                </h2>
                <p style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12, color: PALETTE.fog, marginTop: 8,
                }}>
                  Historical price comparison across all commodity units
                </p>
              </div>

              <div style={{ height: 420 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }} barGap={2}>
                    <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      axisLine={false} tickLine={false}
                      tick={{ fill: PALETTE.fog, fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}
                      dy={12}
                    />
                    <YAxis
                      axisLine={false} tickLine={false}
                      tick={{ fill: PALETTE.fog, fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)", radius: 8 }} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        paddingTop: 28,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10, letterSpacing: "0.08em",
                        color: PALETTE.fog,
                      }}
                    />
                    {filteredProfiles.map((p, i) => (
                      <Bar
                        key={p._id}
                        dataKey={p.factoryName}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        radius={[6, 6, 0, 0]}
                        barSize={14}
                        opacity={0.85}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* FOOTER */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "32px 40px",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, color: PALETTE.smoke,
            letterSpacing: "0.2em",
          }}>
            MARKETCORE · COMMODITY INTELLIGENCE SYSTEM · {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </>
  );
}