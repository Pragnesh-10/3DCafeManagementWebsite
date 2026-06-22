import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Plus, Minus, Coffee, Cake, CreditCard, ChevronLeft, LogOut, Trash2, Clock, MapPin, CheckCircle, PackageOpen } from "lucide-react";
import { cn } from "../utils/cn";
import { Button as NeonButton } from "../components/ui/neon-button";
import { CafeSpotlightHero } from "../components/CafeSpotlightHero";
import { Card } from "../components/Card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCafeStore, MENU_ITEMS, MenuItem } from "../utils/store";
import confetti from "canvas-confetti";

export function CustomerDashboard() {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway" | "Online">("Dine-in");
  const [customerName, setCustomerName] = useState(() => {
    return sessionStorage.getItem("user_name") || "";
  });
  const [sidebarTab, setSidebarTab] = useState<"tray" | "track">("tray");
  
  // Placed orders tracked in this browser session
  const [trackedOrderIds, setTrackedOrderIds] = useState<string[]>(() => {
    const raw = localStorage.getItem("my_placed_orders");
    return raw ? JSON.parse(raw) : [];
  });

  // Placed orders that have already had their "Ready" confetti celebration
  const [celebratedOrderIds, setCelebratedOrderIds] = useState<string[]>(() => {
    const raw = sessionStorage.getItem("celebrated_orders");
    return raw ? JSON.parse(raw) : [];
  });

  const { orders, inventory, placeOrder, isItemAvailable, cancelOrder } = useCafeStore();

  // Save tracked order IDs to local storage
  useEffect(() => {
    localStorage.setItem("my_placed_orders", JSON.stringify(trackedOrderIds));
  }, [trackedOrderIds]);

  // Save celebrated order IDs to session storage
  useEffect(() => {
    sessionStorage.setItem("celebrated_orders", JSON.stringify(celebratedOrderIds));
  }, [celebratedOrderIds]);

  // Dynamic filter categories
  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map((i) => i.category)))];

  // Active orders details fetched from the central store
  const activeOrders = orders.filter((o) => trackedOrderIds.includes(o.id));

  // Check for newly "Ready" orders to play confetti celebration!
  useEffect(() => {
    activeOrders.forEach((order) => {
      if (order.status === "Ready" && !celebratedOrderIds.includes(order.id)) {
        // Trigger celebration!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#b85c38", "#c0892f", "#8fa89b", "#2c2118"],
        });
        toast.success(`Order #${order.id} is ready at the counter! Enjoy your coffee!`, {
          duration: 8000,
        });
        setCelebratedOrderIds((prev) => [...prev, order.id]);
        
        // Auto switch to tracker tab so they see it
        setSidebarTab("track");
      }
    });
  }, [orders, activeOrders, celebratedOrderIds]);

  const handleLogout = () => {
    if (!sessionStorage.getItem("user_role")) {
      navigate("/");
      return;
    }
    sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("user_name");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const addToCart = (item: MenuItem) => {
    if (!isItemAvailable(item.name)) {
      toast.error(`${item.name} is currently out of ingredients!`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) return prev.map((i) => (i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => {
      const current = prev.find((i) => i.item.id === id);
      if (current && delta > 0) {
        // Check if restocking would exceed inventory limits
        const willBeQty = current.qty + delta;
        if (!isItemAvailable(current.item.name)) {
          toast.error(`Not enough stock to add another ${current.item.name}`);
          return prev;
        }
      }
      return prev
        .map((i) => (i.item.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0);
    });
  };

  const handlePlaceOrder = () => {
    const nameToUse = customerName.trim() || (orderType === "Dine-in" ? "Table 1" : "Guest Explorer");
    
    // Call placeOrder which deducts inventory and registers order
    const orderId = placeOrder(nameToUse, cart, orderType);
    
    // Add to local tracking list
    setTrackedOrderIds((prev) => [orderId, ...prev]);
    
    toast.success(`Order #${orderId} placed! Tracking status...`);
    setCart([]);
    setSidebarTab("track");
  };

  const handleRemoveTrackedOrder = (orderId: string) => {
    setTrackedOrderIds((prev) => prev.filter((id) => id !== orderId));
  };

  const cartTotal = cart.reduce((s, { item, qty }) => s + item.price * qty, 0);

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      {/* Customer Header */}
      <header className="h-16 border-b border-line bg-cream px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="w-7 h-7 rounded-full bg-espresso text-cream flex items-center justify-center shadow-[0_2px_4px_rgba(44,33,24,0.15)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="12" rx="7.5" ry="10" transform="rotate(35 12 12)" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 5C12 9 12 15 16 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-display font-semibold text-espresso">Cardamom</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-bark-soft uppercase tracking-widest leading-none font-semibold">
              {sessionStorage.getItem("user_name") || "Guest Explorer"}
            </p>
            <p className="text-[10px] text-clay font-bold uppercase tracking-[0.2em] mt-1">
              {sessionStorage.getItem("user_role") === "customer" ? "Bean Club Member" : "Casual Coffee Lover"}
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 hover:bg-clay/10 rounded-full transition-colors text-bark hover:text-clay"
            title={sessionStorage.getItem("user_role") ? "Log Out" : "Return to Home"}
          >
            {sessionStorage.getItem("user_role") ? <LogOut size={18} /> : <ChevronLeft size={18} onClick={() => navigate("/")} />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1400px] mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center items-center"
            >
              <CafeSpotlightHero onStart={() => setHasStarted(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="order-flow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0"
            >
              {/* Menu Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl text-espresso font-display font-medium">The Menu</h2>
                    <p className="text-xs text-bark-soft mt-0.5">Freshly roasted single origins & house blend delicacies</p>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                          activeCategory === cat 
                            ? "bg-espresso text-cream border-espresso shadow-md" 
                            : "bg-paper border-line text-bark hover:border-bark/30"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {MENU_ITEMS.filter((i) => activeCategory === "All" || i.category === activeCategory).map((item) => {
                      const available = isItemAvailable(item.name);
                      return (
                        <motion.div
                          layout
                          key={item.id}
                          whileHover={available ? { y: -5 } : {}}
                          className={cn(
                            "bg-paper border border-line rounded-3xl overflow-hidden flex flex-col text-left group hover:shadow-xl transition-all relative",
                            !available && "opacity-60"
                          )}
                        >
                          <div className="h-40 relative overflow-hidden bg-sand">
                            <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-espresso/5 group-hover:bg-transparent transition-colors" />
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 bg-cream/95 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-espresso border border-line shadow-sm flex items-center gap-1.5">
                                {item.category.includes("drinks") ? <Coffee size={10} className="text-clay" /> : <Cake size={10} className="text-clay" />}
                                {item.category}
                              </span>
                            </div>
                            
                            {!available && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                                <span className="px-3.5 py-1.5 bg-destructive text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                                  Sold Out
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h4 className="text-base text-espresso font-semibold mb-1">{item.name}</h4>
                            <p className="text-xs text-bark-soft mb-4 line-clamp-2">
                              {item.category.includes("drinks") 
                                ? "Carefully prepared using our signature house blend beans, roasted to perfection." 
                                : "Baked fresh daily in our roastery kitchen using organic ingredients."}
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-lg font-mono text-clay font-semibold">₹{item.price}</span>
                              <button
                                disabled={!available}
                                onClick={() => addToCart(item)}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center text-espresso transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-clay/50",
                                  available 
                                    ? "bg-sand hover:bg-clay hover:text-cream cursor-pointer" 
                                    : "bg-line text-bark-soft cursor-not-allowed"
                                )}
                              >
                                <Plus size={20} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cart / Tracker Sidebar */}
              <div className="w-full lg:w-96 flex flex-col shrink-0 h-full min-h-0">
                <Card className="flex flex-col h-full p-0 overflow-hidden rounded-[2rem] border-line shadow-2xl bg-paper">
                  {/* Tab Selector */}
                  <div className="flex border-b border-line bg-sand/15 p-1.5 gap-1.5">
                    <button
                      onClick={() => setSidebarTab("tray")}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                        sidebarTab === "tray"
                          ? "bg-paper text-espresso shadow-sm border border-line/50"
                          : "text-bark hover:bg-sand/30"
                      )}
                    >
                      <ShoppingCart size={15} />
                      Your Tray
                      {cart.length > 0 && (
                        <span className="bg-clay text-cream w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono leading-none">
                          {cart.reduce((a, b) => a + b.qty, 0)}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setSidebarTab("track")}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                        sidebarTab === "track"
                          ? "bg-paper text-espresso shadow-sm border border-line/50"
                          : "text-bark hover:bg-sand/30"
                      )}
                    >
                      <Clock size={15} />
                      Track Orders
                      {activeOrders.length > 0 && (
                        <span className="bg-sage text-cream w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono leading-none animate-pulse">
                          {activeOrders.length}
                        </span>
                      )}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {sidebarTab === "tray" ? (
                      <motion.div
                        key="tray-tab"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        {/* Cart Items list */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                          {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
                              <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center text-bark-soft mb-4 opacity-40">
                                <ShoppingCart size={40} />
                              </div>
                              <h4 className="text-espresso font-semibold mb-2">Tray is empty</h4>
                              <p className="text-xs text-bark-soft">Add some freshly roasted goodness from the menu to start your order.</p>
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              {cart.map((c) => (
                                <div
                                  key={c.item.id}
                                  className="flex items-center gap-4 bg-cream/40 border border-line/70 p-3 rounded-2xl group hover:border-clay/30 transition-colors"
                                >
                                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-line shadow-xs bg-sand">
                                    <ImageWithFallback src={c.item.image} alt={c.item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm text-espresso font-semibold leading-tight truncate">{c.item.name}</h4>
                                    <p className="text-xs text-clay font-mono mt-1">₹{c.item.price * c.qty}</p>
                                  </div>
                                  <div className="flex items-center gap-2 bg-paper rounded-full p-1 border border-line shadow-xs">
                                    <button onClick={() => updateQty(c.item.id, -1)} className="w-6 h-6 flex items-center justify-center text-bark hover:text-clay transition-colors"><Minus size={12} /></button>
                                    <span className="w-4 text-center text-xs font-mono text-espresso font-bold">{c.qty}</span>
                                    <button onClick={() => updateQty(c.item.id, 1)} className="w-6 h-6 flex items-center justify-center text-bark hover:text-clay transition-colors"><Plus size={12} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Order Details & Checkout */}
                        {cart.length > 0 && (
                          <div className="p-6 border-t border-line bg-sand/10 space-y-5">
                            {/* Order Type and Customer Identity fields */}
                            <div className="space-y-3.5 bg-paper border border-line/65 rounded-2xl p-4 shadow-sm">
                              {/* Selection */}
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-bark-soft block mb-1.5">Service Type</label>
                                <div className="flex bg-sand/30 border border-line/80 rounded-lg p-0.5 text-xs font-medium">
                                  {(["Dine-in", "Takeaway", "Online"] as const).map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => setOrderType(t)}
                                      className={cn(
                                        "flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer",
                                        orderType === t ? "bg-espresso text-cream shadow-xs" : "text-bark hover:text-espresso"
                                      )}
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Identity input */}
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-bark-soft block mb-1.5">
                                  {orderType === "Dine-in" ? "Table Number" : "Customer Name"}
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  placeholder={orderType === "Dine-in" ? "e.g. Table 4" : "e.g. Emma Thompson"}
                                  className="w-full bg-paper-raised border border-line rounded-lg px-3 py-2 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 transition-all font-medium"
                                />
                              </div>
                            </div>

                            {/* Summary & Place button */}
                            <div>
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-xs text-bark">
                                  <span>Subtotal</span>
                                  <span className="font-mono">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-xs text-bark">
                                  <span>GST (5%)</span>
                                  <span className="font-mono">₹{(cartTotal * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-line/60 items-end">
                                  <span className="text-sm text-espresso font-semibold">Total (GST Incl.)</span>
                                  <span className="text-xl font-mono text-clay font-bold">₹{(cartTotal * 1.05).toFixed(2)}</span>
                                </div>
                              </div>
                              <NeonButton
                                variant="solid"
                                className="w-full h-13 rounded-2xl text-base shadow-[0_12px_24px_-8px_rgba(184,92,56,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                                onClick={handlePlaceOrder}
                              >
                                <CreditCard size={18} /> Place Order
                              </NeonButton>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="track-tab"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        {/* Placed orders list */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                          {activeOrders.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
                              <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center text-bark-soft mb-4 opacity-40">
                                <PackageOpen size={32} />
                              </div>
                              <h4 className="text-espresso font-semibold mb-2">No active orders</h4>
                              <p className="text-xs text-bark-soft">Orders you place in this browser will show up here with live status tracking.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {activeOrders.map((order) => {
                                const isReady = order.status === "Ready";
                                const isServed = order.status === "Served";
                                return (
                                  <div
                                    key={order.id}
                                    className={cn(
                                      "bg-cream/40 border p-4.5 rounded-2xl space-y-4 transition-all shadow-xs border-line",
                                      isReady && "border-sage/40 bg-sage/5 shadow-md",
                                      isServed && "border-line/40 bg-sand/5"
                                    )}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-sm text-espresso font-bold">#{order.id}</span>
                                          <span className="px-1.5 py-0.5 bg-sand rounded text-[9px] font-bold uppercase tracking-wider text-bark-soft border border-line">
                                            {order.type}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-bark-soft mt-0.5">For {order.customer}</p>
                                      </div>
                                      
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-semibold text-clay font-mono">₹{order.total}</span>
                                        {/* Cancel button if Received */}
                                        {order.status === "Received" && (
                                          <button
                                            onClick={() => {
                                              cancelOrder(order.id);
                                              handleRemoveTrackedOrder(order.id);
                                              toast.success(`Order #${order.id} cancelled successfully.`);
                                            }}
                                            className="p-1 hover:bg-destructive/15 rounded text-bark hover:text-destructive transition-colors ml-1"
                                            title="Cancel Order"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="text-xs text-bark space-y-1 bg-paper/60 p-2.5 rounded-xl border border-line/40">
                                      {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between font-medium">
                                          <span>{item.qty}x {item.name}</span>
                                          <span className="text-bark-soft">₹{item.price * item.qty}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Visual Horizontal Timeline */}
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center text-[10px] font-bold text-bark-soft">
                                        <span>Status:</span>
                                        <span className={cn(
                                          "px-2 py-0.5 rounded-full font-bold tracking-wide uppercase text-[9px] border",
                                          order.status === "Received" && "bg-honey/15 text-honey border-honey/20",
                                          order.status === "Preparing" && "bg-clay/15 text-clay border-clay/20",
                                          order.status === "Ready" && "bg-sage/15 text-sage border-sage/20 animate-bounce",
                                          order.status === "Served" && "bg-bark-soft/12 text-bark-soft border-line"
                                        )}>
                                          {order.status}
                                        </span>
                                      </div>

                                      {/* Timeline Stepper */}
                                      <div className="relative flex justify-between items-center px-1">
                                        {/* Line */}
                                        <div className="absolute left-1 right-1 h-0.5 bg-line z-0 top-1/2 -translate-y-1/2" />
                                        
                                        {/* Active Line Progress */}
                                        <div 
                                          className="absolute left-1 h-0.5 bg-clay transition-all duration-500 z-0 top-1/2 -translate-y-1/2" 
                                          style={{
                                            width: 
                                              order.status === "Received" ? "0%" :
                                              order.status === "Preparing" ? "33%" :
                                              order.status === "Ready" ? "66%" : "100%"
                                          }}
                                        />

                                        {/* Steps */}
                                        {(["Received", "Preparing", "Ready", "Served"] as const).map((step, idx) => {
                                          const stepOrder = ["Received", "Preparing", "Ready", "Served"];
                                          const currentIdx = stepOrder.indexOf(order.status);
                                          const isCompleted = idx < currentIdx;
                                          const isActive = idx === currentIdx;
                                          
                                          return (
                                            <div key={step} className="relative z-10 flex flex-col items-center">
                                              <div className={cn(
                                                "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all border",
                                                isCompleted && "bg-clay text-cream border-clay",
                                                isActive && "bg-espresso text-cream border-espresso scale-120 ring-4 ring-espresso/15",
                                                !isActive && !isCompleted && "bg-paper text-bark-soft border-line"
                                              )}>
                                                {isCompleted ? "✓" : idx + 1}
                                              </div>
                                              <span className={cn(
                                                "text-[8px] mt-1 whitespace-nowrap font-medium",
                                                isActive ? "font-bold text-espresso" : "text-bark-soft"
                                              )}>
                                                {step}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Action button if Ready or completed */}
                                    {isReady && (
                                      <NeonButton
                                        variant="solid"
                                        className="w-full py-2 bg-sage hover:bg-sage/90 text-white rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(143,168,155,0.3)] animate-pulse"
                                        onClick={() => {
                                          handleRemoveTrackedOrder(order.id);
                                          toast.success("Order collected! Hope to brew for you again soon!");
                                        }}
                                      >
                                        <CheckCircle size={14} /> I Collected My Order
                                      </NeonButton>
                                    )}

                                    {isServed && (
                                      <button
                                        onClick={() => handleRemoveTrackedOrder(order.id)}
                                        className="w-full py-1.5 bg-sand/40 hover:bg-sand border border-line text-bark text-xs font-semibold rounded-xl transition-all"
                                      >
                                        Dismiss from Tracker
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
