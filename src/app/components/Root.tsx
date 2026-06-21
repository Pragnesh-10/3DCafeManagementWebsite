import React from "react";
import { Outlet, useLocation, Link } from "react-router";
import { Dock } from "./Dock";
import { motion } from "motion/react";
import { Bell, Search } from "lucide-react";

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <span className="w-9 h-9 rounded-full bg-espresso text-cream flex items-center justify-center shrink-0 shadow-[0_2px_6px_-2px_rgba(44,33,24,0.5)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <ellipse cx="12" cy="12" rx="7.5" ry="10" transform="rotate(35 12 12)" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 5C12 9 12 15 16 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <div className="leading-none hidden sm:block">
        <span className="block text-[1.2rem] font-display font-semibold text-espresso tracking-tight">
          Cardamom
        </span>
        <span className="block text-[0.58rem] uppercase tracking-[0.22em] text-bark-soft mt-0.5">
          Coffee Roasters
        </span>
      </div>
    </Link>
  );
}

export function Root() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-cream text-espresso overflow-hidden font-sans selection:bg-clay/20">
      {/* Topbar */}
      <header className="h-[4.5rem] border-b border-line bg-cream/85 backdrop-blur-sm px-4 md:px-8 flex items-center gap-4 z-10 shrink-0">
        <Wordmark />

        <div className="flex-1 max-w-md hidden md:flex relative group ml-4">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-soft group-focus-within:text-clay transition-colors"
            size={17}
          />
          <input
            type="text"
            placeholder="Search orders, customers, menu…"
            className="w-full bg-paper border border-line rounded-full py-2.5 pl-10 pr-4 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            aria-label="Notifications"
            className="p-2.5 rounded-full hover:bg-sand transition-colors relative text-bark"
          >
            <Bell size={19} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-clay rounded-full" />
          </button>
          <div className="h-7 w-px bg-line mx-1.5" />
          <button className="flex items-center gap-3 cursor-pointer pl-1.5 pr-3 py-1.5 rounded-full hover:bg-sand transition-colors">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&auto=format"
              alt="Priya Nair, café manager"
              className="w-8 h-8 rounded-full object-cover bg-sand"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm leading-tight text-espresso">Priya Nair</p>
              <p className="text-bark-soft text-xs leading-tight">Store Manager</p>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 pt-6 pb-28 md:px-8 md:pt-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="h-full max-w-[1400px] mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Floating dock navigation */}
      <Dock />
    </div>
  );
}
