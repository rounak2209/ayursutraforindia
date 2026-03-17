import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const therapies = [
  "Vamana",
  "Virechana",
  "Basti",
  "Nasya",
  "Raktamokshana"
];

const PanchakarmaTherapies = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % therapies.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center py-10 relative w-full">
      <motion.div
        className="absolute w-48 h-48 bg-emerald-600/20 rounded-full blur-[60px] pointer-events-none"
        animate={{ x: [0, 20, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-amber-500/20 rounded-full blur-[60px] pointer-events-none"
        animate={{ x: [0, -20, 20, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative group cursor-pointer z-10 scale-90 md:scale-100"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-500 rounded-full blur-lg opacity-30 group-hover:opacity-70 transition-opacity duration-300"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />

        <div className="relative flex items-center bg-white/70 backdrop-blur-2xl border-[1.5px] border-emerald-100/80 px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.15),inset_0_2px_10px_rgba(255,255,255,0.9)] overflow-hidden" style={{ perspective: "800px" }}>
          
          <motion.div
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/90 to-transparent skew-x-12 z-20 pointer-events-none"
            initial={{ left: "-100%" }}
            whileHover={{ left: "200%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          <div className="relative flex items-center justify-center bg-gradient-to-br from-emerald-600 to-amber-500 p-2.5 rounded-full mr-4 shadow-[0_5px_15px_rgba(16,185,129,0.4)] overflow-hidden shrink-0">
            <Sparkles className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
            <motion.div
              className="absolute w-[200%] h-[20%] bg-white/30 rotate-45"
              animate={{ y: ["-300%", "300%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <span className="mr-3 text-base md:text-lg font-extrabold text-emerald-950/70 tracking-wide shrink-0">
            Relief through
          </span>

          <div className="relative w-36 md:w-48 h-8 flex items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={index}
                className="absolute left-0 text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-700 to-amber-600 bg-clip-text text-transparent drop-shadow-sm"
                initial={{ opacity: 0, y: 40, scale: 0.6, rotateX: -60 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -40, scale: 0.6, rotateX: 60 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                  mass: 0.8,
                }}
              >
                {therapies[index]}
              </motion.span>
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default PanchakarmaTherapies;