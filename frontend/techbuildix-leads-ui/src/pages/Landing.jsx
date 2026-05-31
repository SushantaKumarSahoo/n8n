import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Sparkles, Search, Mail, BarChart3, Users,
  Shield, Zap, Menu, X, Star, ChevronRight, Loader2, CreditCard
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  { icon: Search, title: "AI Scraping", desc: "Find businesses from any niche using Apify-powered Google Places scraping." },
  { icon: Mail, title: "Smart Emails", desc: "Generate personalized outreach emails with Google Gemini AI." },
  { icon: BarChart3, title: "Track Everything", desc: "Monitor leads, email status, and conversion rates in real-time." },
  { icon: Users, title: "Lead Management", desc: "Organize, filter, and export your leads with a powerful dashboard." },
  { icon: Zap, title: "Auto Sending", desc: "Schedule and send email campaigns automatically with Brevo." },
  { icon: Shield, title: "Secure & Private", desc: "Your API keys are encrypted and stored per-user in Supabase." },
];

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "forever",
    desc: "Try before you buy",
    color: "slate",
    popular: false,
    features: [
      "20 leads per month",
      "10 emails per month",
      "Basic scraping",
      "Email templates",
      "Community support",
    ],
    locked: ["AI personalization", "Priority support", "Custom branding"],
    cta: "Get Started",
    href: "/register",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "Best for growing agencies",
    color: "violet",
    popular: true,
    features: [
      "500 leads per month",
      "300 emails per month",
      "Advanced scraping filters",
      "AI email personalization",
      "Priority support",
      "Email analytics",
    ],
    locked: [],
    cta: "Subscribe",
    href: "#pricing",
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    desc: "For high-volume teams",
    color: "emerald",
    popular: false,
    features: [
      "Unlimited leads",
      "Unlimited emails",
      "Custom integrations",
      "Dedicated account manager",
      "Custom branding",
      "SLA guarantee",
      "Early access to features",
    ],
    locked: [],
    cta: "Contact Us",
    href: "#contact",
  },
];

const testimonials = [
  { name: "Alex Rivera", role: "CEO, GrowthMetrics", avatar: "AR", text: "We doubled our outreach with half the effort. TechBuildix is a game-changer." },
  { name: "Sarah Chen", role: "Founder, LeadGenPro", avatar: "SC", text: "The AI email generation is uncanny. Our reply rates went up 3x." },
  { name: "James Okonkwo", role: "Marketing Director, ScaleUp", avatar: "JO", text: "From setup to first campaign in 10 minutes. Incredible product." },
];

const faqs = [
  { q: "How does the free trial work?", a: "You get 20 leads and 10 emails free, no credit card required. Upgrade anytime to unlock more." },
  { q: "Can I use my own API keys?", a: "Yes! Bring your own Apify, Gemini, and Brevo keys. Your data stays yours." },
  { q: "What if I hit my plan limit?", a: "You'll get notified. Upgrade to Pro or Enterprise for higher limits." },
  { q: "Is my data secure?", a: "All API keys are encrypted and stored per-user in Supabase. We never share your data." },
];

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id) => {
    setMobileMenu(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#06080f] text-white overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06080f]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="text-lg font-bold">TechBuildix</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo("features")} className="text-sm text-slate-400 hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollTo("pricing")} className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</button>
              <button onClick={() => scrollTo("faq")} className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</button>
              {user ? (
                <Link to="/dashboard" className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link>
                  <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-violet-500/20">
                    Get Started <span className="ml-1">→</span>
                  </Link>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-slate-400 hover:text-white">
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-slate-800/50">
              <div className="px-4 py-4 space-y-3">
                <button onClick={() => scrollTo("features")} className="block w-full text-left text-sm text-slate-400 hover:text-white py-2">Features</button>
                <button onClick={() => scrollTo("pricing")} className="block w-full text-left text-sm text-slate-400 hover:text-white py-2">Pricing</button>
                <button onClick={() => scrollTo("faq")} className="block w-full text-left text-sm text-slate-400 hover:text-white py-2">FAQ</button>
                {user ? (
                  <Link to="/dashboard" className="block w-full text-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-lg">Dashboard</Link>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Link to="/login" className="block w-full text-center px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg">Sign In</Link>
                    <Link to="/register" className="block w-full text-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-lg">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/15 via-indigo-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm text-violet-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Lead Automation
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Generate Leads & Send
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered Emails
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Scrape thousands of businesses, generate personalized outreach with Gemini AI,
              and send email campaigns — all from one dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              {user ? (
                <Link to="/dashboard" className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 text-base">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 text-base">
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="px-8 py-3.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium rounded-xl border border-slate-700/50 transition-all text-base">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> 20 free leads</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> 10 free emails</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need</h2>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">From scraping to sending, manage your entire outreach pipeline in one place.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 hover:border-slate-700/50 transition-all group"
              >
                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">Start free, upgrade when you grow.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-xl border transition-all ${
                  plan.popular
                    ? "bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border-violet-500/30"
                    : "bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800/50 hover:border-slate-700/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-xs font-semibold text-white shadow-lg shadow-violet-500/25">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded border border-slate-500" />
                      </div>
                      <span className="text-sm text-slate-500">{f}</span>
                    </div>
                  ))}
                </div>

                {plan.name === "Free Trial" ? (
                  <Link
                    to={plan.href}
                    className="block w-full text-center py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all border border-slate-700/50"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (user) {
                        navigate("/settings?tab=plans");
                      } else {
                        navigate("/register");
                      }
                    }}
                    className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20"
                        : "bg-slate-800 hover:bg-slate-700 border border-slate-700/50"
                    }`}
                  >
                    {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Loved by founders</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Frequently asked</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
                      <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-10 sm:p-14 rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-slate-900 border border-violet-500/20 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to scale your outreach?</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Join thousands of businesses automating their lead generation with AI.</p>
              {user ? (
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-indigo-600 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-white">T</span>
            </div>
            <span className="text-sm font-medium text-slate-400">TechBuildix</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 TechBuildix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
