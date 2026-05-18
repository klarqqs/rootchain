import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { tokens } from "@/lib/tokens";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: tokens.bg }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(132,204,22,0.12), transparent 60%)",
        }}
      />
      <div className="relative text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-20 h-20 mx-auto mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-2xl border-2 border-lime-400/20 border-t-lime-400"
          />
          <div
            className="absolute inset-2 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #84CC16, #166534)",
              boxShadow: "0 0 40px rgba(132,204,22,0.5)",
            }}
          >
            <Sprout className="w-7 h-7 text-black" strokeWidth={3} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-black text-2xl tracking-tight text-white"
        >
          ROOTCHAIN
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[10px] font-bold tracking-[0.4em] uppercase text-lime-400/80 mt-1"
        >
          Syncing the harvest…
        </motion.div>
      </div>
    </motion.div>
  );
}
