import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Plus, Minus, Coffee, Cake, CreditCard, ChevronLeft, LogOut } from "lucide-react";
import { cn } from "../utils/cn";
import { Button as NeonButton } from "../components/ui/neon-button";
import { CafeSpotlightHero } from "../components/CafeSpotlightHero";
import { Card } from "../components/Card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { toast } from "sonner";

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
  const [hasStarted, setHasStarted] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<{ item: typeof MENU_ITEMS[0]; qty: number }[]>([]);

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

  const addToCart = (item: typeof MENU_ITEMS[0]) =>
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) return prev.map((i) => (i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { item, qty: 1 }];
    });

  const updateQty = (id: number, delta: number) =>
    setCart((prev) =>
      prev.map((i) => (i.item.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0)
    );

  const cartTotal = cart.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map((i) => i.category)))];

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

      <main className="flex-1 flex flex-col p-6 max-w-[1400px] mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
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
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl text-espresso">The Menu</h2>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
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

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

              {/* Cart Sidebar */}
              <div className="w-full lg:w-96 flex flex-col shrink-0">
                <Card className="flex flex-col h-full p-0 overflow-hidden rounded-[2rem] border-line shadow-2xl bg-paper">
                  <div className="p-6 border-b border-line bg-sand/20 flex items-center justify-between">
                    <h3 className="text-lg text-espresso flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-clay/10 text-clay flex items-center justify-center">
                        <ShoppingCart size={20} />
                      </div>
                      Your Tray
                    </h3>
                    <span className="bg-espresso text-cream px-3 py-1 rounded-full text-xs font-mono">
                      {cart.reduce((a, b) => a + b.qty, 0)}
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

                  <div className="p-6 border-t border-line bg-sand/10">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm text-bark">
                        <span>Subtotal</span>
                        <span className="font-mono">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-bark">
                        <span>GST (5%)</span>
                        <span className="font-mono">₹{(cartTotal * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-line/60 items-end">
                        <span className="text-espresso font-semibold">Total Amount</span>
                        <span className="text-2xl font-mono text-clay font-bold">₹{(cartTotal * 1.05).toFixed(2)}</span>
                      </div>
                    </div>
                    <NeonButton 
                      variant="solid" 
                      disabled={cart.length === 0} 
                      className="w-full h-14 rounded-2xl text-lg shadow-[0_12px_30px_-10px_rgba(184,92,56,0.4)]"
                      onClick={() => {
                        toast.success("Order placed successfully! We'll notify you when it's ready.");
                        setCart([]);
                      }}
                    >
                      <CreditCard size={20} /> Place Order
                    </NeonButton>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
