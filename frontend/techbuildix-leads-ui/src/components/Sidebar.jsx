import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Settings, LogOut, ChevronRight, Crown, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { subscriptionApi } from "../services/api";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/leads", icon: Users, label: "Leads" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [plan, setPlan] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    subscriptionApi.getLimits().then((d) => setPlan(d.plan_id)).catch(() => {});
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out");
      navigate("/login");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-lg text-slate-400 hover:text-white"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">TechBuildix</h1>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Lead Automation</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-violet-400" />}
              </Link>
            );
          })}
        </nav>

        {plan && (
          <div className="px-4 py-2">
            <Link
              to="/settings?tab=plans"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                plan === "free"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              {plan === "free" ? "Free Trial — Upgrade" : plan.charAt(0).toUpperCase() + plan.slice(1)}
              <ChevronRight className="w-3 h-3 ml-auto" />
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.user_metadata?.full_name || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
