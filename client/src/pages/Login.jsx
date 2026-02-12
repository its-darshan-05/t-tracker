import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all credentials");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      
      // Smooth redirect
      setTimeout(() => {
        window.location.href = "/profile";
      }, 500);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center px-4 overflow-hidden relative">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sage/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mustard/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        {/* LOGO AREA */}
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-16 h-16 bg-coffee rounded-3xl flex items-center justify-center shadow-2xl shadow-coffee/20"
          >
            <ShieldCheck className="text-sage" size={32} />
          </motion.div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-10 relative">
          
          {/* HEADER */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-coffee tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400 font-medium">
              Access your factory dashboard
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100">
                  <AlertCircle size={18} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            {/* EMAIL */}
            <div className="group">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                Official Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-sage transition-colors" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sage/20 transition-all outline-none font-medium placeholder:text-gray-300"
                  placeholder="name@factory.com"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="group">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-2 mb-2 block">
                Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-sage transition-colors" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sage/20 transition-all outline-none font-medium placeholder:text-gray-300"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                />
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={login}
              disabled={loading}
              className="w-full mt-8 py-4 rounded-[1.25rem] font-bold text-white bg-coffee hover:bg-black transition-all shadow-xl shadow-coffee/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  Authenticate
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Protected by Enterprise Grade Encryption
            </p>
          </div>
        </div>

        {/* HELP LINK */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-sm text-gray-400"
        >
          Trouble logging in? <span className="text-sage font-bold cursor-pointer hover:underline">Contact Support</span>
        </motion.p>
      </motion.div>
    </div>
  );
}