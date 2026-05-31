import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, color = "violet" }) {
  const gradientMap = {
    violet: {
      card: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400",
      icon: "from-violet-500 to-indigo-600",
      blob: "from-violet-500",
    },
    emerald: {
      card: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
      icon: "from-emerald-500 to-teal-600",
      blob: "from-emerald-500",
    },
    amber: {
      card: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400",
      icon: "from-amber-500 to-orange-600",
      blob: "from-amber-500",
    },
    blue: {
      card: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
      icon: "from-blue-500 to-cyan-600",
      blob: "from-blue-500",
    },
  };

  const g = gradientMap[color] || gradientMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden bg-gradient-to-br ${g.card} rounded-xl p-6 border`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${g.blob} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h2 className="text-3xl font-bold text-white mt-2">{value}</h2>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-gradient-to-br ${g.icon}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
