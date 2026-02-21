import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { ArrowLeft, Calendar, MapPin, Phone, User, Clock, TrendingUp, TrendingDown, Award, ShieldCheck, Activity, Leaf, Coffee, BarChart2 } from "lucide-react";

const C = {
  paper:"#FAFAF8", white:"#FFFFFF", pearl:"#F4F3EF", silk:"#EAE9E4",
  mist:"#D4D3CC", stone:"#9B9A94", slate:"#6B6A64", ink:"#2C2B27",
  navy:"#1B2A4A", navyD:"#0F1E38",
  teal:"#0D7A6B", tealL:"#E8F5F3", tealM:"#B3DDD8",
  gold:"#B8860B", goldL:"#FDF6E3", goldM:"#F0D080",
  rose:"#C0392B", roseL:"#FDF0EE", roseM:"#F5B7B1",
  blue:"#1A6FA8", blueL:"#EBF5FB", blueM:"#A9CCE3",
};

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #FAFAF8; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #EAE9E4; } ::-webkit-scrollbar-thumb { background: #D4D3CC; border-radius: 3px; }
    input:focus, button:focus { outline: none; }
    @keyframes float-icon { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
  `}</style>
);

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", background:C.paper, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28 }}>
      <div style={{ position:"relative", width:56, height:56 }}>
        {[56,38,22].map((s,i)=>(
          <motion.div key={i} animate={{ scale:[1,1.15,1], opacity:[0.3,0.7,0.3] }} transition={{ duration:1.6, repeat:Infinity, delay:i*0.3 }}
            style={{ position:"absolute", top:(56-s)/2, left:(56-s)/2, width:s, height:s, borderRadius:"50%", border:`1.5px solid ${C.navy}` }} />
        ))}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><Activity size={18} color={C.navy} /></div>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.teal, letterSpacing:"0.3em", marginBottom:6 }}>FETCHING DATA</p>
        <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", color:C.stone, fontSize:13 }}>Loading factory intelligence...</p>
      </div>
      <div style={{ width:180, height:2, background:C.silk, borderRadius:1, overflow:"hidden" }}>
        <motion.div animate={{ x:["-100%","200%"] }} transition={{ duration:1.2, repeat:Infinity, ease:"easeInOut" }}
          style={{ height:"100%", width:"45%", background:`linear-gradient(90deg, transparent, ${C.navy}, transparent)` }} />
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:12, padding:"14px 18px", fontFamily:"'IBM Plex Mono', monospace", boxShadow:"0 8px 32px rgba(27,42,74,0.12)" }}>
      <p style={{ fontSize:10, color:C.stone, letterSpacing:"0.06em", marginBottom:8 }}>{label}</p>
      <p style={{ fontSize:20, fontFamily:"'Playfair Display', serif", fontWeight:700, color:C.navy }}>
        ₹{payload[0]?.value}<span style={{ fontSize:12, color:C.stone, fontFamily:"'IBM Plex Mono', monospace", fontWeight:400 }}>/kg</span>
      </p>
    </div>
  );
};

function StatCard({ label, value, icon, accentBg, accentText, delay }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.45, ease:[0.25,1,0.5,1] }}
      style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:14, padding:"22px 24px", boxShadow:"0 1px 6px rgba(27,42,74,0.05)" }}>
      <div style={{ width:38, height:38, borderRadius:10, background:accentBg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>{icon}</div>
      <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:6 }}>{label}</p>
      <p style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700, color:accentText||C.ink }}>{value}</p>
    </motion.div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"16px 0", borderBottom:`1px solid ${C.pearl}` }}>
      <span style={{ marginTop:2, flexShrink:0 }}>{icon}</span>
      <div>
        <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.18em", marginBottom:4 }}>{label}</p>
        <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:14, color:C.ink, fontWeight:500, lineHeight:1.4 }}>{value}</p>
      </div>
    </div>
  );
}

export default function FactoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get(`/profile/${id}`), API.get(`/profile/${id}/history`)])
      .then(([pRes, hRes]) => {
        setFactory(pRes.data);
        setHistory(hRes.data.map(item => ({
          date: new Date(item.date).toLocaleDateString("en-US", { month:"short", day:"numeric" }),
          price: item.price,
        })));
        setLoading(false);
      }).catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  const stats = useMemo(() => {
    if (!history.length) return null;
    const prices = history.map(h=>h.price);
    const highest=Math.max(...prices), lowest=Math.min(...prices);
    const avg=(prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(2);
    const last=prices[prices.length-1], previous=prices[prices.length-2]||last;
    const change=last-previous;
    return { highest, lowest, avg, change, changePercent:((change/previous)*100).toFixed(2) };
  }, [history]);

  if (loading) return (<><FontStyle /><LoadingScreen /></>);

  const isTea=factory?.commodityType==="Tea";
  const accent=isTea?C.teal:C.gold, accentL=isTea?C.tealL:C.goldL, accentM=isTea?C.tealM:C.goldM;
  const avgNum=stats?parseFloat(stats.avg):null;
  const isUp=stats?stats.change>=0:true;

  return (
    <>
      <FontStyle />
      <div style={{ minHeight:"100vh", background:C.paper, color:C.ink }}>

        {/* Header */}
        <header style={{ background:C.white, borderBottom:`1px solid ${C.silk}`, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 rgba(0,0,0,0.04)" }}>
          <div style={{ maxWidth:1320, margin:"0 auto", padding:"0 40px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <motion.button whileHover={{ x:-3 }} whileTap={{ scale:0.96 }} onClick={()=>navigate(-1)}
              style={{ display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", cursor:"pointer", color:C.slate }}>
              <div style={{ width:32, height:32, borderRadius:8, background:C.pearl, border:`1px solid ${C.silk}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ArrowLeft size={14} color={C.slate} />
              </div>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.12em" }}>BACK TO DIRECTORY</span>
            </motion.button>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.stone, letterSpacing:"0.12em" }}>ID · {id.slice(-8).toUpperCase()}</span>
              <div style={{ width:1, height:16, background:C.mist }} />
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 12px", borderRadius:16, background:accentL, border:`1px solid ${accentM}` }}>
                <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:2, repeat:Infinity }} style={{ width:6, height:6, borderRadius:"50%", background:accent }} />
                <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:accent, letterSpacing:"0.15em" }}>LIVE</span>
              </div>
            </div>
          </div>
        </header>

        <div style={{ maxWidth:1320, margin:"0 auto", padding:"56px 40px 80px" }}>

          {/* Hero */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:32, marginBottom:48, alignItems:"start" }}>
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.25,1,0.5,1] }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:28, height:2, background:accent, borderRadius:1 }} />
                <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.28em", color:accent, textTransform:"uppercase" }}>{factory.commodityType} Procurement Unit</span>
              </div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(34px, 4.5vw, 58px)", fontWeight:700, letterSpacing:"-0.03em", lineHeight:1.08, color:C.ink, marginBottom:28 }}>{factory.factoryName}</h1>
              <div style={{ display:"flex", alignItems:"flex-end", gap:20, flexWrap:"wrap" }}>
                <div>
                  <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.22em", marginBottom:8 }}>CURRENT PRICE / KG</p>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                    <span style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(52px, 6vw, 76px)", fontWeight:700, letterSpacing:"-0.04em", lineHeight:1, color:accent }}>₹{factory.pricePerKilo}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:13, color:C.stone, marginBottom:8 }}>/kg</span>
                  </div>
                </div>
                {stats && (
                  <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.35 }}
                    style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", borderRadius:10, marginBottom:8, background:isUp?C.tealL:C.roseL, border:`1px solid ${isUp?C.tealM:C.roseM}`, fontFamily:"'IBM Plex Mono', monospace", fontSize:13, fontWeight:500, color:isUp?C.teal:C.rose }}>
                    {isUp?<TrendingUp size={15}/>:<TrendingDown size={15}/>}
                    {isUp?"+":""}{stats.changePercent}%
                  </motion.div>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", borderRadius:10, background:C.pearl, border:`1px solid ${C.silk}`, marginBottom:8 }}>
                  <ShieldCheck size={14} color={C.stone} />
                  <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.slate, letterSpacing:"0.18em" }}>VERIFIED SOURCE</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.65, ease:[0.25,1,0.5,1], delay:0.1 }}
              style={{ width:96, height:96, borderRadius:24, flexShrink:0, background:accentL, border:`1px solid ${accentM}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 32px ${accent}20`, animation:"float-icon 4s ease-in-out infinite" }}>
              {isTea?<Leaf size={44} color={accent}/>:<Coffee size={44} color={accent}/>}
            </motion.div>
          </div>

          <div style={{ height:1, background:C.silk, marginBottom:40 }} />

          {/* Two column */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:28, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
              {/* Stats */}
              {stats && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:14 }}>
                  <StatCard label="Market High"  value={`₹${stats.highest}`} icon={<Award size={17} color={C.gold}/>}       accentBg={C.goldL} accentText={C.gold} delay={0.05} />
                  <StatCard label="Market Low"   value={`₹${stats.lowest}`}  icon={<TrendingDown size={17} color={C.rose}/>} accentBg={C.roseL} accentText={C.rose} delay={0.10} />
                  <StatCard label="Weighted Avg" value={`₹${stats.avg}`}     icon={<Activity size={17} color={C.teal}/>}     accentBg={C.tealL} accentText={C.teal} delay={0.15} />
                  <StatCard label="Last Updated" value={new Date(factory.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"})} icon={<Calendar size={17} color={C.blue}/>} accentBg={C.blueL} accentText={C.blue} delay={0.20} />
                </div>
              )}

              {/* Chart */}
              <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.55, ease:[0.25,1,0.5,1] }}
                style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 16px rgba(27,42,74,0.05)" }}>
                <div style={{ padding:"28px 32px 24px", borderBottom:`1px solid ${C.pearl}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <BarChart2 size={13} color={accent} />
                      <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:accent, letterSpacing:"0.2em" }}>PRICE PERFORMANCE</span>
                    </div>
                    <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:600, color:C.ink, letterSpacing:"-0.02em" }}>Historical Price Trend</h2>
                  </div>
                  <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.1em", padding:"6px 12px", background:C.pearl, borderRadius:6 }}>AREA · ALL DATES</span>
                </div>
                <div style={{ padding:"28px 32px 32px", height:380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top:8, right:8, left:-12, bottom:0 }}>
                      <defs>
                        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={accent} stopOpacity={0.18} />
                          <stop offset="90%" stopColor={accent} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" vertical={false} stroke={C.pearl} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill:C.stone, fontSize:10, fontFamily:"'IBM Plex Mono', monospace" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill:C.stone, fontSize:10, fontFamily:"'IBM Plex Mono', monospace" }} domain={["dataMin - 3","dataMax + 3"]} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke:accentM, strokeWidth:1 }} />
                      {avgNum && <ReferenceLine y={avgNum} stroke={accentM} strokeDasharray="5 3" label={{ value:`avg ₹${avgNum}`, position:"insideTopRight", fill:C.stone, fontSize:10, fontFamily:"'IBM Plex Mono', monospace" }} />}
                      <Area type="monotone" dataKey="price" stroke={accent} strokeWidth={2.5} fill="url(#areaFill)"
                        dot={{ r:4, fill:C.white, stroke:accent, strokeWidth:2 }}
                        activeDot={{ r:6, fill:accent, stroke:C.white, strokeWidth:2.5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2, duration:0.55, ease:[0.25,1,0.5,1] }}
              style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:18, overflow:"hidden", position:"sticky", top:84, boxShadow:"0 2px 16px rgba(27,42,74,0.05)" }}>
              <div style={{ height:4, background:`linear-gradient(90deg, ${accent}, ${accentM})` }} />
              <div style={{ padding:"26px 26px 30px" }}>
                <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.25em", marginBottom:22 }}>FACTORY PROFILE</p>
                <DetailRow icon={<User size={13} color={accent}/>} label="Manager / Owner" value={factory.ownerName} />
                <DetailRow icon={<Phone size={13} color={accent}/>} label="Direct Line" value={factory.contactNumber} />
                {factory.operatingHours && <DetailRow icon={<Clock size={13} color={accent}/>} label="Operating Hours" value={factory.operatingHours} />}
                {factory.address && <DetailRow icon={<MapPin size={13} color={accent}/>} label="Address" value={factory.address} />}
                <div style={{ marginTop:24, padding:"16px 18px", borderRadius:12, background:accentL, border:`1px solid ${accentM}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.18em", marginBottom:4 }}>COMMODITY TYPE</p>
                    <p style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:accent }}>{factory.commodityType}</p>
                  </div>
                  {isTea?<Leaf size={32} color={`${accent}80`}/>:<Coffee size={32} color={`${accent}80`}/>}
                </div>
                {stats && (
                  <div style={{ marginTop:22 }}>
                    <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.15em", marginBottom:10 }}>PRICE IN RANGE</p>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.stone }}>₹{stats.lowest}</span>
                      <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.stone }}>₹{stats.highest}</span>
                    </div>
                    <div style={{ height:5, background:C.silk, borderRadius:3, overflow:"hidden" }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${((factory.pricePerKilo-stats.lowest)/(stats.highest-stats.lowest))*100}%` }} transition={{ duration:1, delay:0.5, ease:[0.25,1,0.5,1] }}
                        style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg, ${accentM}, ${accent})` }} />
                    </div>
                    <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:C.stone, letterSpacing:"0.1em", marginTop:7, textAlign:"center" }}>Current ₹{factory.pricePerKilo}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <footer style={{ background:C.navy, padding:"20px 40px", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.22em", color:"rgba(255,255,255,0.35)" }}>TEATRACKER · COMMODITY INTELLIGENCE PLATFORM · {new Date().getFullYear()}</span>
          <span style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:11, color:"rgba(255,255,255,0.2)" }}>Developed & all rights reserved · Darshan Bharathi R</span>
        </footer>
      </div>
    </>
  );
}