import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sprout, Wallet } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Pill } from "@/components/ui/pill";
import { useOnboardingStore } from "@/store/onboarding.store";

const STEPS = [
  {
    title: "Welcome to ROOTCHAIN",
    body: "You are entering a testnet-grade AgriFi workspace. Connect Freighter to sync real balances, or explore with simulated flows.",
    icon: Sprout,
  },
  {
    title: "Wallet safety",
    body: "Never share your seed phrase. ROOTCHAIN only requests public keys for read access and signed transactions you explicitly approve.",
    icon: Wallet,
  },
  {
    title: "Escrow clarity",
    body: "Investments route through milestone-gated rails. Funds release as farmers verify agronomic checkpoints — full transparency in your dashboard.",
    icon: ShieldCheck,
  },
];

export function OnboardingFlow() {
  const { completed, step, markStep, complete } = useOnboardingStore();
  if (completed) return null;

  const current = STEPS[Math.min(step, STEPS.length - 1)];
  const Icon = current.icon;
  const isLast = step >= STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Glass className="p-6 elevated" glow>
            <Pill color="lime" icon={Icon}>
              Guided setup · step {step + 1}/{STEPS.length}
            </Pill>
            <h2 className="font-black text-2xl text-white mt-4 mb-2">{current.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">{current.body}</p>
            <div className="flex gap-2">
              <Btn
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  complete();
                }}
              >
                Skip
              </Btn>
              <Btn
                variant="primary"
                icon={ArrowRight}
                className="flex-1"
                onClick={() => {
                  if (isLast) complete();
                  else markStep(step + 1);
                }}
              >
                {isLast ? "Enter platform" : "Next"}
              </Btn>
            </div>
          </Glass>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
