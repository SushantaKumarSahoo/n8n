import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Key, Save, Eye, EyeOff, AlertCircle, Trash2, Loader2, ArrowRight, CheckCircle,
  Settings as SettingsIcon, Mail, User, Server, Shield, Crown, CreditCard, Check,
  Zap, BarChart3, Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { settingsApi, subscriptionApi } from "../services/api";

const fieldGroups = [
  {
    label: "Apify",
    icon: Server,
    fields: [
      { key: "apify_token", service: "apify", label: "Apify API Token", placeholder: "apify_api_...", type: "password", doc: "Get it from apify.com/console" },
    ],
  },
  {
    label: "Gemini",
    icon: Shield,
    fields: [
      { key: "gemini_api_key", service: "gemini", label: "Gemini API Key", placeholder: "AIzaSy...", type: "password", doc: "Get it from aistudio.google.com" },
    ],
  },
  {
    label: "Brevo (SMTP)",
    icon: Mail,
    fields: [
      { key: "brevo_api_key", service: "brevo", label: "Brevo API Key", placeholder: "xkeysib-...", type: "password", doc: "Get it from app.brevo.com/settings/api" },
      { key: "brevo_smtp_server", service: "brevo_smtp_server", label: "SMTP Server", placeholder: "smtp-relay.brevo.com", type: "text", doc: "smtp-relay.brevo.com" },
      { key: "brevo_smtp_port", service: "brevo_smtp_port", label: "SMTP Port", placeholder: "587", type: "text", doc: "Usually 587" },
      { key: "brevo_smtp_user", service: "brevo_smtp_user", label: "SMTP Username", placeholder: "user@company.com", type: "text", doc: "Your SMTP login email" },
      { key: "brevo_smtp_password", service: "brevo_smtp_password", label: "SMTP Password", placeholder: "xsmtpsib-...", type: "password", doc: "Your SMTP password" },
    ],
  },
  {
    label: "Sender",
    icon: User,
    fields: [
      { key: "sender_name", service: "sender_name", label: "Sender Name", placeholder: "TechBuildix", type: "text", doc: "Name recipients will see" },
      { key: "sender_email", service: "sender_email", label: "Sender Email", placeholder: "hello@techbuildix.com", type: "text", doc: "Verified sender in Brevo" },
    ],
  },
];

const REQUIRED_SERVICES = ["apify", "gemini", "brevo", "sender_email"];

const ALL_PLANS = [
  {
    id: "free", name: "Free Trial", price: "$0", period: "forever",
    popular: false,
    features: ["20 leads/month", "10 emails/month", "Basic scraping", "Community support"],
    locked: ["AI Personalization", "Priority Support", "Custom Branding", "Advanced Filters"],
  },
  {
    id: "pro", name: "Pro", price: "$29", period: "/month",
    popular: true,
    features: ["500 leads/month", "300 emails/month", "AI Personalization", "Priority Support", "Advanced Filters", "Email Analytics"],
    locked: [],
  },
  {
    id: "enterprise", name: "Enterprise", price: "$99", period: "/month",
    popular: false,
    features: ["Unlimited leads", "Unlimited emails", "Everything in Pro", "Custom Branding", "Dedicated Manager", "SLA Guarantee"],
    locked: [],
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "keys";

  const [keys, setKeys] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [saving, setSaving] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [limits, setLimits] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, st] = await Promise.all([
          settingsApi.get(),
          settingsApi.status(),
        ]);
        setKeys(data);
        setStatus(st);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    subscriptionApi.getLimits().then(setLimits).catch(() => {});
    subscriptionApi.getMySubscription().then(setSubscription).catch(() => {});
  }, []);

  const handleSave = async (service, apiField) => {
    const val = keys[apiField];
    if (!val) {
      toast.error("Please fill in the field");
      return;
    }
    setSaving((prev) => ({ ...prev, [apiField]: true }));
    try {
      await settingsApi.save({ [apiField]: val });
      toast.success("Saved");
      const st = await settingsApi.status();
      setStatus(st);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [apiField]: false }));
    }
  };

  const handleClear = (apiField) => {
    setKeys((prev) => ({ ...prev, [apiField]: "" }));
  };

  const handleCheckout = async (planId) => {
    if (planId === "free") {
      toast("You're already on the Free plan");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { url } = await subscriptionApi.createCheckout(planId, "monthly");
      window.location.href = url;
    } catch (err) {
      toast.error(err.message || "Checkout unavailable. Set up Stripe keys in .env");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      const { url } = await subscriptionApi.portal();
      window.location.href = url;
    } catch (err) {
      toast.error(err.message);
    }
  };

  const configured = status?.configured;

  const Tabs = () => (
    <div className="flex gap-1 mb-8 p-1 bg-slate-900/50 rounded-xl border border-slate-800/50 w-fit">
      <button
        onClick={() => setSearchParams({ tab: "keys" })}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${tab === "keys" ? "bg-violet-500/20 text-violet-400 border border-violet-500/20" : "text-slate-400 hover:text-slate-200"}`}
      >
        <Key className="w-4 h-4" /> API Keys
      </button>
      <button
        onClick={() => setSearchParams({ tab: "plans" })}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${tab === "plans" ? "bg-violet-500/20 text-violet-400 border border-violet-500/20" : "text-slate-400 hover:text-slate-200"}`}
      >
        <Crown className="w-4 h-4" /> Plans & Billing
      </button>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your account and integrations</p>
      </div>

      <Tabs />

      {tab === "keys" ? (
        <div className="max-w-2xl space-y-6">
          {!loading && status && !configured && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 rounded-xl border border-violet-500/20">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <SettingsIcon className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">Welcome! Set up your credentials</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    You need to configure <strong className="text-violet-300">{status.missing.length}</strong> required field{status.missing.length > 1 ? "s" : ""} before using the app:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {REQUIRED_SERVICES.map((s) => {
                      const done = !status.missing.includes(s);
                      return (
                        <div key={s} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${done ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-700/50"}`}>
                          {done ? <CheckCircle className="w-3 h-3" /> : <Loader2 className="w-3 h-3" />}
                          {s === "sender_email" ? "Sender Email" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading settings...
            </div>
          ) : (
            fieldGroups.map((group, gi) => (
              <div key={group.label} className="space-y-3">
                <div className="flex items-center gap-2">
                  <group.icon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{group.label}</h2>
                </div>
                {group.fields.map(({ key: apiField, service, label, placeholder, type, doc }) => {
                  const isRequired = REQUIRED_SERVICES.includes(service);
                  const gotKey = status && !status.missing.includes(service);
                  return (
                    <motion.div
                      key={apiField}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: gi * 0.1 }}
                      className={`bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border p-5 transition-colors ${gotKey ? "border-emerald-500/20" : "border-slate-800/50"}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-200">
                            {label}
                            {isRequired && <span className="text-xs text-violet-400 ml-1">*</span>}
                          </h3>
                          {gotKey && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKeys[apiField] ? "text" : type}
                            value={keys[apiField] || ""}
                            onChange={(e) => setKeys((prev) => ({ ...prev, [apiField]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full px-4 py-2.5 pr-10 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                          />
                          {type === "password" && (
                            <button
                              onClick={() => setShowKeys((prev) => ({ ...prev, [apiField]: !prev[apiField] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              {showKeys[apiField] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => handleClear(apiField)}
                          disabled={!keys[apiField]}
                          className="px-3 py-2.5 bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-sm rounded-lg border border-slate-700/50 hover:border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSave(service, apiField)}
                          disabled={saving[apiField]}
                          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50"
                        >
                          {saving[apiField] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5">{doc}</p>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}

          {!loading && configured && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20 p-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-400">All required keys configured</p>
                  <p className="text-xs text-slate-500 mt-0.5">You can now use the Dashboard and Leads.</p>
                </div>
                <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/0 rounded-xl border border-amber-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">Keys are stored per user in Supabase</p>
              <p className="text-xs text-slate-500 mt-1">
                Required <span className="text-violet-400">*</span> fields: Apify, Gemini, Brevo API Key, and Sender Email.
                The rest are optional (SMTP settings are stored for reference).
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl space-y-8">
          {limits && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${limits.plan_id === "free" ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
                    <Crown className={`w-5 h-5 ${limits.plan_id === "free" ? "text-amber-400" : "text-emerald-400"}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Current Plan: {limits.plan}</h3>
                    <p className="text-xs text-slate-400">
                      {limits.plan_id === "free" ? "Free Trial — upgrade to unlock more" : "Active subscription"}
                    </p>
                  </div>
                </div>
                {limits.plan_id !== "free" && (
                  <button onClick={handlePortal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700/50 transition-all">
                    Manage Billing
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Leads</span>
                    <span className="text-sm font-medium text-white">{limits.leads.used} / {limits.leads.limit === -1 ? "∞" : limits.leads.limit}</span>
                  </div>
                  {limits.leads.limit !== -1 && (
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${Math.min((limits.leads.used / limits.leads.limit) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Emails</span>
                    <span className="text-sm font-medium text-white">{limits.emails.used} / {limits.emails.limit === -1 ? "∞" : limits.emails.limit}</span>
                  </div>
                  {limits.emails.limit !== -1 && (
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{ width: `${Math.min((limits.emails.used / limits.emails.limit) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {(limits?.plan_id === "free") && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-400">Free trial limitations</p>
                  <p className="text-xs text-slate-400 mt-0.5">Some features are locked on the Free plan. Upgrade to unlock:</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["AI Personalization", "Priority Support", "Custom Branding", "Advanced Filters"].map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-slate-700/50 text-slate-500 bg-slate-800/30">
                        <Lock className="w-3 h-3" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <h3 className="text-base font-semibold text-white mb-4">Available Plans</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {ALL_PLANS.map((plan, i) => {
                const isCurrent = limits?.plan_id === plan.id;
                const isUpgrade = plan.id !== "free" && limits?.plan_id !== plan.id;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative p-5 rounded-xl border transition-all ${
                      plan.popular
                        ? "bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border-violet-500/30"
                        : "bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800/50"
                    } ${isCurrent ? "ring-2 ring-emerald-500/40" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-[10px] font-semibold text-white shadow-lg shadow-violet-500/25">
                        Most Popular
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/20">
                        Current
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-white">{plan.name}</h4>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">{plan.price}</span>
                        <span className="text-xs text-slate-400">{plan.period}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-5">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-300">{f}</span>
                        </div>
                      ))}
                      {plan.locked.map((f) => (
                        <div key={f} className="flex items-start gap-2 opacity-40">
                          <Lock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-500">{f}</span>
                        </div>
                      ))}
                    </div>

                    {isUpgrade ? (
                      <button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading}
                        className={`w-full py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          plan.popular
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
                        } disabled:opacity-50`}
                      >
                        {checkoutLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        {plan.id === "enterprise" ? "Contact Us" : "Upgrade"}
                      </button>
                    ) : isCurrent ? (
                      <div className="w-full py-2 text-xs text-center text-emerald-400 font-medium bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        Active Plan
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {limits?.plan_id !== "free" && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Subscription Details</h3>
                  {subscription?.current_period_end && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Current period ends: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button onClick={handlePortal} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700/50 transition-all">
                  Manage in Stripe
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
