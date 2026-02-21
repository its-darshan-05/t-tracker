import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Search, Filter, RotateCcw, Copy, Check, Leaf, Coffee, MapPin, Phone, User, TrendingUp } from "lucide-react";

const C = {
  paper: "#FAFAF8", white: "#FFFFFF", pearl: "#F4F3EF", silk: "#EAE9E4",
  mist: "#D4D3CC", stone: "#9B9A94", slate: "#6B6A64", ink: "#2C2B27",
  navy: "#1B2A4A", navyD: "#0F1E38",
  teal: "#0D7A6B", tealL: "#E8F5F3", tealM: "#B3DDD8",
  gold: "#B8860B", goldL: "#FDF6E3", goldM: "#F0D080",
  rose: "#C0392B", roseL: "#FDF0EE",
};
const CHART_COLORS = ["#0D7A6B","#1B2A4A","#B8860B","#C0392B","#2980B9","#8E44AD","#16A085","#E67E22"];

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #FAFAF8; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #EAE9E4; } ::-webkit-scrollbar-thumb { background: #D4D3CC; border-radius: 3px; }
    input::placeholder { color: #C8C7C0; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; }
    input:focus, select:focus, button:focus { outline: none; }
    .card-hover { transition: box-shadow 0.25s ease, transform 0.25s ease; }
    .card-hover:hover { box-shadow: 0 12px 40px rgba(27,42,74,0.11); transform: translateY(-3px); }
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  `}</style>
);

function MarketTicker({ profiles }) {
  const avg  = profiles.length ? (profiles.reduce((s,p)=>s+p.pricePerKilo,0)/profiles.length).toFixed(2) : 0;
  const high = profiles.length ? Math.max(...profiles.map(p=>p.pricePerKilo)) : 0;
  const low  = profiles.length ? Math.min(...profiles.map(p=>p.pricePerKilo)) : 0;
  const items = [
    { label:"FACTORIES", value: profiles.length },
    { label:"AVG PRICE", value:`₹${avg}/kg` },
    { label:"MARKET HIGH", value:`₹${high}` },
    { label:"MARKET LOW", value:`₹${low}` },
    { label:"TEA UNITS", value: profiles.filter(p=>p.commodityType==="Tea").length },
    { label:"COFFEE UNITS", value: profiles.filter(p=>p.commodityType==="Coffee").length },
    { label:"STATUS", value:"LIVE" },
  ];
  const doubled = [...items,...items,...items];
  return (
    <div style={{ background: C.navy, borderBottom:`1px solid ${C.navyD}`, overflow:"hidden", padding:"9px 0" }}>
      <motion.div
        animate={{ x:["0%","-33.33%"] }}
        transition={{ duration:26, repeat:Infinity, ease:"linear" }}
        style={{ display:"flex", gap:0, whiteSpace:"nowrap", width:"max-content" }}
      >
        {doubled.map((item,i)=>(
          <span key={i} style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, padding:"0 32px", display:"flex", alignItems:"center", gap:10, borderRight:`1px solid rgba(255,255,255,0.1)`, color:"rgba(255,255,255,0.45)" }}>
            <span style={{ color:"rgba(255,255,255,0.25)", fontSize:8 }}>▸</span>
            {item.label}
            <span style={{ color:"#FFFFFF", fontWeight:500 }}>{item.value}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", background:C.paper, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28 }}>
      <div style={{ position:"relative", width:56, height:56 }}>
        {[56,38,22].map((s,i)=>(
          <motion.div key={i} animate={{ scale:[1,1.15,1], opacity:[0.3,0.7,0.3] }} transition={{ duration:1.6, repeat:Infinity, delay:i*0.3 }}
            style={{ position:"absolute", top:(56-s)/2, left:(56-s)/2, width:s, height:s, borderRadius:"50%", border:`1.5px solid ${C.navy}` }} />
        ))}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><Leaf size={18} color={C.teal} /></div>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.teal, letterSpacing:"0.3em", marginBottom:6 }}>LOADING MARKET DATA</p>
        <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", color:C.stone, fontSize:13 }}>Synchronising commodity index...</p>
      </div>
      <div style={{ width:180, height:2, background:C.silk, borderRadius:1, overflow:"hidden" }}>
        <motion.div animate={{ x:["-100%","200%"] }} transition={{ duration:1.2, repeat:Infinity, ease:"easeInOut" }}
          style={{ height:"100%", width:"45%", background:`linear-gradient(90deg, transparent, ${C.navy}, transparent)` }} />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:12, padding:"14px 18px", fontFamily:"'IBM Plex Mono', monospace", fontSize:11, boxShadow:"0 8px 32px rgba(27,42,74,0.12)" }}>
      <p style={{ color:C.stone, marginBottom:10, fontSize:10 }}>{label}</p>
      {payload.map((p,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.fill, flexShrink:0 }} />
          <span style={{ color:C.slate, fontSize:10 }}>{p.name}</span>
          <span style={{ color:C.ink, fontWeight:500, marginLeft:"auto", paddingLeft:12 }}>₹{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function FactoryCard({ p, index, onNavigate, copied, onCopy }) {
  const isTea = p.commodityType==="Tea";
  const accent = isTea ? C.teal : C.gold;
  const accentL = isTea ? C.tealL : C.goldL;
  const accentM = isTea ? C.tealM : C.goldM;
  return (
    <motion.div layout
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.97 }}
      transition={{ duration:0.35, delay:index*0.055, ease:[0.25,1,0.5,1] }}
      onClick={() => onNavigate(`/factory/${p._id}`)}
      className="card-hover"
      style={{ background:C.white, borderRadius:16, border:`1px solid ${C.silk}`, overflow:"hidden", cursor:"pointer", position:"relative" }}
    >
      <div style={{ height:3, background:`linear-gradient(90deg, ${accent}, ${accentM})` }} />
      <div style={{ padding:"24px 26px 26px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:accentL, border:`1px solid ${accentM}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {isTea ? <Leaf size={20} color={accent} /> : <Coffee size={20} color={accent} />}
          </div>
          <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, letterSpacing:"0.18em", color:accent, background:accentL, border:`1px solid ${accentM}`, padding:"4px 10px", borderRadius:6, textTransform:"uppercase" }}>
            {p.commodityType}
          </span>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:600, color:C.ink, marginBottom:4, letterSpacing:"-0.01em", lineHeight:1.3 }}>{p.factoryName}</h3>
        <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:22 }}>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:34, fontWeight:700, color:accent, letterSpacing:"-0.03em", lineHeight:1.1 }}>₹{p.pricePerKilo}</span>
          <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, color:C.stone }}>/kg</span>
        </div>
        <div style={{ height:1, background:C.pearl, marginBottom:18 }} />
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
            <User size={12} color={accent} style={{ marginTop:2, flexShrink:0 }} />
            <span style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:12.5, color:C.slate }}>{p.ownerName}</span>
          </div>
          <div onClick={e=>onCopy(e,p.contactNumber,p._id)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"copy" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
              <Phone size={12} color={accent} style={{ marginTop:2, flexShrink:0 }} />
              <span style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:12.5, color:C.slate }}>{p.contactNumber}</span>
            </div>
            <motion.div whileTap={{ scale:0.75 }} style={{ color:copied===p._id?C.teal:C.mist }}>
              {copied===p._id ? <Check size={13} /> : <Copy size={13} />}
            </motion.div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
            <MapPin size={12} color={accent} style={{ marginTop:2, flexShrink:0 }} />
            <span style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:12.5, color:C.slate, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.address}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PublicProfiles() {
  const [profiles, setProfiles]   = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(null);
  const [search, setSearch]       = useState("");
  const [commodityFilter, setCommodityFilter] = useState("All");
  const [sortOption, setSortOption] = useState("none");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes  = await API.get("/profile");
        const profileList = profileRes.data;
        setProfiles(profileList);
        if (!profileList.length) { setLoading(false); return; }
        const historyResults = await Promise.all(profileList.map(p=>API.get(`/profile/${p._id}/history`)));
        const dateSet = new Set();
        historyResults.forEach(res=>res.data.forEach(item=>dateSet.add(new Date(item.date).toISOString().split("T")[0])));
        const weeklyDates = Array.from(dateSet).sort((a,b)=>new Date(a)-new Date(b)).slice(-7);
        const finalData = weeklyDates.map(date=>{
          const row={date};
          historyResults.forEach((res,i)=>{ const r=res.data.find(item=>new Date(item.date).toISOString().split("T")[0]===date); row[profileList[i].factoryName]=r?.price||0; });
          return row;
        });
        setChartData(finalData);
      } catch(err){ console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredProfiles = useMemo(() => {
    let f=[...profiles];
    if(search) f=f.filter(p=>p.factoryName.toLowerCase().includes(search.toLowerCase()));
    if(commodityFilter!=="All") f=f.filter(p=>p.commodityType===commodityFilter);
    if(sortOption==="priceHigh") f.sort((a,b)=>b.pricePerKilo-a.pricePerKilo);
    if(sortOption==="priceLow")  f.sort((a,b)=>a.pricePerKilo-b.pricePerKilo);
    return f;
  }, [profiles,search,commodityFilter,sortOption]);

  const copyToClipboard = (e,text,id) => {
    e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(id); setTimeout(()=>setCopied(null),2000);
  };

  if (loading) return (<><FontStyle /><LoadingScreen /></>);

  return (
    <>
      <FontStyle />
      <div style={{ minHeight:"100vh", background:C.paper }}>
        <MarketTicker profiles={profiles} />

        <div style={{ maxWidth:1320, margin:"0 auto", padding:"64px 40px 80px" }}>
          {/* Hero */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.25,1,0.5,1] }} style={{ marginBottom:48 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
              <div style={{ width:28, height:2, background:C.navy, borderRadius:1 }} />
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.28em", color:C.navy, textTransform:"uppercase" }}>Market Directory</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20 }}>
              <div>
                <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(38px, 5vw, 58px)", fontWeight:700, letterSpacing:"-0.03em", lineHeight:1.1, color:C.ink }}>
                  Factory <span style={{ fontStyle:"italic", color:C.navy }}>Directory</span>
                </h1>
                <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:14, color:C.stone, marginTop:10, lineHeight:1.7, maxWidth:480 }}>
                  Live procurement monitoring across {profiles.length} registered commodity units.
                </p>
              </div>
              <div style={{ display:"flex", gap:1, background:C.silk, borderRadius:12, overflow:"hidden", border:`1px solid ${C.mist}` }}>
                {[{label:"Units",value:profiles.length},{label:"Tea",value:profiles.filter(p=>p.commodityType==="Tea").length},{label:"Coffee",value:profiles.filter(p=>p.commodityType==="Coffee").length}].map((s,i)=>(
                  <div key={i} style={{ padding:"14px 22px", background:C.white, textAlign:"center" }}>
                    <p style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700, color:C.navy }}>{s.value}</p>
                    <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.15em", marginTop:2 }}>{s.label.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div style={{ height:1, background:C.silk, marginBottom:36 }} />

          {/* Filter bar */}
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", marginBottom:36 }}>
            <div style={{ flex:"1 1 240px", display:"flex", alignItems:"center", gap:10, background:C.white, border:`1px solid ${C.silk}`, borderRadius:10, padding:"0 16px", height:44, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <Search size={15} color={C.mist} />
              <input type="text" placeholder="Search factory name..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ background:"transparent", border:"none", color:C.ink, flex:1, fontFamily:"'IBM Plex Sans', sans-serif", fontSize:13 }} />
            </div>
            <div style={{ display:"flex", background:C.white, border:`1px solid ${C.silk}`, borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              {["All","Tea","Coffee"].map(opt=>(
                <button key={opt} onClick={()=>setCommodityFilter(opt)} style={{
                  height:44, padding:"0 20px", border:"none", cursor:"pointer",
                  background: commodityFilter===opt ? C.navy : "transparent",
                  color: commodityFilter===opt ? "#fff" : C.slate,
                  fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.12em",
                  transition:"all 0.18s", borderRight: opt!=="Coffee" ? `1px solid ${C.silk}` : "none",
                }}>{opt.toUpperCase()}</button>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, background:C.white, border:`1px solid ${C.silk}`, borderRadius:10, padding:"0 16px", height:44, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <Filter size={13} color={C.stone} />
              <select value={sortOption} onChange={e=>setSortOption(e.target.value)} style={{ background:"transparent", border:"none", color:C.slate, fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.08em", cursor:"pointer" }}>
                <option value="none">SORT BY</option>
                <option value="priceHigh">PRICE ↓ HIGH</option>
                <option value="priceLow">PRICE ↑ LOW</option>
              </select>
            </div>
            <motion.button whileHover={{ rotate:-180 }} transition={{ duration:0.3 }}
              onClick={()=>{ setSearch(""); setCommodityFilter("All"); setSortOption("none"); }}
              style={{ width:44, height:44, borderRadius:10, background:C.white, border:`1px solid ${C.silk}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.stone, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <RotateCcw size={15} />
            </motion.button>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.stone, letterSpacing:"0.12em", marginLeft:"auto" }}>{filteredProfiles.length} RESULTS</span>
          </motion.div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            <motion.div layout style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:18, marginBottom:80 }}>
              {filteredProfiles.map((p,i)=>(
                <FactoryCard key={p._id} p={p} index={i} onNavigate={navigate} copied={copied} onCopy={copyToClipboard} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProfiles.length===0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center", padding:"80px 0" }}>
              <Leaf size={36} color={C.mist} style={{ margin:"0 auto 16px", display:"block" }} />
              <p style={{ fontFamily:"'Playfair Display', serif", color:C.stone, fontSize:18 }}>No factories match your filters</p>
            </motion.div>
          )}

          {/* Chart */}
          {chartData.length>0 && (
            <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.6 }}
              style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:20, overflow:"hidden", boxShadow:"0 2px 16px rgba(27,42,74,0.06)" }}>
              <div style={{ padding:"32px 40px 28px", borderBottom:`1px solid ${C.pearl}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <TrendingUp size={14} color={C.navy} />
                    <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.navy, letterSpacing:"0.2em" }}>PRICE ANALYTICS</span>
                  </div>
                  <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:600, color:C.ink, letterSpacing:"-0.02em" }}>7-Session Price Comparison</h2>
                </div>
                <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.stone, letterSpacing:"0.1em" }}>HISTORICAL · ALL UNITS</span>
              </div>
              <div style={{ padding:"32px 40px 36px", height:440 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top:10, right:10, left:-10, bottom:0 }} barGap={2} barCategoryGap="28%">
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={C.pearl} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill:C.stone, fontSize:11, fontFamily:"'IBM Plex Mono', monospace" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill:C.stone, fontSize:11, fontFamily:"'IBM Plex Mono', monospace" }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill:C.pearl, radius:4 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop:24, fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.06em", color:C.stone }} />
                    {filteredProfiles.map((p,i)=>(
                      <Bar key={p._id} dataKey={p.factoryName} fill={CHART_COLORS[i%CHART_COLORS.length]} radius={[4,4,0,0]} barSize={16} opacity={0.88} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        <footer style={{ background:C.navy, padding:"20px 40px", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.22em", color:"rgba(255,255,255,0.35)" }}>TEATRACKER · COMMODITY INTELLIGENCE PLATFORM · {new Date().getFullYear()}</span>
          <span style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:11, color:"rgba(255,255,255,0.2)" }}>Developed & all rights reserved · Darshan Bharathi R</span>
        </footer>
      </div>
    </>
  );
}