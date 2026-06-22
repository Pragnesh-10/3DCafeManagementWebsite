import React, { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Users, IndianRupee, Coffee, ArrowUpRight } from "lucide-react";
import { useCafeStore } from "../utils/store";

const salesDataForecast = [
  { time: "8a", forecast: 1300 },
  { time: "10a", forecast: 2600 },
  { time: "12p", forecast: 4500 },
  { time: "2p", forecast: 3800 },
  { time: "4p", forecast: 5000 },
  { time: "6p", forecast: 7200 },
  { time: "8p", forecast: 4300 },
];

const demandDataBaseline = [
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
  borderRadius: "12px",
  color: "#2c2118",
  fontSize: "12px",
  boxShadow: "0 10px 30px -16px rgba(44,33,24,0.3)",
} as const;

export function Dashboard() {
  const { orders, transactions } = useCafeStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Calculate dynamic revenue
  // We have base revenue of ₹38,400 + any transactions made in the current session
  const newTransactionsTotal = transactions
    .filter(tx => tx.time === "Just now" || tx.timestamp > Date.now() - 300000)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const revenueToday = 38400 + newTransactionsTotal;

  // 2. Count cups poured
  // Base cups = 286 + quantities of drinks in orders
  const newDrinksPoured = orders
    .filter(o => o.status === "Served" || o.status === "Ready")
    .flatMap(o => o.items)
    .filter(item => !item.name.includes("Croissant") && !item.name.includes("Muffin") && !item.name.includes("Roll"))
    .reduce((sum, item) => sum + item.qty, 0);
  const cupsPoured = 286 + newDrinksPoured;
  const openTickets = orders.filter(o => o.status !== "Served").length;

  // 3. Guests served
  // Base guests = 128 + served orders in session
  const newGuestsServed = orders.filter(o => o.status === "Served").length;
  const guestsServed = 128 + newGuestsServed;

  // 4. Avg. Ticket price
  const avgTicket = Math.round(revenueToday / guestsServed);

  // Dynamic KPIS structure
  const dynamicKPIS = [
    { label: "Revenue today", value: `₹${revenueToday.toLocaleString("en-IN")}`, trend: "+14.2%", icon: IndianRupee, note: "vs. ₹38,120 yesterday" },
    { label: "Cups poured", value: cupsPoured.toString(), trend: "+6.5%", icon: Coffee, note: `${openTickets} open tickets in rail` },
    { label: "Guests served", value: guestsServed.toString(), trend: "+19.0%", icon: Users, note: `${orders.length} orders total` },
    { label: "Avg. ticket", value: `₹${avgTicket}`, trend: "+4.8%", icon: TrendingUp, note: "calculated today" },
  ];

  // Dynamic Sales chart actual values (spread the new revenue on the latest hour)
  // Let's add the session transactions to the 4p / 6p / 8p slots based on current time
  const currentHour = new Date().getHours();
  
  const dynamicSalesData = salesDataForecast.map((slot) => {
    let actualBase = 0;
    if (slot.time === "8a") actualBase = 1200;
    else if (slot.time === "10a") actualBase = 2400;
    else if (slot.time === "12p") actualBase = 4800;
    else if (slot.time === "2p") actualBase = 3500;
    else if (slot.time === "4p") actualBase = 5200;
    else if (slot.time === "6p") actualBase = 6800;
    else if (slot.time === "8p") actualBase = 4100;

    // Distribute new transactions
    let addedRevenue = 0;
    const isSlotCurrent = 
      (slot.time === "8a" && currentHour >= 7 && currentHour < 9) ||
      (slot.time === "10a" && currentHour >= 9 && currentHour < 11) ||
      (slot.time === "12p" && currentHour >= 11 && currentHour < 13) ||
      (slot.time === "2p" && currentHour >= 13 && currentHour < 15) ||
      (slot.time === "4p" && currentHour >= 15 && currentHour < 17) ||
      (slot.time === "6p" && currentHour >= 17 && currentHour < 19) ||
      (slot.time === "8p" && currentHour >= 19);

    if (isSlotCurrent) {
      addedRevenue = newTransactionsTotal;
    } else if (slot.time === "8p" && currentHour < 8) {
      // If it's early in the day, don't show future slot actuals to make it realistic!
      return { ...slot, actual: undefined };
    } else if (slot.time === "6p" && currentHour < 17) {
      return { ...slot, actual: undefined };
    } else if (slot.time === "4p" && currentHour < 15) {
      return { ...slot, actual: undefined };
    } else if (slot.time === "2p" && currentHour < 13) {
      return { ...slot, actual: undefined };
    } else if (slot.time === "12p" && currentHour < 11) {
      return { ...slot, actual: undefined };
    } else if (slot.time === "10a" && currentHour < 9) {
      return { ...slot, actual: undefined };
    }

    return {
      ...slot,
      actual: actualBase + addedRevenue,
    };
  });

  // Calculate dynamic weekly demand (add new order items to today's count)
  const todayDay = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayStr = daysOfWeek[todayDay];

  // Count food vs coffee items ordered in this session
  const sessionCoffeeCount = orders
    .flatMap(o => o.items)
    .filter(item => !item.name.includes("Croissant") && !item.name.includes("Muffin") && !item.name.includes("Roll"))
    .reduce((sum, i) => sum + i.qty, 0);

  const sessionFoodCount = orders
    .flatMap(o => o.items)
    .filter(item => item.name.includes("Croissant") || item.name.includes("Muffin") || item.name.includes("Roll"))
    .reduce((sum, i) => sum + i.qty, 0);

  const dynamicDemandData = demandDataBaseline.map((d) => {
    if (d.day === todayStr) {
      return {
        ...d,
        coffee: d.coffee + sessionCoffeeCount,
        food: d.food + sessionFoodCount,
      };
    }
    return d;
  });

  return (
    <div className="space-y-7 font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft font-semibold">
            {new Date().toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl mt-1 text-espresso font-display font-medium">
            Good morning, <span className="italic font-normal text-clay font-display">Priya</span>
          </h1>
          <p className="text-bark mt-1.5">Here's how Cardamom Café floor is trading today in real-time.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start md:self-auto text-sm text-bark bg-paper border border-line rounded-full px-4 py-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
          Live · connected to cash till
        </span>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dynamicKPIS.map((stat) => (
          <Card
            key={stat.label}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="cursor-pointer border-line rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-sand text-clay">
                <stat.icon size={20} />
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-mono text-sage font-bold">
                <ArrowUpRight size={13} /> {stat.trend}
              </span>
            </div>
            <p className="text-bark text-sm mt-4 font-medium">{stat.label}</p>
            <h3 className="text-[1.75rem] font-mono text-espresso mt-0.5 tracking-tight font-bold">{stat.value}</h3>
            <p className="text-bark-soft text-xs mt-1">{stat.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Forecasting */}
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col rounded-[2.2rem] border-line shadow-md bg-paper">
          <div className="p-6 border-b border-line flex items-baseline justify-between gap-4">
            <div>
              <h3 className="text-lg text-espresso font-semibold">Revenue & Forecast</h3>
              <p className="text-xs text-bark-soft mt-0.5">Actual sales registered dynamically against the day's projections</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-bark font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-clay" /> Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-bark-soft" /> Forecast</span>
            </div>
          </div>
          <div className="p-4 sm:p-6 w-full h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicSalesData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
                  <Area key="a1" type="monotone" dataKey="actual" stroke="#b85c38" strokeWidth={2.5} fill="url(#fillActual)" name="Actual" connectNulls />
                  <Area key="a2" type="monotone" dataKey="forecast" stroke="#93826e" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Forecast" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Demand + Notes */}
        <div className="space-y-5">
          <Card className="rounded-[2rem] border-line shadow-md bg-paper">
            <h3 className="text-lg text-espresso font-semibold">This Week's Demand</h3>
            <p className="text-xs text-bark-soft mt-0.5 mb-4 font-medium">Coffee cups vs. kitchen food, units sold</p>
            <div className="w-full h-[180px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicDemandData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={2}>
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

          <Card raised className="rounded-[2rem] border-line shadow-md bg-paper-raised">
            <h3 className="text-lg text-espresso mb-3 font-semibold">On the Radar</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-honey mt-2 shrink-0 animate-ping" />
                <p className="text-sm text-bark">
                  Almond milk running low — only <span className="font-semibold text-espresso">1.5 L</span> left before the weekend rush.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0" />
                <p className="text-sm text-bark">
                  Croissants pair well with house flat white today — recommend prompt by cashmere registers.
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
