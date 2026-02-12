import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { 
  UserPlus, Mail, Lock, Loader2, 
  ChevronRight, AlertCircle, CheckCircle2,
  ShieldCheck, Globe
} from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    setError("");
    if (!email || !password) {
      setError("Please provide both email and password");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", { email, password });
      setIsSuccess(true);
      
      // Professional delay before redirect
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sage via-mustard to-coffee" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sage/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-mustard/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[460px] z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100 p-10 md:p-12">
          
          {/* HEADER */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-sage/10 text-sage rounded-2xl mb-4">
              <UserPlus size={28} />
            </div>
            <h2 className="text-3xl font-black text-coffee tracking-tight">Create Account</h2>
            <p className="text-gray-400 mt-2 font-medium">Join the procurement network</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 text-green-600 text-sm font-bold"
              >
                <CheckCircle2 size={18} />
                Registration Successful! Redirecting...
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {/* EMAIL */}
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-sage transition-colors" size={18} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sage/20 transition-all outline-none font-medium"
                  placeholder="factory@domain.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2 mb-2 block">
                Choose Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-sage transition-colors" size={18} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-sage/20 transition-all outline-none font-medium"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* CTA BUTTON */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              onClick={register}
              disabled={loading || isSuccess}
              className="w-full bg-coffee text-white py-4 rounded-[1.25rem] font-bold shadow-xl shadow-coffee/20 flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Register Factory
                  <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </div>

          {/* LOGIN LINK */}
          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Already a member?{" "}
              <Link
                to="/login"
                className="text-sage font-black hover:text-coffee transition-colors ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* TRUST BAR */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-coffee">
            <ShieldCheck size={16} /> Secure
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-coffee">
            <Globe size={16} /> Regional
          </div>
        </div>
      </motion.div>
    </div>
  );
}