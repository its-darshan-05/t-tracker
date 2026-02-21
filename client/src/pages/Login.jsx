import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Factory } from "lucide-react";

/* ─── DESIGN TOKENS ─────────────────────────────────────── */
const C = {
  paper:  "#FAFAF8",
  white:  "#FFFFFF",
  pearl:  "#F4F3EF",
  silk:   "#EAE9E4",
  mist:   "#D4D3CC",
  stone:  "#9B9A94",
  slate:  "#6B6A64",
  ink:    "#2C2B27",
  navy:   "#1B2A4A",
  navyD:  "#0F1E38",
  teal:   "#0D7A6B",
  tealL:  "#E8F5F3",
  tealM:  "#B3DDD8",
  rose:   "#C0392B",
  roseL:  "#FDF0EE",
  roseM:  "#F5B7B1",
};

/* ─── FONTS ──────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { background: #FAFAF8; }

    input::placeholder { color: #C8C7C0; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; }
    input:focus { outline: none; }
    button:focus { outline: none; }

    .auth-input {
      width: 100%;
      background: #F4F3EF;
      border: 1.5px solid transparent;
      border-radius: 12px;
      padding: 14px 16px 14px 46px;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 13.5px;
      color: #2C2B27;
      transition: all 0.18s ease;
      letter-spacing: 0.01em;
    }
    .auth-input:focus {
      background: #FFFFFF;
      border-color: #1B2A4A;
      box-shadow: 0 0 0 3px rgba(27,42,74,0.07);
    }
    .auth-input.error {
      border-color: #C0392B;
      background: #FDF0EE;
    }

    .login-btn {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      background: #1B2A4A; color: #FFFFFF;
      border: none; border-radius: 12px;
      padding: 15px 24px; cursor: pointer;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px; letter-spacing: 0.18em; font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 4px 20px rgba(27,42,74,0.22);
    }
    .login-btn:hover:not(:disabled) {
      background: #0F1E38;
      box-shadow: 0 6px 28px rgba(27,42,74,0.32);
      transform: translateY(-1px);
    }
    .login-btn:active:not(:disabled) { transform: translateY(0); }
    .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `}</style>
);

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const login = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all credentials"); return; }
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setTimeout(() => { window.location.href = "/profile"; }, 500);
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FontStyle />
      <div style={{
        minHeight: "100vh",
        background: C.paper,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* ── LEFT PANEL (brand) ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          style={{
            width: "42%",
            background: C.navy,
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 52px 48px",
            position: "relative", overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Subtle geometric bg decoration */}
          <div style={{
            position: "absolute", bottom: -80, right: -80,
            width: 340, height: 340, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${C.teal}, transparent)`,
          }} />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 52,
            }}>
              <Factory size={22} color="rgba(255,255,255,0.9)" />
            </div>

            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10, letterSpacing: "0.3em",
              color: C.teal, textTransform: "uppercase", marginBottom: 20,
            }}>
              Commodity Intelligence
            </p>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15,
              color: "#FFFFFF", marginBottom: 24,
            }}>
              The smarter way to manage{" "}
              <span style={{ fontStyle: "italic", color: C.tealM }}>procurement.</span>
            </h1>

            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75, maxWidth: 320,
            }}>
              Real-time pricing, factory directory, and market analytics — all in one platform built for commodity traders.
            </p>
          </div>

          {/* Bottom trust block */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              height: 1,
              background: "rgba(255,255,255,0.07)",
              marginBottom: 24,
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={14} color={C.tealM} />
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10, color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.14em",
              }}>
                ENTERPRISE-GRADE SECURITY · DATA ENCRYPTED
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL (form) ──────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 48px",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            style={{ width: "100%", maxWidth: 400 }}
          >

            {/* Title */}
            <div style={{ marginBottom: 44 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 24, height: 2, background: C.navy, borderRadius: 1 }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10, letterSpacing: "0.28em",
                  color: C.navy, textTransform: "uppercase",
                }}>
                  Secure Access
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36, fontWeight: 700,
                letterSpacing: "-0.03em", color: C.ink,
                lineHeight: 1.1, marginBottom: 10,
              }}>
                Welcome{" "}
                <span style={{ fontStyle: "italic", color: C.navy }}>back.</span>
              </h2>
              <p style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13.5, color: C.stone, lineHeight: 1.6,
              }}>
                Sign in to access your factory dashboard.
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px", borderRadius: 12,
                    background: C.roseL, border: `1px solid ${C.roseM}`,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 13, color: C.rose,
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>

              {/* Email */}
              <div>
                <p style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9, letterSpacing: "0.22em",
                  color: C.stone, textTransform: "uppercase", marginBottom: 8,
                }}>
                  Official Email
                </p>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{
                    position: "absolute", left: 15, top: "50%",
                    transform: "translateY(-50%)",
                    color: C.mist, pointerEvents: "none",
                  }} />
                  <input
                    type="email"
                    placeholder="name@factory.com"
                    className={`auth-input${error ? " error" : ""}`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && login()}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <p style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9, letterSpacing: "0.22em",
                  color: C.stone, textTransform: "uppercase", marginBottom: 8,
                }}>
                  Security Key
                </p>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{
                    position: "absolute", left: 15, top: "50%",
                    transform: "translateY(-50%)",
                    color: C.mist, pointerEvents: "none",
                  }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`auth-input${error ? " error" : ""}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && login()}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={login}
              disabled={loading}
              className="login-btn"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  AUTHENTICATE
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div style={{
              margin: "36px 0 28px",
              height: 1, background: C.silk,
            }} />

            {/* Register link */}
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 13, color: C.stone,
              textAlign: "center",
            }}>
              New to MarketCore?{" "}
              <Link to="/register" style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, letterSpacing: "0.1em",
                color: C.navy, fontWeight: 500,
                textDecoration: "none",
                borderBottom: `1px solid ${C.navy}`,
                paddingBottom: 1,
              }}>
                CREATE ACCOUNT
              </Link>
            </p>

            {/* Help */}
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12, color: C.mist,
              textAlign: "center", marginTop: 16,
            }}>
              Trouble logging in?{" "}
              <span style={{
                color: C.stone, cursor: "pointer",
                borderBottom: `1px solid ${C.mist}`,
                paddingBottom: 1,
              }}>
                Contact Support
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}