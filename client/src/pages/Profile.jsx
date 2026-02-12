import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { 
  Factory, User, Phone, Clock, 
  MapPin, IndianRupee, Calendar, 
  CheckCircle2, AlertCircle, Save,
  Coffee, Leaf
} from "lucide-react";

export default function Profile() {
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    factoryName: "",
    ownerName: "",
    contactNumber: "",
    address: "",
    commodityType: "Tea",
    pricePerKilo: "",
    effectiveDate: "",
    operatingHours: ""
  });

  useEffect(() => {
    API.get("/profile/me")
      .then((res) => {
        if (res.data) {
          setProfileId(res.data._id);
          setForm({
            factoryName: res.data.factoryName,
            ownerName: res.data.ownerName,
            contactNumber: res.data.contactNumber,
            address: res.data.address,
            commodityType: res.data.commodityType,
            pricePerKilo: res.data.pricePerKilo,
            effectiveDate: res.data.effectiveDate?.split("T")[0],
            operatingHours: res.data.operatingHours
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      const numeric = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, [name]: numeric });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!form.factoryName || form.factoryName.length < 3) newErrors.factoryName = "Business name too short";
    if (!/^[a-zA-Z\s]+$/.test(form.ownerName)) newErrors.ownerName = "Invalid name format";
    if (!/^\d{10}$/.test(form.contactNumber)) newErrors.contactNumber = "10-digit mobile required";
    if (!form.address || form.address.length < 10) newErrors.address = "Detailed address required";
    if (!form.pricePerKilo || Number(form.pricePerKilo) <= 0) newErrors.pricePerKilo = "Enter valid price";
    if (!form.effectiveDate || form.effectiveDate < today) newErrors.effectiveDate = "Date cannot be in past";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      if (profileId) await API.put(`/profile/${profileId}`, form);
      else await API.post("/profile", form);
      
      setSuccess("Changes published successfully");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="text-sage font-bold tracking-widest uppercase">Initializing Profile...</motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] px-6 py-12 text-coffee">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-4xl font-black text-coffee tracking-tight">Factory Configuration</h1>
          <p className="text-gray-500 font-medium">Configure your public procurement profile and pricing.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* MAIN FORM AREA */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
              <div className="flex items-center gap-2 mb-8 text-sage">
                <Factory size={20} />
                <h2 className="text-xl font-bold text-coffee">General Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Factory Name" name="factoryName" value={form.factoryName} onChange={handleChange} error={errors.factoryName} icon={<Factory size={16}/>} />
                <InputGroup label="Owner/Manager" name="ownerName" value={form.ownerName} onChange={handleChange} error={errors.ownerName} icon={<User size={16}/>} />
                <InputGroup label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} error={errors.contactNumber} icon={<Phone size={16}/>} />
                <InputGroup label="Operating Hours" name="operatingHours" value={form.operatingHours} onChange={handleChange} error={errors.operatingHours} icon={<Clock size={16}/>} placeholder="e.g. 9 AM - 6 PM" />
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-10">
              <div className="flex items-center gap-2 mb-8 text-sage">
                <IndianRupee size={20} />
                <h2 className="text-xl font-bold text-coffee">Procurement & Logistics</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Commodity Type</label>
                  <div className="flex gap-2">
                    {["Tea", "Coffee"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setForm({...form, commodityType: type})}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all border ${form.commodityType === type ? 'bg-sage text-white border-sage' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <InputGroup label="Rate (per kg)" name="pricePerKilo" value={form.pricePerKilo} onChange={handleChange} error={errors.pricePerKilo} icon={<IndianRupee size={16}/>} />
                <InputGroup label="Effective Date" name="effectiveDate" value={form.effectiveDate} onChange={handleChange} error={errors.effectiveDate} type="date" icon={<Calendar size={16}/>} />
                
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Factory Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-300" size={18} />
                    <textarea
                      name="address"
                      rows="3"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sage/20 transition-all outline-none resize-none"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.address}</p>}
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t pt-8">
                <AnimatePresence>
                  {success && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-green-600 font-bold flex items-center gap-2">
                      <CheckCircle2 size={18} /> {success}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-coffee text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-coffee/20 hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? "Publishing..." : <><Save size={18}/> {profileId ? "Update Profile" : "Create Profile"}</>}
                </button>
              </div>
            </section>
          </motion.div>

          {/* STICKY PREVIEW CARD */}
          <aside className="lg:col-span-1">
            <div className="sticky top-10 space-y-6">
              <div className="bg-coffee rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mb-8">Live Public Preview</h3>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      {form.commodityType === "Tea" ? <Leaf size={24} className="text-sage" /> : <Coffee size={24} className="text-mustard" />}
                    </div>
                  </div>

                  <h4 className="text-2xl font-black mb-2">{form.factoryName || "Unnamed Factory"}</h4>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black italic">₹{form.pricePerKilo || "0"}</span>
                    <span className="text-white/40">/kg</span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/10 text-sm text-white/70 font-medium">
                    <div className="flex items-center gap-3"><User size={14}/> {form.ownerName || "No Owner Set"}</div>
                    <div className="flex items-center gap-3"><MapPin size={14}/> <span className="line-clamp-1">{form.address || "No Address Set"}</span></div>
                  </div>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-sage/10 rounded-full blur-3xl"></div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 text-xs font-medium">This is how your factory appears to registered sellers in the directory.</p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

// Reusable Input Component for cleaner code
function InputGroup({ label, name, value, onChange, error, type = "text", icon, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">{icon}</div>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-12' : 'px-4'} pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sage/20 transition-all outline-none text-sm font-medium`}
        />
      </div>
      {error && <p className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1 uppercase tracking-tight"><AlertCircle size={10}/> {error}</p>}
    </div>
  );
}