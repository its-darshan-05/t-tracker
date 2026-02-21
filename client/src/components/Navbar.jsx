import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, LayoutGrid, User, LogOut, LogIn, UserPlus } from "lucide-react";

const C = {
  white: "#FFFFFF", pearl: "#F4F3EF", silk: "#EAE9E4",
  stone: "#9B9A94", slate: "#6B6A64", ink: "#2C2B27",
  navy: "#1B2A4A", navyD: "#0F1E38",
  teal: "#0D7A6B", tealL: "#E8F5F3", tealM: "#B3DDD8",
};

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; background: #FAFAF8; }
    a { text-decoration: none; }
    button { cursor: pointer; }
    input, button, select, textarea { outline: none; }
  `}</style>
);

export default function Navbar() {
  const token    = localStorage.getItem("token");
  const location = useLocation();
  const logout   = () => { localStorage.removeItem("token"); window.location.href = "/"; };
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <FontStyle />
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{
          width: "100%", background: C.white,
          borderBottom: `1px solid ${C.silk}`,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
          position: "sticky", top: 0, zIndex: 200,
        }}
      >
        <div style={{
          maxWidth: 1320, margin: "0 auto",
          padding: "0 40px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* BRAND */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div
              whileHover={{ scale: 1.06, rotate: -6 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: C.teal,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(13,122,107,0.28)",
              }}
            >
              <Leaf size={17} color="#fff" />
            </motion.div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 700,
              color: C.navy, letterSpacing: "-0.025em",
            }}>
              Tea<span style={{ fontStyle: "italic", color: C.teal }}>Tracker</span>
            </span>
          </Link>

          {/* LINKS */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <NavLink to="/" active={isActive("/")} icon={<LayoutGrid size={13} />} label="Factories" />

            <AnimatePresence mode="wait">
              {token ? (
                <motion.div key="auth"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <NavLink to="/profile" active={isActive("/profile")} icon={<User size={13} />} label="My Profile" />
                  <div style={{ width: 1, height: 20, background: C.silk, margin: "0 6px" }} />
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={logout}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "8px 16px", borderRadius: 10,
                      background: "transparent", border: `1px solid ${C.silk}`,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10, letterSpacing: "0.12em", color: C.slate,
                      transition: "all 0.18s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.cssText += "background:#FDF0EE;border-color:#F5B7B1;color:#C0392B;"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.silk; e.currentTarget.style.color = C.slate; }}
                  >
                    <LogOut size={13} /> LOGOUT
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="guest"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.22 }}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <NavLink to="/login" active={isActive("/login")} icon={<LogIn size={13} />} label="Login" />
                  <Link to="/register" style={{ marginLeft: 4 }}>
                    <motion.div
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "9px 18px", borderRadius: 10,
                        background: C.navy, color: "#fff",
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10, letterSpacing: "0.12em", fontWeight: 500,
                        boxShadow: "0 2px 12px rgba(27,42,74,0.2)",
                        transition: "all 0.2s ease", cursor: "pointer",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.navyD; e.currentTarget.style.boxShadow = "0 4px 18px rgba(27,42,74,0.32)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.boxShadow = "0 2px 12px rgba(27,42,74,0.2)"; }}
                    >
                      <UserPlus size={13} /> REGISTER
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>
    </>
  );
}

function NavLink({ to, active, icon, label }) {
  const C2 = { tealL: "#E8F5F3", tealM: "#B3DDD8", teal: "#0D7A6B", slate: "#6B6A64", pearl: "#F4F3EF", ink: "#2C2B27" };
  return (
    <Link to={to} style={{ position: "relative" }}>
      <motion.div
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "8px 14px", borderRadius: 10,
          background: active ? C2.tealL : "transparent",
          border: `1px solid ${active ? C2.tealM : "transparent"}`,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, letterSpacing: "0.12em",
          color: active ? C2.teal : C2.slate,
          transition: "all 0.18s ease", cursor: "pointer",
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C2.pearl; e.currentTarget.style.color = C2.ink; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C2.slate; } }}
      >
        {icon}{label.toUpperCase()}
      </motion.div>
      {active && (
        <motion.div layoutId="nav-dot"
          style={{ position: "absolute", bottom: -17, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: C2.teal }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}