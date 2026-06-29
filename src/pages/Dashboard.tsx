import React, { useState, useEffect } from "react";
import { Card } from "../components/Card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { TrendingUp, Users, IndianRupee, Coffee, ArrowUpRight, Star, AlertTriangle, ShieldCheck, Heart, ArrowDownRight, Package } from "lucide-react";
import { useCafeStore } from "../utils/store";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/haptics";

const salesData = [
  { time: "8a", actual: 1200, forecast: 1300 },
  { time: "10a", actual: 2400, forecast: 2600 },
  { time: "12p", actual: 4800, forecast: 4500 },
  { time: "2p", actual: 3500, forecast: 3800 },
  { time: "4p", actual: 5200, forecast: 5000 },
  { time: "6p", actual: 6800, forecast: 7200 },
  { time: "8p", actual: 4100, forecast: 4300 },
];

const demandData = [
  { day: "Mon", coffee: 45, food: 30 },
  { day: "Tue", coffee: 50, food: 35 },
  { day: "Wed", coffee: 40, food: 40 },
  { day: "Thu", coffee: 60, food: 45 },
  { day: "Fri", coffee: 80, food: 60 },
  { day: "Sat", coffee: 110, food: 90 },
  { day: "Sun", coffee: 90, food: 75 },
];

const tooltipStyle = {
  backgroundColor: "#fbf6ec",
  border: "1px solid #ddcfb8",
  borderRadius: "8px",
  color: "#2c2118",
  fontSize: "12px",
  boxShadow: "0 10px 30px -16px rgba(44,33,24,0.3)",
} as const;

export function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { orders, transactions, customers, feedbacks, employees, inventory, restockInventory } = useCafeStore();

  useEffect(() => setMounted(true), []);

  // Compute stats dynamically from the shared database store
  const revenueToday = transactions
    .filter((t) => t.status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const cupsPoured = orders.reduce((sum, o) => {
    return sum + o.items.reduce((acc, curr) => acc + curr.qty, 0);
  }, 0);

  const openTickets = orders.filter((o) => o.status !== "Served").length;

  const guestsServed = customers.reduce((sum, c) => sum + c.visits, 0);

  const avgTicket = orders.length > 0
    ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length)
    : 0;

  const KPIS = [
    { label: "Revenue today", value: `₹${revenueToday.toLocaleString("en-IN")}`, trend: "+12.5%", icon: IndianRupee, note: "vs. ₹38,120 yesterday" },
    { label: "Cups poured", value: cupsPoured.toString(), trend: "+4.1%", icon: Coffee, note: `${openTickets} open tickets` },
    { label: "Guests served", value: guestsServed.toString(), trend: "+18.2%", icon: Users, note: `${customers.length} total members` },
    { label: "Avg. ticket", value: `₹${avgTicket}`, trend: "+6.0%", icon: TrendingUp, note: "rolling 7-day average" },
  ];

  const adminName = (sessionStorage.getItem("user_name") || "Priya Nair").split(" ")[0];

  return (
    <div className="space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft">Sunday · 21 June</p>
          <h1 className="text-3xl mt-1 text-espresso">
            Good morning, <span className="italic font-normal text-clay">{adminName}</span>
          </h1>
          <p className="text-bark mt-1.5">Here's how the roastery floor is trading today.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start md:self-auto text-sm text-bark bg-paper border border-line rounded-full px-3.5 py-1.5">
          <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
          Live · updated just now
        </span>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPIS.map((stat) => (
          <Card
            key={stat.label}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-sand text-clay">
                <stat.icon size={20} />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-mono text-sage">
                <ArrowUpRight size={13} /> {stat.trend}
              </span>
            </div>
            <p className="text-bark text-sm mt-4">{stat.label}</p>
            <h3 className="text-[1.75rem] font-mono text-espresso mt-0.5 tracking-tight">{stat.value}</h3>
            <p className="text-bark-soft text-xs mt-1">{stat.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Forecasting */}
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-line flex items-baseline justify-between gap-4">
            <div>
              <h3 className="text-lg text-espresso">Revenue & forecast</h3>
              <p className="text-sm text-bark mt-0.5">Actual sales against the day's projection</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-bark">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-clay" /> Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-bark-soft" /> Forecast</span>
            </div>
          </div>
          <div className="p-4 sm:p-6 w-full h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs key="defs">
                    <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b85c38" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#b85c38" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid" strokeDasharray="2 5" stroke="#ddcfb8" vertical={false} />
                  <XAxis key="x" dataKey="time" stroke="#93826e" fontSize={12} tickLine={false} axisLine={false} dy={6} />
                  <YAxis key="y" stroke="#93826e" fontSize={12} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip key="tt" contentStyle={tooltipStyle} cursor={{ stroke: "#ddcfb8" }} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Area key="a1" type="monotone" dataKey="actual" stroke="#b85c38" strokeWidth={2.5} fill="url(#fillActual)" name="Actual" />
                  <Area key="a2" type="monotone" dataKey="forecast" stroke="#93826e" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Forecast" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Demand + notes */}
        <div className="space-y-5">
          <Card>
            <h3 className="text-lg text-espresso">This week's demand</h3>
            <p className="text-sm text-bark mt-0.5 mb-4">Coffee vs. kitchen, units sold</p>
            <div className="w-full h-[180px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demandData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={2}>
                    <CartesianGrid key="grid" strokeDasharray="2 5" stroke="#ddcfb8" vertical={false} />
                    <XAxis key="x" dataKey="day" stroke="#93826e" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip key="tt" cursor={{ fill: "#e7dcc9", opacity: 0.5 }} contentStyle={tooltipStyle} />
                    <Bar key="b1" dataKey="coffee" fill="#b85c38" radius={[3, 3, 0, 0]} name="Coffee" />
                    <Bar key="b2" dataKey="food" fill="#c0892f" radius={[3, 3, 0, 0]} name="Kitchen" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card raised>
            <h3 className="text-lg text-espresso mb-3">On the radar</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-honey mt-2 shrink-0" />
                <p className="text-sm text-bark">Almond milk running low — check inventory replenish counts.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0" />
                <p className="text-sm text-bark">Croissants pair well with the house latte today — worth a counter prompt.</p>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* ── SECTION: EXECUTIVE CRM & PERFORMANCE HUB ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 pt-2">
        {/* Customer Reviews & Star Ratings */}
        <Card className="flex flex-col h-[350px]">
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <h3 className="text-lg text-espresso font-semibold">Guest Sentiment</h3>
              <p className="text-xs text-bark-soft">Live feedback from Cardamom customers</p>
            </div>
            {feedbacks && feedbacks.length > 0 && (
              <div className="flex items-center gap-1 bg-honey/10 px-2 py-1 rounded-lg text-honey font-bold text-xs">
                <Star size={13} className="fill-honey text-honey" />
                {(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)} / 5.0
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {(!feedbacks || feedbacks.length === 0) ? (
              <p className="text-xs text-bark-soft italic text-center py-16">No feedback received today.</p>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id} className="border border-line/60 rounded-xl p-3 bg-sand/10 space-y-1.5 text-xs text-bark">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-espresso">{fb.customerName}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < fb.rating ? "fill-honey text-honey" : "text-line"} />
                      ))}
                    </div>
                  </div>
                  <p className="italic text-[11px] leading-relaxed text-bark-soft">"{fb.comment}"</p>
                  <div className="flex justify-between items-center text-[9px] text-bark-soft uppercase tracking-wider font-mono">
                    <span>Order #{fb.orderId}</span>
                    <span>{new Date(fb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Employee Leaderboard */}
        <Card className="flex flex-col h-[350px]">
          <div>
            <h3 className="text-lg text-espresso font-semibold">Barista Performance</h3>
            <p className="text-xs text-bark-soft">Team scores &amp; shift stats</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1 custom-scrollbar">
            {employees.map((emp) => (
              <div key={emp.name} className="flex items-center justify-between border border-line/60 rounded-xl p-3 bg-sand/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sand/50 text-espresso font-bold flex items-center justify-center text-sm uppercase">
                    {emp.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-espresso leading-tight">{emp.name}</h4>
                    <span className="text-[10px] text-bark-soft leading-none">{emp.role} · {emp.shift}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-clay">{emp.score}</span>
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-sage">{emp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Restocking Assistant */}
        <Card className="flex flex-col h-[350px] justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg text-espresso font-semibold">Smart Stock Assistant</h3>
              <p className="text-xs text-bark-soft">Auto-calculates optimal restock buffers</p>
            </div>
            
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
              {inventory
                .filter((item) => item.status === "Critical" || item.status === "Low")
                .map((item) => {
                  const optimalBuffer = Math.ceil((item.minStock * 2) - item.stock);
                  return (
                    <div key={item.id} className="flex justify-between items-center border border-line/60 rounded-xl p-2.5 bg-cream/40 text-xs">
                      <div>
                        <span className="font-semibold text-espresso">{item.item}</span>
                        <p className="text-[10px] text-berry font-medium mt-0.5">
                          Stock: {item.stock} {item.unit} (Min: {item.minStock})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-clay">+{optimalBuffer} {item.unit}</span>
                        <span className="block text-[8px] text-bark-soft">Restock Target</span>
                      </div>
                    </div>
                  );
                })}
              {inventory.filter((item) => item.status === "Critical" || item.status === "Low").length === 0 && (
                <div className="py-12 text-center text-xs text-sage font-medium bg-sage/5 border border-sage/10 p-4 rounded-2xl">
                  ✨ Stock quantities are optimal. No restock recommended.
                </div>
              )}
            </div>
          </div>

          {inventory.filter((item) => item.status === "Critical" || item.status === "Low").length > 0 && (
            <button
              onClick={() => {
                triggerHaptic("success");
                inventory
                  .filter((item) => item.status === "Critical" || item.status === "Low")
                  .forEach((item) => {
                    const optimalBuffer = Math.ceil((item.minStock * 2) - item.stock);
                    restockInventory(item.id, optimalBuffer);
                  });
                toast.success("Successfully restocked raw material stock buffers!");
              }}
              className="w-full mt-3 py-2.5 bg-espresso text-cream hover:bg-clay text-xs font-semibold uppercase tracking-wider rounded-full cursor-pointer transition-colors"
            >
              One-Click RESTOCK ALL WARNINGS
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
