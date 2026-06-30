import React, { useState, useEffect } from "react";
import { useCafeStore, type Order, type OrderStatus, type MenuItem } from "../utils/store";
import { Card } from "../components/Card";
import { motion, AnimatePresence } from "motion/react";
import { ChefHat, Bell, Clock, RefreshCw, BookOpen, AlertTriangle, Check, ArrowRight, CheckCircle2, UserSquare, CupSoda, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Recipe handbook data for Chef drawer
const RECIPE_BOOK: Record<string, string[]> = {
  "Flat White": [
    "Grind 20g of House Espresso beans (INV-001) - medium-fine",
    "Extract double espresso shot (target yield: 40g, 26 seconds)",
    "Steam 200ml Whole Milk (INV-002) to 60°C (velvety microfoam, thin layer)",
    "Pour milk over espresso slowly to create a clean, glossy surface"
  ],
  "Cappuccino": [
    "Grind 20g of House Espresso beans (INV-001) - medium-fine",
    "Extract double espresso shot",
    "Steam 250ml Whole Milk (INV-002) to 62°C (stiffer foam than Flat White, 1.5cm depth)",
    "Pour milk creating a classic white dome with a dark espresso ring"
  ],
  "Pour Over": [
    "Grind 15g of Single-Origin beans (INV-001) - medium-coarse",
    "Rinse V60 paper filter with hot water",
    "Bloom coffee with 45g water (92°C) for 35 seconds",
    "Perform 3 continuous circular pours up to 225g total weight",
    "Total brew time: 2:45 to 3:00 mins"
  ],
  "Iced Latte": [
    "Grind 20g Espresso beans (INV-001) & pull double espresso shot",
    "Fill serving glass 3/4 with cold ice blocks",
    "Pour 200ml cold Whole Milk (INV-002) over the ice",
    "Gently float the double espresso shot on top for a layered aesthetic"
  ],
  "Single-Origin Espresso": [
    "Grind 15g Single-Origin beans - fine",
    "Distribute and tamp firmly (15kg pressure)",
    "Extract shot (yield: 30g, 24 seconds)",
    "Serve immediately in a pre-warmed demitasse cup with a glass of carbonated water"
  ],
  "Caramel Macchiato": [
    "Pump 2 shots of Vanilla syrup (INV-007) into bottom of mug",
    "Steam 200ml Whole Milk (INV-002) with generous froth",
    "Pour steamed milk into mug, leaving space",
    "Pull double espresso shot (INV-001) and pour directly through the milk foam center",
    "Drizzle warm caramel syrup in a cross-hatch pattern on top"
  ],
  "Dark Espresso": [
    "Grind 15g Dark Roast beans - fine",
    "Extract shot (yield: 30g, 25 seconds)",
    "Intense, bold crema - serve hot"
  ],
  "Iced Cold Brew": [
    "Measure 200ml cold brew concentrate (pre-steeped 18hrs with INV-001)",
    "Fill tall glass with fresh ice cubes",
    "Pour concentrate and top up with 50ml filtered cold water",
    "Stir gently and serve with a paper straw"
  ],
  "Butter Croissant": [
    "Place 1 pastry (INV-004) on oven tray",
    "Warm in toaster oven at 180°C for 2.5 minutes until exterior is flakey",
    "Serve warm on a ceramic plate with a paper napkin"
  ],
  "Cinnamon Roll": [
    "Place 1 roll (INV-005) in toaster oven",
    "Warm at 165°C for 3 minutes to caramelize sugar glaze",
    "Serve warm with a pastry fork"
  ],
  "Blueberry Muffin": [
    "Place 1 muffin (INV-006) in oven",
    "Warm at 160°C for 2 minutes to soften the blueberry pockets",
    "Serve warm with butter on the side"
  ]
};

export function ChefBoard() {
  const { orders, inventory, tableCalls, advanceOrderStatus, cancelOrder, resolveTableCall } = useCafeStore();
  const [activeTab, setActiveTab] = useState<"chef" | "waiter">("chef");
  const [selectedRecipe, setSelectedRecipe] = useState<{ name: string; steps: string[] } | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Tick timer for order age
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute aggregated prep list for kitchen
  const aggregatedPrep: Record<string, number> = {};
  orders
    .filter((o) => o.status === "Received" || o.status === "Preparing")
    .forEach((order) => {
      order.items.forEach((item) => {
        aggregatedPrep[item.name] = (aggregatedPrep[item.name] || 0) + item.qty;
      });
    });

  // Calculate order elapsed time
  const getOrderAge = (timestamp: number) => {
    const mins = Math.floor((currentTime - timestamp) / 60000);
    if (mins < 1) return "Just now";
    return `${mins}m ago`;
  };

  // Status transitions
  const handleAdvance = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus> = {
      "Received": "Preparing",
      "Preparing": "Ready",
      "Ready": "Served",
      "Served": "Served"
    };
    const nextStatus = nextStatusMap[currentStatus];
    advanceOrderStatus(orderId, nextStatus);
    triggerHaptic(nextStatus === "Ready" ? "success" : "medium");
    toast.success(`Order #${orderId} advanced to ${nextStatus}!`);
  };

  const handleCancel = (orderId: string) => {
    navigator.vibrate?.([60, 120, 60]);
    if (window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      cancelOrder(orderId);
      toast.error(`Order #${orderId} was cancelled.`);
    }
  };

  // Inventory Critical Alerts
  const criticalStock = inventory.filter((item) => item.status === "Critical" || item.status === "Low");

  // Floor tables setup for Waiter Table Map (10 tables)
  const tables = Array.from({ length: 9 }, (_, i) => {
    const tableNo = (i + 1).toString();
    const activeCall = tableCalls.find((c) => c.tableNo === tableNo);
    const tableOrders = orders.filter((o) => o.customerAddress === `Table ${tableNo}` && o.status !== "Served");
    
    let status: "available" | "preparing" | "ready" | "calling" = "available";
    if (activeCall) {
      status = "calling";
    } else if (tableOrders.some((o) => o.status === "Ready")) {
      status = "ready";
    } else if (tableOrders.length > 0) {
      status = "preparing";
    }

    return { tableNo, status, activeOrders: tableOrders, activeCall };
  });

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col p-4 md:p-8 space-y-6">
      {/* ── HEADER ── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-bold">Operation Hub</span>
          <h1 className="text-4xl font-display font-semibold mt-1">Kitchen &amp; Service Stations</h1>
        </div>

        {/* Tab Toggler */}
        <div className="flex bg-sand/50 border border-line rounded-full p-1.5 self-stretch sm:self-auto">
          <button
            onClick={() => { navigator.vibrate?.(12); setActiveTab("chef"); }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "chef" 
                ? "bg-espresso text-cream shadow-md" 
                : "text-bark hover:text-espresso"
            }`}
          >
            <ChefHat size={16} /> Kitchen Board (Chef KDS)
          </button>
          <button
            onClick={() => { navigator.vibrate?.(12); setActiveTab("waiter"); }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === "waiter" 
                ? "bg-espresso text-cream shadow-md" 
                : "text-bark hover:text-espresso"
            }`}
          >
            <Bell size={16} /> Service Board (Waiter KDS)
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* ── CHEF VIEW ── */}
        {activeTab === "chef" && (
          <>
            {/* Left Column: Aggregated Queue & Stock Warnings */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Aggregated Queue */}
              <Card raised className="p-5 border-clay/20 bg-paper-raised">
                <div className="flex items-center gap-2 mb-4 border-b border-line pb-3">
                  <ChefHat className="text-clay" size={20} />
                  <h3 className="font-semibold text-espresso">Aggregated Prep List</h3>
                </div>
                <div className="space-y-3">
                  {Object.keys(aggregatedPrep).length === 0 ? (
                    <p className="text-sm text-bark-soft text-center py-6 italic">No items in the prep queue.</p>
                  ) : (
                    Object.entries(aggregatedPrep).map(([name, qty]) => (
                      <div 
                        key={name} 
                        onClick={() => {
                          navigator.vibrate?.(12);
                          setSelectedRecipe({ name, steps: RECIPE_BOOK[name] || ["Recipe instructions not configured."] });
                        }}
                        className="flex justify-between items-center bg-sand/30 hover:bg-sand/60 border border-line/60 rounded-xl p-3 cursor-pointer hover:border-clay/30 transition-all group"
                      >
                        <span className="text-sm text-espresso font-semibold group-hover:text-clay transition-colors">{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-clay text-cream text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            {qty}
                          </span>
                          <BookOpen size={14} className="text-bark-soft group-hover:text-clay transition-colors" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Inventory Alert Board */}
              <Card className="p-5 border-line bg-paper">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-honey" size={18} />
                  <h3 className="text-sm font-semibold text-espresso">Critical Kitchen Stock</h3>
                </div>
                <div className="space-y-2">
                  {criticalStock.length === 0 ? (
                    <p className="text-xs text-sage font-medium bg-sage/5 border border-sage/10 p-3 rounded-xl text-center">
                      All basic ingredients are fully stocked.
                    </p>
                  ) : (
                    criticalStock.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs border border-line/60 rounded-lg p-2.5 bg-cream/35">
                        <span className="font-semibold text-espresso">{item.item}</span>
                        <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "Critical" ? "bg-berry/10 text-berry" : "bg-honey/10 text-honey"
                        }`}>
                          {item.stock} {item.unit}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Active Tickets Feed (Chef KDS Grid) */}
            <div className="xl:col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-espresso">Active Kitchen Tickets ({orders.filter(o => o.status === "Received" || o.status === "Preparing").length})</h3>
                <span className="text-xs text-bark-soft">Click any menu item to open step-by-step recipe card</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {orders
                    .filter((o) => o.status === "Received" || o.status === "Preparing")
                    .map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Card 
                          raised 
                          className={`border-t-4 flex flex-col justify-between h-[300px] p-5 transition-all ${
                            order.status === "Preparing" 
                              ? "border-t-clay bg-paper-raised shadow-md" 
                              : "border-t-honey bg-paper"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-xs uppercase tracking-wider bg-sand text-espresso font-mono font-bold px-2 py-0.5 rounded">
                                  #{order.id}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ml-2 px-1.5 py-0.5 rounded ${
                                  order.type === "Dine-in" ? "bg-clay/10 text-clay" : order.type === "Online" ? "bg-berry/10 text-berry" : "bg-honey/10 text-honey"
                                }`}>
                                  {order.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-bark-soft font-mono">
                                <Clock size={12} /> {getOrderAge(order.timestamp)}
                              </div>
                            </div>

                            <p className="text-espresso font-semibold text-sm mb-3">
                              {order.customer} {order.customerAddress && <span className="text-xs text-bark-soft font-normal">({order.customerAddress})</span>}
                            </p>

                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                              {order.items.map((item, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => {
                                    navigator.vibrate?.(12);
                                    setSelectedRecipe({ name: item.name, steps: RECIPE_BOOK[item.name] || ["Recipe instructions not configured."] });
                                  }}
                                  className="flex gap-2 text-sm text-bark cursor-pointer hover:text-clay transition-colors"
                                  title="Click for recipe"
                                >
                                  <span className="font-mono text-clay font-bold">{item.qty}×</span>
                                  <span className="underline decoration-dotted decoration-bark-soft">{item.name}</span>
                                </div>
                              ))}
                            </div>
                            
                            {order.customerPhone && (
                              <p className="text-[10px] text-bark-soft mt-3 font-mono">Note: {order.customerPhone}</p>
                            )}
                          </div>

                          <div className="flex gap-2.5 pt-3 border-t border-line/60 mt-4">
                            <button
                              onClick={() => handleCancel(order.id)}
                              className="p-2 border border-line text-bark-soft hover:text-berry hover:bg-berry/5 transition-colors rounded-xl cursor-pointer"
                              title="Cancel Ticket"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleAdvance(order.id, order.status)}
                              className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                order.status === "Received"
                                  ? "bg-honey text-espresso hover:bg-honey/80"
                                  : "bg-clay text-cream hover:bg-clay-dark shadow-sm"
                              }`}
                            >
                              {order.status === "Received" ? (
                                <>👨‍🍳 Start Grinding &amp; Brewing</>
                              ) : (
                                <>✅ Order Ready for Service</>
                              )}
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </AnimatePresence>
                {orders.filter(o => o.status === "Received" || o.status === "Preparing").length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <CheckCircle2 size={48} className="text-sage mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-espresso">Kitchen Queue Clear!</h3>
                    <p className="text-bark-soft text-sm mt-1">All hot orders and baking completed.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── WAITER VIEW ── */}
        {activeTab === "waiter" && (
          <>
            {/* Left Side: Buzzer Board & Ready List */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Call Waiter Buzzer Board */}
              <Card raised className="p-5 border-berry/20 bg-paper-raised">
                <div className="flex items-center gap-2 mb-4 border-b border-line pb-3">
                  <Bell className="text-berry animate-bounce" size={20} />
                  <h3 className="font-semibold text-espresso">Live Table Buzzers</h3>
                </div>
                <div className="space-y-3">
                  {tableCalls.filter(c => !c.resolved).length === 0 ? (
                    <p className="text-sm text-bark-soft text-center py-6 italic">No active customer buzzers.</p>
                  ) : (
                    tableCalls.filter(c => !c.resolved).map((call) => (
                      <div 
                        key={call.id} 
                        className="bg-berry/5 border border-berry/25 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-espresso font-bold">🛎️ Table {call.tableNo} Summoned!</span>
                          <span className="text-[10px] text-bark-soft font-mono">{getOrderAge(call.timestamp)}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.vibrate?.([15, 60, 15]);
                            resolveTableCall(call.id);
                            toast.success(`Cleared alert for Table ${call.tableNo}`);
                          }}
                          className="w-full py-1.5 bg-berry text-cream hover:bg-berry/90 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Resolve Alert
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Ready to Serve Feed */}
              <Card className="p-5 border-line bg-paper">
                <div className="flex items-center gap-2 mb-3">
                  <CupSoda className="text-sage" size={18} />
                  <h3 className="text-sm font-semibold text-espresso">Ready at Counter ({orders.filter(o => o.status === "Ready").length})</h3>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {orders.filter(o => o.status === "Ready").length === 0 ? (
                    <p className="text-xs text-bark-soft text-center py-6 italic">No tickets waiting to serve.</p>
                  ) : (
                    orders
                      .filter((o) => o.status === "Ready")
                      .map((order) => (
                        <div key={order.id} className="border border-line/70 rounded-xl p-3 bg-cream/35 flex flex-col gap-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-mono font-bold text-espresso">#{order.id} · {order.customer}</span>
                            <span className="text-[9px] uppercase font-bold text-sage">{order.type}</span>
                          </div>
                          <p className="text-[11px] text-bark font-mono truncate">{order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</p>
                          <button
                            onClick={() => handleAdvance(order.id, "Ready")}
                            className="w-full py-1.5 bg-sage hover:bg-sage/90 text-cream text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check size={11} /> Serve &amp; Invoice
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            </div>

            {/* Visual Dining Floor Map (CEO/Manager Table Matrix) */}
            <div className="xl:col-span-3 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-espresso font-display">Dining Floor Map</h3>
                <p className="text-xs text-bark-soft mt-1">Real-time status of Cardamom's floor tables.</p>
              </div>

              {/* Table Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {tables.map((table) => (
                  <Card 
                    key={table.tableNo} 
                    className={`p-6 border flex flex-col justify-between h-[180px] transition-all relative ${
                      table.status === "calling" 
                        ? "bg-berry/5 border-berry shadow-lg animate-pulse" 
                        : table.status === "ready" 
                        ? "bg-sage/5 border-sage" 
                        : table.status === "preparing" 
                        ? "bg-honey/5 border-honey" 
                        : "bg-paper border-line"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-espresso">Table {table.tableNo}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          table.status === "calling" ? "text-berry" :
                          table.status === "ready" ? "text-sage" :
                          table.status === "preparing" ? "text-honey" : "text-bark-soft"
                        }`}>
                          {table.status === "calling" ? "🚨 Needs Service" :
                           table.status === "ready" ? "✨ Order Ready" :
                           table.status === "preparing" ? "⏳ Preparing" : "☕ Idle"}
                        </span>
                      </div>
                      
                      {table.status === "calling" && (
                        <button
                          onClick={() => {
                            if (table.activeCall) {
                              navigator.vibrate?.([15, 60, 15]);
                              resolveTableCall(table.activeCall.id);
                              toast.success(`Cleared table ${table.tableNo} service request.`);
                            }
                          }}
                          className="px-2.5 py-1 bg-berry text-cream rounded-md text-[10px] font-bold hover:bg-berry/80 cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-bark">
                      {table.activeOrders.length > 0 ? (
                        <div className="space-y-1">
                          <div className="font-mono text-espresso font-semibold text-[10px] mb-1">
                            Orders: {table.activeOrders.map(o => `#${o.id}`).join(", ")}
                          </div>
                          {table.activeOrders.map((o) => (
                            <div key={o.id} className="truncate">
                              {o.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-bark-soft italic text-[11px]">Table empty</span>
                      )}
                    </div>

                    {table.status === "ready" && (
                      <button
                        onClick={() => {
                          const orderToServe = table.activeOrders.find(o => o.status === "Ready");
                          if (orderToServe) {
                            handleAdvance(orderToServe.id, "Ready");
                          }
                        }}
                        className="w-full mt-4 py-2 bg-sage hover:bg-sage/90 text-cream text-[10px] uppercase font-bold tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check size={12} /> Serve Table
                      </button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RECIPE HANDBOOK DRAWER MODAL ── */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 bg-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-paper border border-line rounded-[2.5rem] p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <div className="border-b border-line pb-4 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-clay font-bold">Cardamom Recipe Book</span>
                <h3 className="text-2xl text-espresso font-display font-semibold mt-1">{selectedRecipe.name}</h3>
              </div>

              <div className="space-y-4 my-6">
                {selectedRecipe.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start text-sm">
                    <span className="font-mono bg-sand text-clay text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-bark pt-0.5 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedRecipe(null)}
                className="w-full py-3 bg-espresso text-cream hover:bg-clay text-sm font-semibold rounded-full cursor-pointer transition-colors"
              >
                Close Handbook
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
