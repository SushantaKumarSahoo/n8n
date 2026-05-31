import { motion } from "framer-motion";

const variants = {
  SENT: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  PENDING: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
  },
  FAILED: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    dot: "bg-red-400",
    glow: "shadow-red-500/20",
  },
};

export default function StatusBadge({ status = "PENDING" }) {
  const key = status.toUpperCase();
  const style = variants[key] || variants.PENDING;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${style.bg} ${style.text} ${style.glow} shadow-sm
      `}
    >
      <motion.span
        className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
        animate={{
          scale: key === "PENDING" ? [1, 1.4, 1] : 1,
          opacity: key === "PENDING" ? [1, 0.5, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: key === "PENDING" ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      {status}
    </motion.span>
  );
}
