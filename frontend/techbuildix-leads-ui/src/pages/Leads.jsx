import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, Users, MoreHorizontal, ChevronDown, RefreshCw, Loader2 } from "lucide-react";
import { leadsApi } from "../services/api";
import toast from "react-hot-toast";

const statusStyles = {
  SENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await leadsApi.getAll();
      setLeads(data.leads || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filtered = leads.filter((l) =>
    (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">Manage and track your leads</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg border border-slate-700/50 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search leads by company or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
            />
          </div>
          <button className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 text-sm rounded-lg border border-slate-700/50 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Website</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sent Date</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading leads...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                    {search ? "No leads match your search" : "No leads yet. Start scraping!"}
                  </td>
                </tr>
              ) : (
                filtered.map((lead, i) => {
                  const status = (lead.status || "PENDING").toUpperCase();
                  return (
                    <motion.tr
                      key={lead.row || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {(lead.company || "U").charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-200">{lead.company || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                            {new URL(lead.website).hostname}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{lead.email || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.PENDING}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{lead.sent_date || "—"}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-slate-700/50 rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-slate-500" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {loading ? "Loading..." : `Showing ${filtered.length} of ${leads.length} leads`}
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 text-xs rounded-lg border border-slate-700/50 transition-all disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-xs rounded-lg border border-violet-500/20 transition-all">
              1
            </button>
            <button className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 text-xs rounded-lg border border-slate-700/50 transition-all disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
