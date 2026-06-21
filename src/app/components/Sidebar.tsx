import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Utensils,
  Package,
  Receipt,
  Users,
  UserSquare,
  Menu,
  X,
} from "lucide-react";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/orders", label: "Orders", icon: Utensils },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/billing", label: "Billing", icon: Receipt },
  { path: "/employees", label: "Team", icon: Users },
  { path: "/customers", label: "Customers", icon: UserSquare },
];

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-full bg-espresso text-cream flex items-center justify-center shrink-0 shadow-[0_2px_6px_-2px_rgba(44,33,24,0.5)]">
        {/* Simple roaster mark: a coffee bean groove */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <ellipse cx="12" cy="12" rx="7.5" ry="10" transform="rotate(35 12 12)" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 5C12 9 12 15 16 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <div className="leading-none">
        <span className="block text-[1.35rem] font-display font-semibold text-espresso tracking-tight">
          Cardamom
        </span>
        <span className="block text-[0.62rem] uppercase tracking-[0.22em] text-bark-soft mt-1">
          Coffee Roasters
        </span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-paper border border-line rounded-lg text-espresso shadow-sm"
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {(isOpen || typeof window === "undefined" || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className={cn(
              "fixed md:static top-0 left-0 h-full w-64 bg-paper border-r border-line",
              "flex flex-col z-40",
              !isOpen && "hidden md:flex"
            )}
          >
            <div className="flex items-center justify-between px-6 py-6">
              <Wordmark />
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="md:hidden text-bark hover:text-espresso"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors relative",
                      isActive
                        ? "text-espresso"
                        : "text-bark hover:text-espresso hover:bg-sand/60"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-lg bg-sand"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-clay z-10" />
                    )}
                    <item.icon
                      size={19}
                      className={cn("relative z-10", isActive ? "text-clay" : "")}
                    />
                    <span className="relative z-10 text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-5 py-5 border-t border-line">
              <div className="flex items-center gap-2 text-xs text-bark-soft">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                Store open · 7:00–20:00
              </div>
              <p className="text-[0.7rem] text-bark-soft/80 mt-2 font-mono">
                Brigade Road · Bengaluru
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-espresso/40 z-30 md:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
