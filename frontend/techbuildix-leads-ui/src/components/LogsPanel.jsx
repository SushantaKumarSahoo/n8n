import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Loader2, ChevronDown, ChevronUp, Search, Mail, AlertCircle, Info } from "lucide-react";
import { logsApi } from "../services/api";

const levelIcons = {
  info: Info,
  error: AlertCircle,
};

const levelColors = {
  info: "text-slate-400",
  error: "text-red-400",
};

const jobIcons = {
  scrape: Search,
  email: Mail,
};

export default function LogsPanel({ jobType }) {
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await logsApi.get(jobType, 100);
        setLogs(data.logs || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [jobType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const JobIcon = jobIcons[jobType] || Terminal;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <JobIcon className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            {jobType === "scrape" ? "Scrape Logs" : "Email Logs"}
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{logs.length}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div ref={scrollRef} className="max-h-64 overflow-y-auto p-3 space-y-1 font-mono text-xs">
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500 py-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <p className="text-slate-500 py-2">No logs yet.</p>
              ) : (
                logs.map((log) => {
                  const LevelIcon = levelIcons[log.level] || Info;
                  const color = levelColors[log.level] || "text-slate-400";
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-2 ${color}`}
                    >
                      <LevelIcon className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="break-all">{log.message}</span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
