import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { 
  ArrowLeft, Calendar, MapPin, Phone, 
  User, Clock, TrendingUp, TrendingDown, 
  Award, ShieldCheck, Activity
} from "lucide-react";

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
      const formatted = historyRes.data.map((item) => ({
        rawDate: item.date,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: item.price
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
    const prices = history.map((h) => h.price);
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const last = prices[prices.length - 1];
    const previous = prices[prices.length - 2] || last;
    const change = last - previous;
    const changePercent = ((change / previous) * 100).toFixed(2);

    return { highest, lowest, avg: avg.toFixed(2), change, changePercent };
  }, [history]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] px-6 py-10 text-coffee">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="max-w-7xl mx-auto"
      >
        {/* BACK BUTTON & TOP NAV */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-sage transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Factories</span>
        </button>

        {/* HERO HEADER */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-sage/10 text-sage px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {factory.commodityType}
                </span>
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                  <ShieldCheck size={14} /> Verified Source
                </div>
              </div>
              <h1 className="text-5xl font-black text-coffee mb-6">{factory.factoryName}</h1>
              
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Current Procurement Price</p>
                  <p className="text-6xl font-black text-coffee">₹{factory.pricePerKilo}<span className="text-xl text-gray-400">/kg</span></p>
                </div>
                {stats && (
                  <div className={`mb-2 px-3 py-1 rounded-xl flex items-center gap-1 font-bold ${stats.change >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {stats.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(stats.changePercent)}%
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* CONTACT & LOGISTICS CARD */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-coffee text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold border-b border-white/10 pb-4">Factory Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><User size={20} /></div>
                  <div><p className="text-xs text-gray-400">Manager</p><p className="font-medium">{factory.ownerName}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Phone size={20} /></div>
                  <div><p className="text-xs text-gray-400">Direct Line</p><p className="font-medium">{factory.contactNumber}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
                  <div><p className="text-xs text-gray-400">Operating Hours</p><p className="font-medium">{factory.operatingHours}</p></div>
                </div>
              </div>
            </div>
            <Activity className="absolute bottom-[-20px] right-[-20px] w-40 h-40 text-white/5" />
          </motion.div>
        </div>

        {/* STATS TICKER */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Market High", value: `₹${stats.highest}`, icon: <Award className="text-mustard" />, color: "bg-mustard/10" },
              { label: "Market Low", value: `₹${stats.lowest}`, icon: <TrendingDown className="text-red-400" />, color: "bg-red-50" },
              { label: "Weighted Avg", value: `₹${stats.avg}`, icon: <Activity className="text-sage" />, color: "bg-sage/10" },
              { label: "Last Updated", value: new Date(factory.updatedAt).toLocaleDateString(), icon: <Calendar className="text-blue-400" />, color: "bg-blue-50" }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5"
              >
                <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center`}>{s.icon}</div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                  <p className="text-xl font-black text-coffee">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CHART SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold text-coffee">Price Performance</h2>
              <p className="text-gray-400">Historical procurement cost analytics</p>
            </div>
            <div className="hidden md:block bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-xs font-bold">Price Trend</button>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#73A580" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#73A580" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#999', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#999', fontSize: 12}} 
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#73A580" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  dot={{ r: 6, fill: '#73A580', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}