import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { ProjectCreateWizard } from "@/features/farmer/project-create-wizard";
import { isApiBackendConfigured } from "@/lib/api/config";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Glass className="p-6 relative" glow elevated>
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
              {isApiBackendConfigured() ? (
                <ProjectCreateWizard onClose={onClose} />
              ) : (
                <p className="text-sm text-slate-400 pr-8">
                  Configure <code className="text-lime-300">VITE_API_URL</code> to create farm projects on the Railway backend.
                </p>
              )}
            </Glass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
