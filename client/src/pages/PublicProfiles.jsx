import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell
} from "recharts";
import { Search, Filter, RotateCcw, Copy, Check, Factory, MapPin, Phone, User, TrendingUp } from "lucide-react";

const COLORS = ["#73A580", "#E1AD01", "#3E363F", "#4CAF50", "#FF7043", "#5C6BC0", "#9C27B0", "#009688"];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

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

        if (profileList.length === 0) { setLoading(false); return; }

        const historyPromises = profileList.map((p) => API.get(`/profile/${p._id}/history`));
        const historyResults = await Promise.all(historyPromises);
        const dateSet = new Set();

        historyResults.forEach((res) => {
          res.data.forEach((item) => {
            const date = new Date(item.date).toISOString().split("T")[0];
            dateSet.add(date);
          });
        });

        const allDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));
        const weeklyDates = allDates.slice(-7);

        const finalData = weeklyDates.map((date) => {
          const row = { date };
          historyResults.forEach((res, index) => {
            const factoryName = profileList[index].factoryName;
            const record = res.data.find((item) => new Date(item.date).toISOString().split("T")[0] === date);
            row[factoryName] = record ? record.price : 0;
          });
          return row;
        });

        setChartData(finalData);
      } catch (err) {
        console.error("Data error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProfiles = useMemo(() => {
    let filtered = [...profiles];
    if (search) filtered = filtered.filter((p) => p.factoryName.toLowerCase().includes(search.toLowerCase()));
    if (commodityFilter !== "All") filtered = filtered.filter((p) => p.commodityType === commodityFilter);
    if (sortOption === "priceHigh") filtered.sort((a, b) => b.pricePerKilo - a.pricePerKilo);
    if (sortOption === "priceLow") filtered.sort((a, b) => a.pricePerKilo - b.pricePerKilo);
    return filtered;
  }, [profiles, search, commodityFilter, sortOption]);

  const copyToClipboard = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-sage border-t-transparent rounded-full mb-4"
        />
        <p className="text-coffee font-medium tracking-wide opacity-60">Synchronizing market data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] px-6 py-12 text-[#2D2D2D]">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="flex items-center gap-2 text-sage font-bold mb-2">
          <TrendingUp size={18} />
          <span className="uppercase tracking-[0.2em] text-xs">Live Market Index</span>
        </div>
        <h1 className="text-4xl font-extrabold text-coffee tracking-tight">Factory Directory</h1>
        <p className="text-gray-500 mt-2">Manage and monitor commodity procurement across all registered units.</p>
      </motion.div>

      {/* FILTER PANEL */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-10 flex flex-wrap items-center gap-2"
      >
        <div className="flex-grow flex items-center bg-gray-50 rounded-xl px-4 py-2 group focus-within:bg-white focus-within:ring-2 focus-within:ring-sage/20 transition-all">
          <Search size={18} className="text-gray-400 group-focus-within:text-sage" />
          <input
            type="text"
            placeholder="Search by factory name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 px-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={commodityFilter}
            onChange={(e) => setCommodityFilter(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none cursor-pointer py-2"
          >
            <option value="All">All Types</option>
            <option value="Tea">Tea</option>
            <option value="Coffee">Coffee</option>
          </select>
        </div>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-transparent text-sm font-medium outline-none cursor-pointer py-2 px-4 border-l border-gray-100"
        >
          <option value="none">Sort By</option>
          <option value="priceHigh">Highest Price</option>
          <option value="priceLow">Lowest Price</option>
        </select>

        <button
          onClick={() => { setSearch(""); setCommodityFilter("All"); setSortOption("none"); }}
          className="p-3 text-gray-400 hover:text-sage hover:bg-sage/5 rounded-xl transition-all"
          title="Reset Filters"
        >
          <RotateCcw size={18} />
        </button>
      </motion.div>

      {/* GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
      >
        <AnimatePresence mode="popLayout">
          {filteredProfiles.map((p) => (
            <motion.div
              key={p._id}
              layout
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/factory/${p._id}`)}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-sage/10 transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-sage/10 transition-colors">
                  <Factory className="text-gray-400 group-hover:text-sage transition-colors" size={24} />
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
                  p.commodityType === "Tea" ? "bg-sage/10 text-sage" : "bg-mustard/10 text-mustard"
                }`}>
                  {p.commodityType}
                </span>
              </div>

              <h3 className="text-xl font-bold text-coffee mb-1">{p.factoryName}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-coffee">₹{p.pricePerKilo}</span>
                <span className="text-gray-400 text-sm">/kg</span>
              </div>

              <div className="space-y-3 border-t border-gray-50 pt-5">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <User size={14} className="text-sage" />
                  <span>{p.ownerName}</span>
                </div>
                <div 
                  className="flex items-center justify-between text-sm group/contact"
                  onClick={(e) => copyToClipboard(e, p.contactNumber, p._id)}
                >
                  <div className="flex items-center gap-3 text-gray-500">
                    <Phone size={14} className="text-sage" />
                    <span>{p.contactNumber}</span>
                  </div>
                  {copied === p._id ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-300 opacity-0 group-hover/contact:opacity-100" />}
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-500">
                  <MapPin size={14} className="text-sage mt-1 shrink-0" />
                  <span className="line-clamp-1">{p.address}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* CHART SECTION */}
      {chartData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-coffee">Price Fluctuations</h2>
            <p className="text-gray-400 text-sm">Historical data comparison for the past 7 sessions</p>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8f9fa'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                {filteredProfiles.map((p, index) => (
                  <Bar
                    key={p._id}
                    dataKey={p.factoryName}
                    fill={COLORS[index % COLORS.length]}
                    radius={[6, 6, 6, 6]}
                    barSize={12}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}