import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { QRPattern } from "@/components/produce/qr-pattern";
import type { ProduceItem } from "@/data/produce";

interface QRVerifyModalProps {
  open: boolean;
  onClose: () => void;
  item: ProduceItem | null;
}

export function QRVerifyModal({ open, onClose, item }: QRVerifyModalProps) {
  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Glass className="p-6 text-center" glow elevated>
              <div className="flex items-center justify-between mb-4">
                <Pill color="lime" icon={ShieldCheck}>
                  Verified On-chain
                </Pill>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <h3 className="font-black text-xl text-white">{item.id}</h3>
              <p className="text-xs text-slate-500 mb-4">{item.name}</p>
              <div
                className="p-4 bg-black/40 rounded-2xl border border-line-strong inline-block"
              >
                <div className="w-52 h-52">
                  <QRPattern seed={item.id} size={208} />
                </div>
              </div>
              <div className="mt-4 font-mono text-xs text-lime-400">
                {item.hash.slice(0, 10)}…{item.hash.slice(-6)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Scan to verify ownership &amp; milestones
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
