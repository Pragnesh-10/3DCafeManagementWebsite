import React, { useState } from "react";
import { Card } from "../components/Card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Award, Star, History, ShoppingCart, Plus, Minus, Search, CreditCard, Coffee, Cake, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../utils/cn";
import { Button as NeonButton } from "../components/ui/neon-button";
import { CafeSpotlightHero } from "../components/CafeSpotlightHero";
import { triggerHaptic } from "../utils/haptics";
import { toast } from "sonner";
import { useCafeStore } from "../utils/store";

type Mode = "people" | "order";

const MENU_ITEMS = [
  { id: 1, name: "Caramel Macchiato", category: "Hot drinks", price: 360, image: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 2, name: "Dark Espresso", category: "Hot drinks", price: 180, image: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 3, name: "Iced Cold Brew", category: "Cold drinks", price: 320, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 4, name: "Butter Croissant", category: "Pastries", price: 220, image: "https://images.unsplash.com/photo-1623334044303-241021148842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 5, name: "Blueberry Muffin", category: "Pastries", price: 240, image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
];

export function Customers() {
  const [mode, setMode] = useState<Mode>("people");
  const [hasStarted, setHasStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<{ item: typeof MENU_ITEMS[0]; qty: number }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState("");

  const { customers, placeOrder } = useCafeStore();

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    triggerHaptic("light");
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) return prev.map((i) => (i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { item, qty: 1 }];
    });
    toast.success(`${item.name} added to cart`, { duration: 1500 });
  };

  const updateQty = (id: number, delta: number) => {
    triggerHaptic("light");
    setCart((prev) =>
      prev.map((i) => (i.item.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0)
    );
  };

  const handleTakePayment = () => {
    setIsProcessing(true);
    triggerHaptic("medium");
    
    // Call store placeOrder
    placeOrder("Walk-in Customer", cart, "Takeaway");

    setTimeout(() => {
      setIsProcessing(false);
      triggerHaptic("success");
      toast.success(`Payment of ₹${(cartTotal + tax).toFixed(2)} received!`, {
        description: "POS transaction finalized and printed successfully."
      });
      setCart([]);
    }, 1500);
  };

  const cartTotal = cart.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const tax = +(cartTotal * 0.05).toFixed(2);
  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map((i) => i.category)))];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft">Guests</p>
          <h1 className="text-3xl mt-1 text-espresso">Regulars &amp; the till</h1>
          <p className="text-bark mt-1.5">Know your regulars; ring up the next round.</p>
        </div>

        <div className="flex bg-paper p-1 rounded-full border border-line w-fit">
          {(["people", "order"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                triggerHaptic("medium");
                setMode(m);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-colors flex items-center gap-2 cursor-pointer",
                mode === m ? "bg-espresso text-cream" : "text-bark hover:text-espresso"
              )}
            >
              {m === "order" && <ShoppingCart size={15} />}
              {m === "people" ? "Regulars" : "New order"}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === "people" ? (
          <motion.div
            key="people"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <Card raised className="flex flex-col items-start p-6">
              <div className="w-12 h-12 rounded-full bg-clay/12 flex items-center justify-center text-clay mb-4"><Award size={24} /></div>
              <h3 className="text-2xl text-espresso">Bean Club</h3>
              <p className="text-sm text-bark mt-1 mb-5">{customers.length} members · 1 point per ₹20 spent</p>
              <NeonButton variant="default" className="mt-auto w-full cursor-pointer">
                Manage rewards
              </NeonButton>
            </Card>

            <Card className="md:col-span-2 p-0 overflow-hidden">
              <div className="p-5 border-b border-line flex items-center justify-between gap-3">
                <h3 className="text-lg text-espresso">Top regulars</h3>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-soft" />
                  <input 
                    type="text" 
                    placeholder="Search…" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-paper-raised border border-line rounded-full pl-8 pr-4 py-1.5 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15" 
                  />
                </div>
              </div>
              <div className="divide-y divide-line/60">
                {customers
                  .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
                  .map((cust) => (
                    <div key={cust.name} className="px-5 py-4 flex items-center justify-between hover:bg-sand/40 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <span className="w-10 h-10 rounded-full bg-espresso text-cream flex items-center justify-center">{cust.name.charAt(0)}</span>
                        <div>
                          <h4 className="text-espresso">{cust.name}</h4>
                          <p className="text-xs text-bark-soft flex items-center gap-1.5 mt-0.5"><History size={12} /> {cust.lastVisit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="font-mono text-sm text-espresso">₹{cust.spent.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-bark-soft">{cust.visits} visits</p>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs flex items-center gap-1",
                          cust.tier === "Gold" ? "bg-honey/15 text-honey" : cust.tier === "Silver" ? "bg-sand text-bark" : "bg-sand/40 text-bark-soft"
                        )}>
                          <Star size={10} fill="currentColor" /> {cust.tier}
                        </span>
                      </div>
                    </div>
                  ))}
                {customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                  <p className="text-center text-xs text-bark-soft py-8">No regulars found matching your search</p>
                )}
              </div>
            </Card>
          </motion.div>
        ) : !hasStarted ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
          >
            <CafeSpotlightHero onStart={() => { triggerHaptic("medium"); setHasStarted(true); }} />
          </motion.div>
        ) : (
          <motion.div
            key="order"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0"
          >
            {/* Menu */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      triggerHaptic("light");
                      setActiveCategory(cat);
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors border cursor-pointer",
                      activeCategory === cat ? "bg-espresso text-cream border-espresso" : "bg-paper border-line text-bark hover:text-espresso"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {MENU_ITEMS.filter((i) => activeCategory === "All" || i.category === activeCategory).map((item) => (
                    <motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(item)}
                      key={item.id}
                      className="bg-paper border border-line rounded-[var(--radius)] overflow-hidden flex flex-col text-left group hover:border-clay/40 transition-colors shadow-[0_8px_24px_-16px_rgba(44,33,24,0.22)] cursor-pointer"
                    >
                      <div className="h-28 w-full relative overflow-hidden bg-sand">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute bottom-2 left-2 text-[0.7rem] px-1.5 py-0.5 bg-cream/90 rounded text-bark flex items-center gap-1">
                          {item.category.includes("drinks") ? <Coffee size={11} /> : <Cake size={11} />}
                          {item.category}
                        </span>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm text-espresso leading-tight">{item.name}</h4>
                          <p className="font-mono text-sm text-clay mt-1">₹{item.price}</p>
                        </div>
                        <span className="w-7 h-7 rounded-full bg-sand flex items-center justify-center text-espresso group-hover:bg-clay group-hover:text-cream transition-colors">
                          <Plus size={15} />
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart */}
            <Card className="w-full lg:w-96 flex flex-col h-[480px] lg:h-auto shrink-0 p-0 overflow-hidden">
              <div className="p-4 border-b border-line flex items-center justify-between">
                <h3 className="text-espresso flex items-center gap-2"><ShoppingCart size={17} className="text-clay" /> This order</h3>
                <span className="bg-sand text-bark px-2 py-0.5 rounded text-xs font-mono">{cart.reduce((a, b) => a + b.qty, 0)} items</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-bark-soft gap-3">
                    <ShoppingCart size={40} className="opacity-30" />
                    <p className="text-sm">No items yet</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cart.map((c) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        key={c.item.id}
                        className="flex items-center gap-3 bg-paper-raised border border-line p-2 rounded-lg"
                      >
                        <ImageWithFallback src={c.item.image} alt={c.item.name} className="w-11 h-11 rounded-md object-cover bg-sand" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-espresso leading-tight truncate">{c.item.name}</h4>
                          <p className="font-mono text-xs text-clay">₹{c.item.price * c.qty}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-cream rounded-lg p-1 border border-line">
                          <button onClick={() => updateQty(c.item.id, -1)} className="p-0.5 text-bark hover:text-espresso transition-colors"><Minus size={14} /></button>
                          <span className="w-4 text-center text-sm font-mono text-espresso">{c.qty}</span>
                          <button onClick={() => updateQty(c.item.id, 1)} className="p-0.5 text-bark hover:text-espresso transition-colors"><Plus size={14} /></button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="p-4 border-t border-line">
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-bark"><span>Subtotal</span><span className="font-mono">₹{cartTotal}</span></div>
                  <div className="flex justify-between text-bark"><span>GST (5%)</span><span className="font-mono">₹{tax}</span></div>
                  <div className="flex justify-between pt-2 border-t border-line text-espresso"><span>Total</span><span className="font-mono">₹{(cartTotal + tax).toFixed(2)}</span></div>
                </div>
                <NeonButton 
                  variant="solid" 
                  disabled={cart.length === 0 || isProcessing} 
                  onClick={handleTakePayment}
                  className="w-full py-3 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={17} /> Take payment
                    </>
                  )}
                </NeonButton>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
