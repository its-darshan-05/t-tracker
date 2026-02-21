import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import API from "../services/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import {
  ArrowLeft, Calendar, MapPin, Phone,
  User, Clock, TrendingUp, TrendingDown,
  Award, ShieldCheck, Activity, Leaf, Coffee, Zap
} from "lucide-react";

/* ─── DESIGN TOKENS (matches MarketCore system) ──────────── */
const P = {
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
  blue:     "#38BDF8",
};

/* ─── FONT INJECT ───────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0D0D0F; }
    ::-webkit-scrollbar-thumb { background: #2A2A33; border-radius: 2px; }

    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    .live-dot::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #3ECF8E;
      animation: pulse-ring 2s infinite;
    }

    @keyframes shimmer-line {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    @keyframes float-up {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    @keyframes count-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
    <motion.div style={{
      left: sx, top: sy, position: "fixed", pointerEvents: "none", zIndex: 0,
      width: 600, height: 600, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(62,207,142,0.04) 0%, transparent 70%)",
      transform: "translate(-50%, -50%)",
    }} />
  );
}

/* ─── LOADING SCREEN ────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: P.obsidian,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32,
    }}>
      <motion.div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
            style={{
              position: "absolute",
              width: 80 - i * 20, height: 80 - i * 20,
              borderRadius: "50%",
              border: `1.5px solid ${P.jade}`,
            }}
          />
        ))}
        <Activity size={22} color={P.jade} />
      </motion.div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: P.jade, letterSpacing: "0.3em", marginBottom: 8 }}>LOADING</p>
        <p style={{ fontFamily: "'Syne', sans-serif", color: P.fog, fontSize: 14 }}>Fetching factory intelligence...</p>
      </div>
      <div style={{ width: 200, height: 2, background: P.smoke, borderRadius: 1, overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ height: "100%", width: "50%", background: `linear-gradient(90deg, transparent, ${P.jade}, transparent)` }}
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
      background: P.slate, border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "14px 18px",
      fontFamily: "'DM Mono', monospace", fontSize: 12,
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    }}>
      <p style={{ color: P.fog, marginBottom: 8, letterSpacing: "0.08em", fontSize: 10 }}>{label}</p>
      <p style={{ color: P.jade, fontWeight: 600, fontSize: 18 }}>
        ₹{payload[0]?.value}
        <span style={{ color: P.fog, fontSize: 11, fontWeight: 400 }}>/kg</span>
      </p>
    </div>
  );
};

/* ─── STAT CARD ─────────────────────────────────────────── */
function StatCard({ label, value, icon, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: P.slate,
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20, padding: "24px",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* accent glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 100, height: 100, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${accent}15`, border: `1px solid ${accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        {icon}
      </div>
      <p style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9, letterSpacing: "0.2em",
        color: P.fog, textTransform: "uppercase", marginBottom: 8,
      }}>{label}</p>
      <p style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 22, fontWeight: 800,
        color: P.snow, letterSpacing: "-0.03em",
      }}>{value}</p>
    </motion.div>
  );
}

/* ─── DETAIL ROW ─────────────────────────────────────────── */
function DetailRow({ icon, label, value, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: `${accent}12`, border: `1px solid ${accent}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: P.fog, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: P.snow }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function FactoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get(`/profile/${id}`),
      API.get(`/profile/${id}/history`)
    ]).then(([profileRes, historyRes]) => {
      setFactory(profileRes.data);
      const formatted = historyRes.data.map(item => ({
        rawDate: item.date,
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: item.price,
      }));
      setHistory(formatted);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const stats = useMemo(() => {
    if (!history.length) return null;
    const prices = history.map(h => h.price);
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const avg = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    const last = prices[prices.length - 1];
    const previous = prices[prices.length - 2] || last;
    const change = last - previous;
    const changePercent = ((change / previous) * 100).toFixed(2);
    return { highest, lowest, avg, change, changePercent };
  }, [history]);

  if (loading) return (<><FontStyle /><LoadingScreen /></>);

  const isTea = factory?.commodityType === "Tea";
  const accent = isTea ? P.jade : P.amber;
  const avgPrice = stats ? parseFloat(stats.avg) : null;

  return (
    <>
      <FontStyle />
      <CursorBlob />

      <div style={{ minHeight: "100vh", background: P.obsidian, color: P.snow, position: "relative", zIndex: 1 }}>

        {/* AMBIENT BG */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 0% 0%, ${accent}08 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 100% 100%, rgba(124,92,252,0.06) 0%, transparent 60%)
          `,
        }} />

        {/* STICKY HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "sticky", top: 0, zIndex: 100,
            background: "rgba(13,13,15,0.85)", backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            padding: "0 40px",
          }}
        >
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 64,
          }}>
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "transparent", border: "none", cursor: "pointer",
                color: P.fog, fontFamily: "'DM Mono', monospace",
                fontSize: 11, letterSpacing: "0.12em",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: P.slate, border: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ArrowLeft size={14} color={P.fog} />
              </div>
              BACK TO DIRECTORY
            </motion.button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", width: 8, height: 8 }} className="live-dot">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.jade, position: "relative", zIndex: 1 }} />
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: P.jade, letterSpacing: "0.2em" }}>LIVE DATA</span>
            </div>
          </div>
        </motion.header>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>

          {/* ── HERO SECTION ─────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, marginBottom: 32, alignItems: "start" }}>

            {/* Left: Name + Price */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Breadcrumb label */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 24, height: 1, background: accent }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: accent, textTransform: "uppercase" }}>
                  {factory.commodityType} Unit · ID {id.slice(-6).toUpperCase()}
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(36px, 5vw, 64px)",
                fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05,
                color: P.snow, marginBottom: 28,
              }}>
                {factory.factoryName}
              </h1>

              {/* Price + Delta */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: P.fog, letterSpacing: "0.2em", marginBottom: 8 }}>
                    CURRENT PRICE / KG
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: "clamp(48px, 6vw, 80px)",
                      fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
                      color: accent,
                    }}>
                      ₹{factory.pricePerKilo}
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: P.fog }}>/kg</span>
                  </div>
                </div>

                {stats && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 18px", borderRadius: 14,
                      background: stats.change >= 0 ? "rgba(62,207,142,0.1)" : "rgba(255,107,107,0.1)",
                      border: `1px solid ${stats.change >= 0 ? P.jade : P.rose}30`,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 14, fontWeight: 600,
                      color: stats.change >= 0 ? P.jade : P.rose,
                      marginBottom: 4,
                    }}
                  >
                    {stats.change >= 0
                      ? <TrendingUp size={16} />
                      : <TrendingDown size={16} />}
                    {stats.change >= 0 ? "+" : ""}{stats.changePercent}%
                  </motion.div>
                )}

                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 16px", borderRadius: 12,
                  background: "rgba(62,207,142,0.06)", border: "1px solid rgba(62,207,142,0.15)",
                  marginBottom: 4,
                }}>
                  <ShieldCheck size={14} color={P.jade} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: P.jade, letterSpacing: "0.15em" }}>VERIFIED</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Commodity icon badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{
                width: 100, height: 100,
                borderRadius: 28,
                background: `${accent}12`,
                border: `1px solid ${accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "float-up 4s ease-in-out infinite",
                boxShadow: `0 0 60px ${accent}20`,
                flexShrink: 0,
              }}
            >
              {isTea
                ? <Leaf size={44} color={accent} style={{ filter: `drop-shadow(0 0 8px ${accent}60)` }} />
                : <Coffee size={44} color={accent} style={{ filter: `drop-shadow(0 0 8px ${accent}60)` }} />}
            </motion.div>
          </div>

          {/* ── LAYOUT: main content + sidebar ───────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* STAT GRID */}
              {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                  <StatCard label="Market High" value={`₹${stats.highest}`} icon={<Award size={18} color={P.amber} />} accent={P.amber} delay={0.05} />
                  <StatCard label="Market Low" value={`₹${stats.lowest}`} icon={<TrendingDown size={18} color={P.rose} />} accent={P.rose} delay={0.1} />
                  <StatCard label="Avg Price" value={`₹${stats.avg}`} icon={<Activity size={18} color={P.jade} />} accent={P.jade} delay={0.15} />
                  <StatCard
                    label="Last Updated"
                    value={new Date(factory.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                    icon={<Calendar size={18} color={P.blue} />}
                    accent={P.blue}
                    delay={0.2}
                  />
                </div>
              )}

              {/* CHART */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: P.carbon,
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 28, padding: "36px",
                  position: "relative", overflow: "hidden",
                }}
              >
                {/* BG glow */}
                <div style={{
                  position: "absolute", bottom: -60, right: -60, width: 280, height: 280,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
                  <div>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 10,
                      letterSpacing: "0.25em", color: accent,
                      textTransform: "uppercase", display: "block", marginBottom: 10,
                    }}>
                      ◈ Price Performance
                    </span>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: P.snow, letterSpacing: "-0.03em" }}>
                      Historical Analytics
                    </h2>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: P.fog, marginTop: 6 }}>
                      Procurement cost over time
                    </p>
                  </div>

                  <div style={{
                    padding: "8px 16px", borderRadius: 10,
                    background: `${accent}12`, border: `1px solid ${accent}25`,
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: accent, letterSpacing: "0.15em",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Zap size={12} /> AREA CHART
                  </div>
                </div>

                <div style={{ height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={accent} stopOpacity={0.25} />
                          <stop offset="85%" stopColor={accent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis
                        dataKey="date"
                        axisLine={false} tickLine={false}
                        tick={{ fill: P.fog, fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false} tickLine={false}
                        tick={{ fill: P.fog, fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                        domain={["dataMin - 3", "dataMax + 3"]}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: `${accent}30`, strokeWidth: 1 }} />
                      {avgPrice && (
                        <ReferenceLine
                          y={avgPrice}
                          stroke={`${accent}40`}
                          strokeDasharray="6 4"
                          label={{
                            value: `avg ₹${avgPrice}`,
                            position: "insideTopRight",
                            fill: P.fog,
                            fontSize: 10,
                            fontFamily: "'DM Mono', monospace",
                          }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={accent}
                        strokeWidth={2.5}
                        fill="url(#areaGrad)"
                        dot={{ r: 4, fill: accent, strokeWidth: 2, stroke: P.carbon }}
                        activeDot={{ r: 7, fill: accent, strokeWidth: 0, filter: `drop-shadow(0 0 6px ${accent})` }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* RIGHT SIDEBAR: Factory details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: P.slate,
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 24, padding: 28,
                position: "sticky", top: 84,
                overflow: "hidden",
              }}
            >
              {/* top accent bar */}
              <div style={{
                height: 3, borderRadius: 2,
                background: `linear-gradient(90deg, ${accent}, transparent)`,
                marginBottom: 28,
              }} />

              <div style={{ marginBottom: 24 }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9, letterSpacing: "0.25em",
                  color: P.fog, textTransform: "uppercase",
                }}>
                  Factory Profile
                </span>
              </div>

              <DetailRow
                icon={<User size={15} color={accent} />}
                label="Manager"
                value={factory.ownerName}
                accent={accent}
              />
              <DetailRow
                icon={<Phone size={15} color={accent} />}
                label="Direct Line"
                value={factory.contactNumber}
                accent={accent}
              />
              {factory.operatingHours && (
                <DetailRow
                  icon={<Clock size={15} color={accent} />}
                  label="Operating Hours"
                  value={factory.operatingHours}
                  accent={accent}
                />
              )}
              {factory.address && (
                <DetailRow
                  icon={<MapPin size={15} color={accent} />}
                  label="Location"
                  value={factory.address}
                  accent={accent}
                />
              )}

              {/* Commodity badge */}
              <div style={{ marginTop: 28, padding: "16px 20px", borderRadius: 16, background: `${accent}08`, border: `1px solid ${accent}20` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: P.fog, letterSpacing: "0.2em", marginBottom: 4 }}>COMMODITY</p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: accent }}>{factory.commodityType}</p>
                  </div>
                  {isTea ? <Leaf size={28} color={`${accent}60`} /> : <Coffee size={28} color={`${accent}60`} />}
                </div>
              </div>

              {/* Price range mini bar */}
              {stats && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: P.fog, letterSpacing: "0.15em" }}>LOW ₹{stats.lowest}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: P.fog, letterSpacing: "0.15em" }}>HIGH ₹{stats.highest}</span>
                  </div>
                  <div style={{ height: 4, background: P.smoke, borderRadius: 2, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((factory.pricePerKilo - stats.lowest) / (stats.highest - stats.lowest)) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: "100%", background: `linear-gradient(90deg, ${accent}60, ${accent})`, borderRadius: 2 }}
                    />
                  </div>
                  <p style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 9,
                    color: P.fog, letterSpacing: "0.1em", marginTop: 8, textAlign: "center",
                  }}>
                    Current ₹{factory.pricePerKilo} in range
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "28px 40px", display: "flex", justifyContent: "center" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: P.smoke, letterSpacing: "0.2em" }}>
            MARKETCORE · COMMODITY INTELLIGENCE SYSTEM · {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </>
  );
}