import { motion } from "framer-motion";

export default function PageWrapper({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-cream text-coffee px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        {/* PAGE HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-coffee/70 max-w-2xl">
              {subtitle}
            </p>
          )}
          {/* Accent underline */}
          <div className="mt-4 w-20 h-1 bg-mustard rounded-full"></div>
        </div>

        {/* PAGE CONTENT */}
        <div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
