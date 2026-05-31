import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Send, Clock, Target, Sparkles, ArrowRight, Loader2, Search, Mail, X, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import LogsPanel from "../components/LogsPanel";
import { leadsApi, scrapeApi, emailApi, subscriptionApi } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, sent: 0, pending: 0 });
  const [scrapeRunning, setScrapeRunning] = useState(false);
  const [emailRunning, setEmailRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrapeMsg, setScrapeMsg] = useState("Idle");
  const [emailMsg, setEmailMsg] = useState("Idle");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [limits, setLimits] = useState(null);
  const [limitsLoaded, setLimitsLoaded] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await leadsApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    subscriptionApi.getLimits().then((d) => { setLimits(d); setLimitsLoaded(true); }).catch(() => setLimitsLoaded(true));
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const pollStatus = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([scrapeApi.status(), emailApi.status()]);
      setScrapeRunning(s.running);
      setScrapeMsg(s.message);
      setEmailRunning(e.running);
      setEmailMsg(e.message);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [pollStatus]);

  const handleScrape = async () => {
    const term = searchTerm.trim() || "digital marketing agencies london";
    try {
      await scrapeApi.start(term);
      toast.success(`Scraping started for: ${term}`);
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSendEmails = async () => {
    try {
      await emailApi.start();
      toast.success("Email sending started");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const conversion = stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(0) : "0";
  const isFree = limits && limits.plan_id === "free";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Overview of your lead automation</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {limitsLoaded && limits && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/settings?tab=plans")}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 shadow-lg whitespace-nowrap ${
                isFree
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-500/20"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20"
              }`}
            >
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {isFree ? "Upgrade" : limits.plan}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { fetchStats(); toast.success("Stats refreshed"); }}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/20 flex items-center gap-1.5 sm:gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
        </div>
      </div>

      {limitsLoaded && isFree && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl border border-amber-500/20">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="hidden sm:block p-2 rounded-lg bg-amber-500/20">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">Free Trial</h3>
                <button
                  onClick={() => navigate("/settings?tab=plans")}
                  className="sm:hidden px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-medium rounded-lg flex items-center gap-1"
                >
                  Upgrade <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mb-3">
                {limits.leads.used}/{limits.leads.limit} leads &middot; {limits.emails.used}/{limits.emails.limit} emails
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Leads</span>
                    <span>{Math.round((limits.leads.used / Math.max(limits.leads.limit, 1)) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${Math.min((limits.leads.used / Math.max(limits.leads.limit, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Emails</span>
                    <span>{Math.round((limits.emails.used / Math.max(limits.emails.limit, 1)) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${Math.min((limits.emails.used / Math.max(limits.emails.limit, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/settings?tab=plans")}
              className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-amber-500/20 items-center gap-2 shrink-0"
            >
              Upgrade <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="Total Leads" value={loading ? "..." : stats.total} icon={Users} color="violet" />
        <StatCard title="Pending" value={loading ? "..." : stats.pending} icon={Clock} color="amber" />
        <StatCard title="Sent" value={loading ? "..." : stats.sent} icon={Send} color="emerald" />
        <StatCard title="Conversion" value={loading ? "..." : `${conversion}%`} icon={Target} color="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Job Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Search className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${scrapeRunning ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">Scraping</p>
                    <p className="text-xs text-slate-500 truncate">{scrapeMsg}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${scrapeRunning ? "bg-amber-500/10 text-amber-400" : "bg-slate-700/50 text-slate-400"}`}>
                  {scrapeRunning ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Mail className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${emailRunning ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">Email Sending</p>
                    <p className="text-xs text-slate-500 truncate">{emailMsg}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${emailRunning ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700/50 text-slate-400"}`}>
                  {emailRunning ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
            </div>
          </div>
          <LogsPanel jobType="scrape" />
          <LogsPanel jobType="email" />
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              disabled={scrapeRunning}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-lg text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-violet-400 transition-colors flex items-center gap-2">
                  {scrapeRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                  Scrape Leads
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">Extract leads from Apify</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors shrink-0" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendEmails}
              disabled={emailRunning}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-lg text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  {emailRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                  Send Emails
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">Send email campaigns</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl mx-4"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">Scrape Leads</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Enter a search term to find businesses</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Search Term</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. digital marketing agencies london"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2">This will search Google Places via Apify and extract up to 20 businesses.</p>
              </div>
              <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-800">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all">
                  Cancel
                </button>
                <button onClick={handleScrape} className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Start Scraping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
