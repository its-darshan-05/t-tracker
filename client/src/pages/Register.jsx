import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, ArrowRight, AlertCircle,
  CheckCircle2, Factory, ShieldCheck, Globe, Leaf
} from "lucide-react";

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
  green:  "#1A7A3C",
  greenL: "#EAF7EE",
  greenM: "#A9D9B8",
  gold:   "#B8860B",
  goldL:  "#FDF6E3",
  goldM:  "#F0D080",
};

/* ─── FONTS ──────────────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { background: #FAFAF8; }

    input::placeholder { color: #C8C7C0; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; }
    input:focus, button:focus { outline: none; }

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

    .register-btn {
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
    .register-btn:hover:not(:disabled) {
      background: #0F1E38;
      box-shadow: 0 6px 28px rgba(27,42,74,0.32);
      transform: translateY(-1px);
    }
    .register-btn:active:not(:disabled) { transform: translateY(0); }
    .register-btn:disabled { opacity: 0.55; cursor: not-allowed; }

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

    @keyframes float-slow {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }

    .strength-bar {
      height: 3px; border-radius: 2px;
      transition: width 0.3s ease, background 0.3s ease;
    }
  `}</style>
);

/* ─── PASSWORD STRENGTH ──────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = [C.rose, C.gold, C.teal, C.green];
  const widths = ["25%", "50%", "75%", "100%"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: 10 }}
    >
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score - 1] : C.silk,
            transition: "background 0.3s ease",
          }} />
        ))}
      </div>
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9, letterSpacing: "0.15em",
        color: score > 0 ? colors[score - 1] : C.stone,
      }}>
        {score > 0 ? labels[score - 1].toUpperCase() : ""}
      </p>
    </motion.div>
  );
}

/* ─── FEATURE ITEM ───────────────────────────────────────── */
function FeatureItem({ icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 2,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 13.5, fontWeight: 600,
          color: "rgba(255,255,255,0.85)", marginBottom: 4,
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 12.5, color: "rgba(255,255,255,0.35)", lineHeight: 1.6,
        }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function Register() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    setError("");
    if (!email || !password) { setError("Please provide both email and password"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      await API.post("/auth/register", { email, password });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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

        {/* ── LEFT PANEL (form) ───────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 56px",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            style={{ width: "100%", maxWidth: 400 }}
          >

            {/* Logo mark */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: C.navy,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Factory size={18} color="#fff" />
              </div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 16, fontWeight: 700,
                color: C.navy, letterSpacing: "-0.02em",
              }}>
                MarketCore
              </span>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 24, height: 2, background: C.teal, borderRadius: 1 }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10, letterSpacing: "0.28em",
                  color: C.teal, textTransform: "uppercase",
                }}>
                  Create Account
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 34, fontWeight: 700,
                letterSpacing: "-0.03em", color: C.ink,
                lineHeight: 1.1, marginBottom: 10,
              }}>
                Join the{" "}
                <span style={{ fontStyle: "italic", color: C.navy }}>network.</span>
              </h2>
              <p style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13.5, color: C.stone, lineHeight: 1.65,
              }}>
                Register your factory and start appearing in the live procurement directory.
              </p>
            </div>

            {/* Status banners */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
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

              {isSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, marginBottom: 0 }}
                  animate={{ opacity: 1, scale: 1, marginBottom: 24 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 16px", borderRadius: 12,
                    background: C.greenL, border: `1px solid ${C.greenM}`,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, letterSpacing: "0.12em", color: C.green,
                  }}>
                    <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                    ACCOUNT CREATED · REDIRECTING TO LOGIN...
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
                  Work Email
                </p>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{
                    position: "absolute", left: 15, top: "50%",
                    transform: "translateY(-50%)",
                    color: C.mist, pointerEvents: "none",
                  }} />
                  <input
                    type="email"
                    placeholder="factory@domain.com"
                    className={`auth-input${error ? " error" : ""}`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && register()}
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
                  Choose Password
                </p>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{
                    position: "absolute", left: 15, top: "50%",
                    transform: "translateY(-50%)",
                    color: C.mist, pointerEvents: "none",
                  }} />
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    className={`auth-input${error ? " error" : ""}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && register()}
                  />
                </div>
                <PasswordStrength password={password} />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={register}
              disabled={loading || isSuccess}
              className="register-btn"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div style={{ margin: "32px 0 24px", height: 1, background: C.silk }} />

            {/* Login link */}
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 13, color: C.stone,
              textAlign: "center",
            }}>
              Already registered?{" "}
              <Link to="/login" style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, letterSpacing: "0.1em",
                color: C.navy, fontWeight: 500,
                textDecoration: "none",
                borderBottom: `1px solid ${C.navy}`,
                paddingBottom: 1,
              }}>
                SIGN IN
              </Link>
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL (brand) ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          style={{
            width: "42%",
            background: C.navy,
            display: "flex", flexDirection: "column",
            justifyContent: "center",
            padding: "52px 52px",
            position: "relative", overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* BG decorations */}
          <div style={{
            position: "absolute", top: -100, left: -100,
            width: 380, height: 380, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: -60, left: -60,
            width: 220, height: 220, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0,
            width: 3,
            background: `linear-gradient(180deg, transparent, ${C.teal}40, transparent)`,
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10, letterSpacing: "0.28em",
              color: C.teal, textTransform: "uppercase", marginBottom: 20,
            }}>
              Why MarketCore?
            </p>

            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(22px, 2.5vw, 32px)",
              fontWeight: 700, letterSpacing: "-0.03em",
              color: "#FFFFFF", marginBottom: 12, lineHeight: 1.2,
            }}>
              Built for commodity{" "}
              <span style={{ fontStyle: "italic", color: C.tealM }}>professionals.</span>
            </h3>

            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 13.5, color: "rgba(255,255,255,0.4)",
              lineHeight: 1.7, marginBottom: 44,
            }}>
              Everything you need to manage procurement, track prices, and connect with buyers — in a single platform.
            </p>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <FeatureItem
                icon={<Leaf size={17} color={C.tealM} />}
                title="Live Price Directory"
                desc="Real-time commodity pricing across all registered factory units."
              />
              <FeatureItem
                icon={<ShieldCheck size={17} color={C.tealM} />}
                title="Verified Profiles"
                desc="Trusted, verified factory profiles with contact and logistics data."
              />
              <FeatureItem
                icon={<Globe size={17} color={C.tealM} />}
                title="Regional Coverage"
                desc="Connect with buyers and sellers across India's major tea and coffee belts."
              />
            </div>

            {/* Bottom bar */}
            <div style={{
              marginTop: 52,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <ShieldCheck size={13} color={C.tealM} />
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10, color: "rgba(255,255,255,0.28)",
                letterSpacing: "0.14em",
              }}>
                ENTERPRISE ENCRYPTION · NO ADS · DATA PRIVATE
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}