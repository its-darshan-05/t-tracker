import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Factory, User, Phone, Clock, MapPin, IndianRupee, Calendar, CheckCircle2, AlertCircle, Save, Coffee, Leaf, Eye, Settings } from "lucide-react";

const C = {
  paper:"#FAFAF8", white:"#FFFFFF", pearl:"#F4F3EF", silk:"#EAE9E4",
  mist:"#D4D3CC", stone:"#9B9A94", slate:"#6B6A64", ink:"#2C2B27",
  navy:"#1B2A4A", navyD:"#0F1E38",
  teal:"#0D7A6B", tealL:"#E8F5F3", tealM:"#B3DDD8",
  gold:"#B8860B", goldL:"#FDF6E3", goldM:"#F0D080",
  rose:"#C0392B", roseL:"#FDF0EE", roseM:"#F5B7B1",
  green:"#1A7A3C", greenL:"#EAF7EE", greenM:"#A9D9B8",
};

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #FAFAF8; }
    ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#EAE9E4;} ::-webkit-scrollbar-thumb{background:#D4D3CC;border-radius:3px;}
    input::placeholder{color:#C8C7C0;font-family:'IBM Plex Sans',sans-serif;font-size:13px;}
    textarea::placeholder{color:#C8C7C0;font-family:'IBM Plex Sans',sans-serif;font-size:13px;}
    input:focus,select:focus,button:focus,textarea:focus{outline:none;}
    input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.4;cursor:pointer;}
    .input-field{width:100%;background:#F4F3EF;border:1.5px solid transparent;border-radius:12px;padding:12px 16px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;color:#2C2B27;transition:all 0.18s ease;}
    .input-field:focus{background:#FFFFFF;border-color:#1B2A4A;box-shadow:0 0 0 3px rgba(27,42,74,0.07);}
    .input-field.has-error{border-color:#C0392B;background:#FDF0EE;}
    .input-field.has-icon{padding-left:44px;}
    .textarea-field{width:100%;background:#F4F3EF;border:1.5px solid transparent;border-radius:12px;padding:12px 16px 12px 44px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;color:#2C2B27;resize:none;transition:all 0.18s ease;line-height:1.6;}
    .textarea-field:focus{background:#FFFFFF;border-color:#1B2A4A;box-shadow:0 0 0 3px rgba(27,42,74,0.07);}
    .textarea-field.has-error{border-color:#C0392B;background:#FDF0EE;}
    .save-btn{display:flex;align-items:center;gap:10px;background:#1B2A4A;color:#FFFFFF;border:none;border-radius:12px;padding:14px 32px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.14em;font-weight:500;transition:all 0.2s ease;box-shadow:0 4px 20px rgba(27,42,74,0.25);}
    .save-btn:hover:not(:disabled){background:#0F1E38;box-shadow:0 6px 28px rgba(27,42,74,0.35);transform:translateY(-1px);}
    .save-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
    @keyframes float-icon{0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;}
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
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><Settings size={18} color={C.navy} /></div>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.teal, letterSpacing:"0.3em", marginBottom:6 }}>INITIALIZING</p>
        <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", color:C.stone, fontSize:13 }}>Loading your factory profile...</p>
      </div>
      <div style={{ width:180, height:2, background:C.silk, borderRadius:1, overflow:"hidden" }}>
        <motion.div animate={{ x:["-100%","200%"] }} transition={{ duration:1.2, repeat:Infinity, ease:"easeInOut" }}
          style={{ height:"100%", width:"45%", background:`linear-gradient(90deg, transparent, ${C.navy}, transparent)` }} />
      </div>
    </div>
  );
}

const Label = ({children}) => (
  <p style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, letterSpacing:"0.22em", color:C.stone, textTransform:"uppercase", marginBottom:8 }}>{children}</p>
);

const ErrorMsg = ({msg}) => !msg ? null : (
  <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
    style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, fontFamily:"'IBM Plex Mono', monospace", fontSize:9, letterSpacing:"0.1em", color:C.rose, textTransform:"uppercase" }}>
    <AlertCircle size={10} />{msg}
  </motion.div>
);

function InputGroup({ label, name, value, onChange, error, type="text", icon, placeholder }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ position:"relative" }}>
        {icon && <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:error?C.rose:C.mist, pointerEvents:"none" }}>{icon}</div>}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className={`input-field ${icon?"has-icon":""} ${error?"has-error":""}`} />
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
}

function Section({ title, icon, children, delay=0 }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.5, ease:[0.25,1,0.5,1] }}
      style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:20, boxShadow:"0 2px 16px rgba(27,42,74,0.05)" }}>
      <div style={{ padding:"24px 32px", borderBottom:`1px solid ${C.pearl}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:C.tealL, border:`1px solid ${C.tealM}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:600, color:C.ink, letterSpacing:"-0.01em" }}>{title}</h2>
      </div>
      <div style={{ padding:"28px 32px 32px" }}>{children}</div>
    </motion.div>
  );
}

function PreviewCard({ form }) {
  const isTea=form.commodityType==="Tea";
  const accent=isTea?C.teal:C.gold, accentL=isTea?C.tealL:C.goldL, accentM=isTea?C.tealM:C.goldM;
  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25, duration:0.55, ease:[0.25,1,0.5,1] }} style={{ position:"sticky", top:84 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"0 4px" }}>
        <Eye size={13} color={C.stone} />
        <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, letterSpacing:"0.22em", color:C.stone, textTransform:"uppercase" }}>Live Public Preview</span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5 }}>
          <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:2, repeat:Infinity }} style={{ width:6, height:6, borderRadius:"50%", background:C.teal }} />
          <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:8, color:C.teal, letterSpacing:"0.15em" }}>LIVE</span>
        </div>
      </div>
      <div style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:20, overflow:"hidden", boxShadow:"0 4px 24px rgba(27,42,74,0.08)" }}>
        <div style={{ height:4, background:`linear-gradient(90deg, ${accent}, ${accentM})` }} />
        <div style={{ padding:"26px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <motion.div key={form.commodityType} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
              style={{ width:48, height:48, borderRadius:14, background:accentL, border:`1px solid ${accentM}`, display:"flex", alignItems:"center", justifyContent:"center", animation:"float-icon 4s ease-in-out infinite" }}>
              {isTea?<Leaf size={22} color={accent}/>:<Coffee size={22} color={accent}/>}
            </motion.div>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, letterSpacing:"0.18em", color:accent, background:accentL, border:`1px solid ${accentM}`, padding:"4px 10px", borderRadius:6, textTransform:"uppercase" }}>{form.commodityType}</span>
          </div>
          <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:600, color:C.ink, marginBottom:4, letterSpacing:"-0.01em", lineHeight:1.3, minHeight:28 }}>
            {form.factoryName||<span style={{ color:C.mist, fontStyle:"italic", fontWeight:400 }}>Unnamed Factory</span>}
          </h3>
          <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:22 }}>
            <motion.span key={form.pricePerKilo} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
              style={{ fontFamily:"'Playfair Display', serif", fontSize:36, fontWeight:700, color:accent, letterSpacing:"-0.03em", lineHeight:1.1 }}>
              ₹{form.pricePerKilo||"0"}
            </motion.span>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, color:C.stone }}>/kg</span>
          </div>
          <div style={{ height:1, background:C.pearl, marginBottom:18 }} />
          {[{icon:<User size={12} color={accent}/>, val:form.ownerName||"No owner set"},
            {icon:<MapPin size={12} color={accent}/>, val:form.address||"No address set", truncate:true},
            {icon:<Clock size={12} color={accent}/>, val:form.operatingHours||"Hours not set"},
          ].map((row,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:10 }}>
              <span style={{ marginTop:2, flexShrink:0 }}>{row.icon}</span>
              <span style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:12.5, color:C.slate, lineHeight:1.4, overflow:row.truncate?"hidden":undefined, textOverflow:row.truncate?"ellipsis":undefined, whiteSpace:row.truncate?"nowrap":undefined }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop:14, padding:"14px 18px", background:C.pearl, border:`1px dashed ${C.mist}`, borderRadius:12, textAlign:"center" }}>
        <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:11.5, color:C.stone, lineHeight:1.6 }}>This is how your factory appears to registered sellers in the public directory.</p>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState("");
  const [errors, setErrors]       = useState({});
  const [form, setForm] = useState({ factoryName:"", ownerName:"", contactNumber:"", address:"", commodityType:"Tea", pricePerKilo:"", effectiveDate:"", operatingHours:"" });

  useEffect(() => {
    API.get("/profile/me").then(res => {
      if (res.data) {
        setProfileId(res.data._id);
        setForm({ factoryName:res.data.factoryName, ownerName:res.data.ownerName, contactNumber:res.data.contactNumber, address:res.data.address, commodityType:res.data.commodityType, pricePerKilo:res.data.pricePerKilo, effectiveDate:res.data.effectiveDate?.split("T")[0], operatingHours:res.data.operatingHours });
      }
    }).finally(()=>setLoading(false));
  }, []);

  const handleChange = (e) => {
    const {name,value}=e.target;
    if (name==="contactNumber") setForm({...form,[name]:value.replace(/\D/g,"").slice(0,10)});
    else setForm({...form,[name]:value});
    if (errors[name]) setErrors({...errors,[name]:""});
  };

  const validate = () => {
    const errs={}, today=new Date().toISOString().split("T")[0];
    if(!form.factoryName||form.factoryName.length<3) errs.factoryName="Business name too short";
    if(!/^[a-zA-Z\s]+$/.test(form.ownerName)) errs.ownerName="Invalid name format";
    if(!/^\d{10}$/.test(form.contactNumber)) errs.contactNumber="10-digit mobile required";
    if(!form.address||form.address.length<10) errs.address="Detailed address required";
    if(!form.pricePerKilo||Number(form.pricePerKilo)<=0) errs.pricePerKilo="Enter valid price";
    if(!form.effectiveDate||form.effectiveDate<today) errs.effectiveDate="Date cannot be in past";
    setErrors(errs);
    return Object.keys(errs).length===0;
  };

  const saveProfile = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      if (profileId) await API.put(`/profile/${profileId}`, form);
      else           await API.post("/profile", form);
      setSuccess("Profile published successfully");
      setTimeout(()=>setSuccess(""), 4000);
    } catch(err){ console.error(err); } finally { setSaving(false); }
  };

  if (loading) return (<><FontStyle /><LoadingScreen /></>);

  const isTea=form.commodityType==="Tea";
  const accent=isTea?C.teal:C.gold;

  return (
    <>
      <FontStyle />
      <div style={{ minHeight:"100vh", background:C.paper, color:C.ink }}>
        <header style={{ background:C.white, borderBottom:`1px solid ${C.silk}`, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 rgba(0,0,0,0.04)" }}>
          <div style={{ maxWidth:1320, margin:"0 auto", padding:"0 40px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:C.teal, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(13,122,107,0.28)" }}><Leaf size={16} color="#fff" /></div>
              <span style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:700, color:C.navy, letterSpacing:"-0.02em" }}>Tea<span style={{ fontStyle:"italic", color:C.teal }}>Tracker</span></span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 16px", borderRadius:20, background:C.pearl, border:`1px solid ${C.silk}` }}>
              <Settings size={12} color={C.stone} />
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, color:C.slate, letterSpacing:"0.14em" }}>FACTORY CONFIG</span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth:1320, margin:"0 auto", padding:"56px 40px 80px" }}>
          <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.25,1,0.5,1] }} style={{ marginBottom:48 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:28, height:2, background:C.navy, borderRadius:1 }} />
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.28em", color:C.navy, textTransform:"uppercase" }}>Profile Management</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(32px, 4vw, 50px)", fontWeight:700, letterSpacing:"-0.03em", lineHeight:1.1, color:C.ink }}>
              Factory <span style={{ fontStyle:"italic", color:C.navy }}>Configuration</span>
            </h1>
            <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:13.5, color:C.stone, marginTop:10, lineHeight:1.7 }}>Configure your public procurement profile and pricing. Changes reflect live in the directory.</p>
          </motion.div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 310px", gap:28, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <Section title="General Information" icon={<Factory size={17} color={C.teal}/>} delay={0.08}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <InputGroup label="Factory / Business Name" name="factoryName" value={form.factoryName} onChange={handleChange} error={errors.factoryName} icon={<Factory size={15}/>} placeholder="e.g. Nilgiri Tea Estates" />
                  <InputGroup label="Owner / Manager Name" name="ownerName" value={form.ownerName} onChange={handleChange} error={errors.ownerName} icon={<User size={15}/>} placeholder="Full name" />
                  <InputGroup label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} error={errors.contactNumber} icon={<Phone size={15}/>} placeholder="10-digit mobile" />
                  <InputGroup label="Operating Hours" name="operatingHours" value={form.operatingHours} onChange={handleChange} error={errors.operatingHours} icon={<Clock size={15}/>} placeholder="e.g. 9 AM – 6 PM" />
                </div>
              </Section>

              <Section title="Procurement & Pricing" icon={<IndianRupee size={17} color={C.teal}/>} delay={0.14}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <div>
                    <Label>Commodity Type</Label>
                    <div style={{ display:"flex", gap:8 }}>
                      {["Tea","Coffee"].map(type=>{
                        const act=form.commodityType===type, isT=type==="Tea";
                        const bg=act?(isT?C.teal:C.gold):C.pearl, border=act?(isT?C.teal:C.gold):C.silk, color=act?"#fff":C.slate;
                        return (
                          <motion.button key={type} whileTap={{ scale:0.97 }} onClick={()=>setForm({...form,commodityType:type})}
                            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", borderRadius:12, border:`1.5px solid ${border}`, background:bg, color, cursor:"pointer", fontFamily:"'IBM Plex Mono', monospace", fontSize:11, letterSpacing:"0.1em", fontWeight:500, transition:"all 0.18s ease" }}>
                            {isT?<Leaf size={14} color={act?"#fff":C.teal}/>:<Coffee size={14} color={act?"#fff":C.gold}/>}
                            {type.toUpperCase()}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <InputGroup label="Rate per Kilogram (₹)" name="pricePerKilo" value={form.pricePerKilo} onChange={handleChange} error={errors.pricePerKilo} icon={<IndianRupee size={15}/>} placeholder="e.g. 340" />
                  <InputGroup label="Effective Date" name="effectiveDate" value={form.effectiveDate} onChange={handleChange} error={errors.effectiveDate} type="date" icon={<Calendar size={15}/>} />
                  <div style={{ gridColumn:"1 / -1" }}>
                    <Label>Factory Address</Label>
                    <div style={{ position:"relative" }}>
                      <MapPin size={15} style={{ position:"absolute", left:14, top:14, color:errors.address?C.rose:C.mist, pointerEvents:"none" }} />
                      <textarea name="address" rows={3} value={form.address} onChange={handleChange} placeholder="Full factory address including district and state" className={`textarea-field ${errors.address?"has-error":""}`} />
                    </div>
                    <ErrorMsg msg={errors.address} />
                  </div>
                </div>
              </Section>

              {/* Save bar */}
              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
                style={{ background:C.white, border:`1px solid ${C.silk}`, borderRadius:16, padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(27,42,74,0.05)" }}>
                <AnimatePresence>
                  {success ? (
                    <motion.div key="success" initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                      style={{ display:"flex", alignItems:"center", gap:8, fontFamily:"'IBM Plex Mono', monospace", fontSize:10, letterSpacing:"0.12em", color:C.green, background:C.greenL, border:`1px solid ${C.greenM}`, padding:"8px 16px", borderRadius:8 }}>
                      <CheckCircle2 size={14} color={C.green} />{success.toUpperCase()}
                    </motion.div>
                  ) : (
                    <p style={{ fontFamily:"'IBM Plex Sans', sans-serif", fontSize:12.5, color:C.stone }}>
                      {profileId?"Update your profile to reflect new prices.":"Create your profile to appear in the directory."}
                    </p>
                  )}
                </AnimatePresence>
                <button className="save-btn" onClick={saveProfile} disabled={saving}>
                  {saving ? <div className="spinner" /> : <><Save size={14}/>{profileId?"UPDATE PROFILE":"CREATE PROFILE"}</>}
                </button>
              </motion.div>
            </div>

            <PreviewCard form={form} />
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