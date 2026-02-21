import { motion } from "framer-motion";

/* ─── DESIGN TOKENS ─────────────────────────────────────── */
const C = {
  paper:  "#FAFAF8",
  pearl:  "#F4F3EF",
  silk:   "#EAE9E4",
  mist:   "#D4D3CC",
  stone:  "#9B9A94",
  slate:  "#6B6A64",
  ink:    "#2C2B27",
  navy:   "#1B2A4A",
  teal:   "#0D7A6B",
};

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
  `}</style>
);

export default function PageWrapper({ title, subtitle, eyebrow, children, noPad = false }) {
  return (
    <>
      <FontStyle />
      <div style={{
        minHeight: "100vh",
        background: C.paper,
        color: C.ink,
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: noPad ? 0 : "0 40px 80px",
          }}
        >
          {/* ── PAGE HEADER ────────────────────────────── */}
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
              style={{ padding: "56px 0 40px" }}
            >
              {/* Eyebrow row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 28, height: 2,
                  background: C.navy, borderRadius: 1,
                }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10, letterSpacing: "0.28em",
                  color: C.navy, textTransform: "uppercase",
                }}>
                  {eyebrow || "MarketCore"}
                </span>
              </div>

              {/* Title */}
              {title && (
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(30px, 4vw, 52px)",
                  fontWeight: 700, letterSpacing: "-0.03em",
                  lineHeight: 1.1, color: C.ink,
                  marginBottom: subtitle ? 14 : 0,
                }}>
                  {/* Split last word to italicize it in navy */}
                  {(() => {
                    const words = title.split(" ");
                    if (words.length === 1) return <span style={{ color: C.ink }}>{title}</span>;
                    const last = words.pop();
                    return (
                      <>
                        {words.join(" ")}{" "}
                        <span style={{ fontStyle: "italic", color: C.navy }}>{last}</span>
                      </>
                    );
                  })()}
                </h1>
              )}

              {/* Subtitle */}
              {subtitle && (
                <p style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 14, color: C.stone,
                  lineHeight: 1.7, maxWidth: 560,
                }}>
                  {subtitle}
                </p>
              )}

              {/* Divider */}
              <div style={{
                marginTop: 36,
                height: 1,
                background: C.silk,
              }} />
            </motion.div>
          )}

          {/* ── PAGE CONTENT ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>

        {/* ── FOOTER ─────────────────────────────────── */}
        <footer style={{
          background: C.navy,
          padding: "24px 40px",
          display: "flex", justifyContent: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.3)",
        }}>
          MARKETCORE · COMMODITY INTELLIGENCE PLATFORM · {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}