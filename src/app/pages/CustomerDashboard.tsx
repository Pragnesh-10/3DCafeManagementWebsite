import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Plus, Minus, Coffee, Cake, CreditCard, ChevronLeft, LogOut, UtensilsCrossed, ShoppingBag, Globe, CheckCircle2, Clock, MessageSquare, Star } from "lucide-react";
import { cn } from "../utils/cn";
import { Button as NeonButton } from "../components/ui/neon-button";
import { CafeSpotlightHero } from "../components/CafeSpotlightHero";
import { Card } from "../components/Card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/haptics";
import { useCafeStore } from "../utils/store";

const MENU_ITEMS = [
  { id: 1, name: "Flat White", category: "Hot drinks", price: 210, image: "https://images.unsplash.com/photo-1615485736894-a2d2e6d4cd9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 2, name: "Cappuccino", category: "Hot drinks", price: 190, image: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 3, name: "Pour Over", category: "Hot drinks", price: 240, image: "https://images.unsplash.com/photo-1522012188892-24beb302783d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 4, name: "Cinnamon Roll", category: "Pastries", price: 180, image: "https://images.unsplash.com/photo-1645995575875-ea6511c9d127?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 5, name: "Iced Latte", category: "Cold drinks", price: 230, image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 6, name: "Single-Origin Espresso", category: "Hot drinks", price: 160, image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
];

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { placeOrder } = useCafeStore();
  const [hasStarted, setHasStarted] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway" | "Online">("Dine-in");
  const [tableNo, setTableNo] = useState("");
  const [notes, setNotes] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<{ item: typeof MENU_ITEMS[0]; qty: number }[]>([]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewingStep, setBrewingStep] = useState(0);

  // New checkout and Telegram details states
  const [showCheckout, setShowCheckout] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("In 15 mins");
  const [tgNotification, setTgNotification] = useState<string | null>(null);

  // Listen to simulated Telegram event
  React.useEffect(() => {
    const handleTgEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setTgNotification(customEvent.detail.message);
      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        setTgNotification(null);
      }, 10000);
      return () => clearTimeout(timer);
    };
    window.addEventListener("telegram_notification_simulated", handleTgEvent);
    return () => {
      window.removeEventListener("telegram_notification_simulated", handleTgEvent);
    };
  }, []);

  const handleLogout = () => {
    triggerHaptic("medium");
    if (!sessionStorage.getItem("user_role")) {
      navigate("/");
      return;
    }
    sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("user_name");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    triggerHaptic("light");
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) return prev.map((i) => (i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { item, qty: 1 }];
    });
    toast.success(`${item.name} added`, { duration: 1500 });
  };

  const updateQty = (id: number, delta: number) => {
    triggerHaptic("light");
    setCart((prev) =>
      prev.map((i) => (i.item.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0)
    );
  };

  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      triggerHaptic("error");
      toast.error("Please enter Name and Mobile Number");
      return;
    }
    if (orderType === "Dine-in" && !tableNo.trim()) {
      triggerHaptic("error");
      toast.error("Please enter your Table Number");
      return;
    }
    if (orderType === "Online" && !custAddress.trim()) {
      triggerHaptic("error");
      toast.error("Please enter your Delivery Address");
      return;
    }

    setShowCheckout(false);
    triggerHaptic("medium");
    setIsBrewing(true);
    setBrewingStep(0);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < 4) {
        setBrewingStep(currentStep);
        triggerHaptic("light");
      } else {
        clearInterval(interval);

        const resolvedAddress = orderType === "Dine-in"
          ? `Table ${tableNo}`
          : orderType === "Online"
          ? custAddress
          : `Takeaway (Pickup: ${pickupTime})`;

        // Call store placeOrder dynamically with customer details
        placeOrder(
          custName,
          cart,
          orderType,
          custPhone,
          resolvedAddress
        );

        setIsBrewing(false);
        setOrderPlaced(true);
        triggerHaptic("success");
      }
    }, 700);
  };

  const cartTotal = cart.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const gst = +(cartTotal * 0.05).toFixed(2);
  const grandTotal = +(cartTotal + gst).toFixed(2);
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map((i) => i.category)))];
  const isLoggedIn = !!sessionStorage.getItem("user_role");
  const orderRef = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Customer Header */}
      <header className="h-16 border-b border-line bg-cream px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
<div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-espresso text-cream flex items-center justify-center">
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
            <p className="text-xs text-bark-soft uppercase tracking-widest leading-none">
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── SUCCESS SCREEN ── */}
          {orderPlaced && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-sage/15 flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-sage" />
              </motion.div>
              <h1 className="text-4xl text-espresso mb-2">Order placed!</h1>
              <p className="text-bark max-w-xs mb-1">Your tray is being prepared now.</p>
              <p className="text-xs font-mono text-bark-soft mb-8">{orderRef} · {orderType}</p>
              <div className="w-full max-w-sm bg-paper border border-line rounded-2xl p-5 text-left mb-6 space-y-2">
                {cart.map((c) => (
                  <div key={c.item.id} className="flex justify-between text-sm">
                    <span className="text-bark">{c.qty}× {c.item.name}</span>
                    <span className="font-mono text-espresso">₹{c.item.price * c.qty}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-line space-y-1.5 text-sm">
                  <div className="flex justify-between text-bark"><span>GST (5%)</span><span className="font-mono">₹{gst}</span></div>
                  <div className="flex justify-between text-espresso font-semibold"><span>Total</span><span className="font-mono text-clay">₹{grandTotal}</span></div>
                </div>
                {notes && <p className="pt-2 border-t border-line text-xs text-bark-soft">Note: {notes}</p>}
              </div>
              <div className="flex items-center gap-2 text-bark text-sm mb-8">
                <Clock size={14} className="text-clay" /> Estimated wait: <strong className="text-espresso">8 – 12 min</strong>
              </div>
              <button onClick={() => { setCart([]); setNotes(""); setTableNo(""); setOrderPlaced(false); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-line bg-paper text-bark hover:text-espresso hover:bg-sand transition-colors text-sm">
                <ChevronLeft size={16} /> Order again
              </button>
            </motion.div>
          )}

          {/* ── MENU SCREEN ── */}
          {!orderPlaced && !hasStarted && (
            <motion.div key="hero" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col p-6">
              <CafeSpotlightHero onStart={() => setHasStarted(true)} />
            </motion.div>
          )}
          {!orderPlaced && hasStarted && (
            <motion.div
              key="order-flow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0 overflow-hidden"
            >
              {/* Order type strip */}
              <div className="lg:hidden px-5 pt-4 pb-2 border-b border-line bg-cream/90 flex gap-2">
                {(["Dine-in","Takeaway","Online"] as const).map(t => (
                  <button key={t} onClick={() => setOrderType(t)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs border transition-colors ${orderType === t ? "bg-espresso text-cream border-espresso" : "bg-paper border-line text-bark"}`}>
                    {t === "Dine-in" && <UtensilsCrossed size={12} />}
                    {t === "Takeaway" && <ShoppingBag size={12} />}
                    {t === "Online" && <Globe size={12} />}
                    {t}
                  </button>
                ))}
              </div>
              {/* Menu Section */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Desktop order type + table strip */}
                <div className="hidden lg:flex items-center gap-3 px-6 pt-5 pb-3 border-b border-line bg-cream/80">
                  <span className="text-xs text-bark-soft uppercase tracking-wider">Order type</span>
                  {(["Dine-in","Takeaway","Online"] as const).map(t => (
                    <button key={t} onClick={() => setOrderType(t)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm border transition-colors ${orderType === t ? "bg-espresso text-cream border-espresso" : "bg-paper border-line text-bark hover:text-espresso"}`}>
                      {t === "Dine-in" && <UtensilsCrossed size={13} />}
                      {t === "Takeaway" && <ShoppingBag size={13} />}
                      {t === "Online" && <Globe size={13} />}
                      {t}
                    </button>
                  ))}
                  {orderType === "Dine-in" && (
                    <input value={tableNo} onChange={e => setTableNo(e.target.value)} placeholder="Table no."
                      className="w-24 bg-paper border border-line rounded-full px-3 py-1.5 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60" />
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl text-espresso">The Menu</h2>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          triggerHaptic("light");
                          setActiveCategory(cat);
                        }}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all border",
                          activeCategory === cat ? "bg-espresso text-cream border-espresso" : "bg-paper border-line text-bark hover:border-bark/30"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {MENU_ITEMS.filter((i) => activeCategory === "All" || i.category === activeCategory).map((item) => (
                      <motion.button
                        layout
                        key={item.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(item)}
                        className="bg-paper border border-line rounded-3xl overflow-hidden flex flex-col text-left group hover:shadow-xl transition-all"
                      >
                        <div className="h-40 relative overflow-hidden bg-sand">
                          <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-espresso/5 group-hover:bg-transparent transition-colors" />
                          {cart.find(c => c.item.id === item.id) && (
                            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-clay text-cream text-xs font-mono font-bold flex items-center justify-center">
                              {cart.find(c => c.item.id === item.id)?.qty}
                            </span>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 bg-cream/95 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-espresso border border-line shadow-sm flex items-center gap-1.5">
                              {item.category.includes("drinks") ? <Coffee size={10} className="text-clay" /> : <Cake size={10} className="text-clay" />}
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h4 className="text-base text-espresso font-semibold mb-1">{item.name}</h4>
                          <p className="text-xs text-bark-soft mb-4 line-clamp-2">Carefully prepared using our signature house blend beans.</p>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-lg font-mono text-clay">₹{item.price}</span>
                            <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-espresso group-hover:bg-clay group-hover:text-cream transition-all shadow-sm">
                              <Plus size={20} />
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
                </div>
              </div>

              {/* Cart Sidebar */}
              <div className="w-full lg:w-[380px] flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-line bg-paper-raised">
                <Card className="flex flex-col h-full p-0 overflow-hidden rounded-none border-0 bg-transparent shadow-none">
                  <div className="p-5 border-b border-line flex items-center justify-between">
                    <h3 className="text-espresso flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-clay/10 text-clay flex items-center justify-center">
                        <ShoppingCart size={18} />
                      </span>
                      Your tray
                    </h3>
                    <span className="bg-espresso text-cream px-2.5 py-0.5 rounded-full text-xs font-mono">
                      {cartCount} item{cartCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center text-bark-soft mb-4 opacity-40">
                          <ShoppingCart size={40} />
                        </div>
                        <h4 className="text-espresso font-semibold mb-2">Tray is empty</h4>
                        <p className="text-xs text-bark-soft">Add some freshly roasted goodness to start your order.</p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {cart.map((c) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key={c.item.id}
                            className="flex items-center gap-4 bg-cream/50 border border-line p-3 rounded-2xl group hover:border-clay/30 transition-colors"
                          >
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-line shadow-sm">
                              <ImageWithFallback src={c.item.image} alt={c.item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-espresso font-semibold leading-tight truncate">{c.item.name}</h4>
                              <p className="text-xs text-clay font-mono mt-1">₹{c.item.price * c.qty}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-paper rounded-full p-1 border border-line shadow-sm">
                              <button onClick={() => updateQty(c.item.id, -1)} className="w-6 h-6 flex items-center justify-center text-bark hover:text-clay transition-colors"><Minus size={14} /></button>
                              <span className="w-4 text-center text-sm font-mono text-espresso font-bold">{c.qty}</span>
                              <button onClick={() => updateQty(c.item.id, 1)} className="w-6 h-6 flex items-center justify-center text-bark hover:text-clay transition-colors"><Plus size={14} /></button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="px-5 py-3 border-b border-line">
                    <p className="text-xs text-bark-soft flex items-center gap-1.5 mb-1.5">
                      <MessageSquare size={12} /> Special instructions
                    </p>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Oat milk, extra shot, no sugar…"
                      rows={2}
                      className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 resize-none" />
                  </div>

                  <div className="p-5 border-t border-line">
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between text-bark">
                        <span>Subtotal</span>
                        <span className="font-mono">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-bark">
                        <span>GST (5%)</span>
                        <span className="font-mono">₹{gst}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-line text-espresso font-semibold">
                        <span>Total</span>
                        <span className="text-xl font-mono text-clay">₹{grandTotal}</span>
                      </div>
                    </div>
                    <NeonButton
                      variant="solid"
                      disabled={cart.length === 0 || isBrewing}
                      className="w-full h-12 rounded-xl text-base"
                      onClick={() => {
                        triggerHaptic("medium");
                        setShowCheckout(true);
                      }}
                    >
                      <CreditCard size={18} /> Place order · ₹{grandTotal}
                    </NeonButton>
                    {!isLoggedIn && cart.length > 0 && (
                      <p className="text-center text-xs text-bark-soft mt-3 flex items-center justify-center gap-1">
                        <Star size={11} className="text-honey" />
                        Sign in to earn Bean Club points
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── COFFEE BREWING LOADER ── */}
      <AnimatePresence>
        {isBrewing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cream/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              {/* Animated Steam lines */}
              <div className="absolute top-2 left-1/2 -translate-x-[20px] flex gap-2.5">
                {[0, 1, 2].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      y: [15, -25],
                      opacity: [0, 0.8, 0],
                      scale: [0.7, 1.2, 0.8]
                    }}
                    transition={{ 
                      duration: 1.6, 
                      repeat: Infinity, 
                      delay: i * 0.4,
                      ease: "easeOut"
                    }}
                    className="w-1.5 h-6 bg-clay/30 rounded-full blur-[1px]"
                  />
                ))}
              </div>

              {/* Dynamic Animated Coffee Cup */}
              <motion.div 
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, -1, 1, -1, 0]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative z-10 w-24 h-20 border-[3.5px] border-espresso rounded-b-[2rem] rounded-t-[4px] flex items-center justify-center bg-cream"
              >
                {/* Coffee Fluid Level */}
                <motion.div 
                  initial={{ height: "0%" }}
                  animate={{ height: brewingStep === 0 ? "25%" : brewingStep === 1 ? "55%" : brewingStep === 2 ? "80%" : "95%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute bottom-0 left-0 right-0 bg-clay rounded-b-[1.7rem] opacity-90"
                />
                
                {/* Cup Handle */}
                <div className="absolute left-[calc(100%-2px)] top-3.5 w-5 h-9 border-[3.5px] border-l-0 border-espresso rounded-r-xl" />
              </motion.div>
            </div>
            
            <motion.h3 
              key={brewingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl text-espresso font-display font-semibold tracking-tight max-w-sm h-12"
            >
              {[
                "Grinding Chikmagalur cardamom beans...",
                "Extracting espresso shot...",
                "Frothing velvety warm milk...",
                "Sending order tickets to roastery..."
              ][brewingStep] || "Preparing tray..."}
            </motion.h3>
            
            <div className="w-52 h-1.5 bg-line rounded-full overflow-hidden mt-6">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: `${(brewingStep + 1) * 25}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="h-full bg-clay rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Form Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-paper border border-line rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_20px_50px_-20px_rgba(44,33,24,0.3)] p-6 md:p-8 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-semibold text-espresso">
                  Checkout Details
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setShowCheckout(false);
                  }}
                  className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-bark hover:text-espresso transition-colors cursor-pointer border-0"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmCheckout} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-bark-soft block mb-1.5 font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-cream/30 border border-line rounded-xl px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-bark-soft block mb-1.5 font-semibold">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full bg-cream/30 border border-line rounded-xl px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
                  />
                </div>

                {orderType === "Dine-in" && (
                  <div>
                    <label className="text-xs uppercase tracking-wider text-bark-soft block mb-1.5 font-semibold">
                      Table Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4"
                      value={tableNo}
                      onChange={(e) => setTableNo(e.target.value)}
                      className="w-full bg-cream/30 border border-line rounded-xl px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
                    />
                  </div>
                )}

                {orderType === "Online" && (
                  <div>
                    <label className="text-xs uppercase tracking-wider text-bark-soft block mb-1.5 font-semibold">
                      Delivery Address
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Enter your street address, building, and apartment number"
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      className="w-full bg-cream/30 border border-line rounded-xl px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 resize-none"
                    />
                  </div>
                )}

                {orderType === "Takeaway" && (
                  <div>
                    <label className="text-xs uppercase tracking-wider text-bark-soft block mb-1.5 font-semibold">
                      Estimated Pick-up Time
                    </label>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-cream/30 border border-line rounded-xl px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
                    >
                      <option value="In 10 mins">In 10 mins</option>
                      <option value="In 15 mins">In 15 mins</option>
                      <option value="In 20 mins">In 20 mins</option>
                      <option value="In 30 mins">In 30 mins</option>
                      <option value="In 45 mins">In 45 mins</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t border-line flex gap-3">
                  <NeonButton
                    type="button"
                    variant="outline"
                    onClick={() => {
                      triggerHaptic("light");
                      setShowCheckout(false);
                    }}
                    className="flex-1 rounded-xl h-11 border-0"
                  >
                    Cancel
                  </NeonButton>
                  <NeonButton
                    type="submit"
                    variant="solid"
                    className="flex-1 rounded-xl h-11 border-0"
                  >
                    Pay &amp; Brew
                  </NeonButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telegram Notification (Simulator Popup) */}
      <AnimatePresence>
        {tgNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-4 right-4 z-[100] max-w-sm w-full bg-[#1e2734] border border-[#2b394a] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden text-white font-sans text-left"
          >
            <div className="bg-[#151e27] px-4 py-3 flex items-center justify-between border-b border-[#2b394a]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#2CA5E0] flex items-center justify-center text-white shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.87 7.9-2.73 8.35-.42.22-.84.28-1.2.22-.72-.11-1.28-.62-1.92-1.07-.46-.33-.92-.66-1.38-1-.46-.34-.92-.68-1.38-1.01l-1.38-.68c-.62-.31-.62-.92.15-1.23l12.31-4.9c.77-.31 1.38.15 1.23 1.32z" />
                  </svg>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2CA5E0]">Telegram Notification (Simulator)</span>
              </div>
              <button onClick={() => setTgNotification(null)} className="text-gray-400 hover:text-white text-xs cursor-pointer bg-transparent border-0 p-1">✕</button>
            </div>
            <div className="p-4 whitespace-pre-wrap font-mono text-[11px] text-gray-200 overflow-y-auto max-h-[300px] leading-relaxed select-text bg-[#1e2734]">
              {tgNotification}
            </div>
            <div className="bg-[#151e27] px-4 py-2 text-[10px] text-gray-400 text-center border-t border-[#2b394a]">
              Sent to Roastery Telegram Bot ☕
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
