import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const linkStyle = (path) =>
    `transition font-medium ${
      location.pathname === path
        ? "text-mustard"
        : "text-white/90 hover:text-mustard"
    }`;

  return (
    <motion.nav
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="
        w-full
        bg-gradient-to-r from-[#3E2723] via-[#4E342E] to-[#5D4037]
        shadow-lg
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* BRAND */}
        <h1 className="text-2xl font-bold tracking-wide text-cream">
          t_tracker
        </h1>

        {/* NAV LINKS */}
        <div className="flex items-center space-x-6 text-sm">
          <Link to="/" className={linkStyle("/")}>
            Factories
          </Link>

          {token ? (
            <>
              <Link to="/profile" className={linkStyle("/profile")}>
                My Profile
              </Link>

              <button
                onClick={logout}
                className="
                  ml-2 px-4 py-1.5 rounded-full
                  bg-mustard text-coffee font-semibold
                  hover:bg-yellow-400 transition
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkStyle("/login")}>
                Login
              </Link>

              <Link
                to="/register"
                className="
                  px-4 py-1.5 rounded-full
                  bg-mustard text-coffee font-semibold
                  hover:bg-yellow-400 transition
                "
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
