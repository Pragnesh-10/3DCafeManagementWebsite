import React, { useState } from "react";
import { Card } from "../components/Card";
import { Award, Star, History, ShoppingCart, Plus, Minus, Search, CreditCard, Coffee, Cake, Users, Gift } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../utils/cn";
import { Button as NeonButton } from "../components/ui/neon-button";
import { CafeSpotlightHero } from "../components/CafeSpotlightHero";
import { useCafeStore, MENU_ITEMS, MenuItem } from "../utils/store";
import { toast } from "sonner";

type Mode = "people" | "order";

export function Customers() {
  const { customers, placeOrder, isItemAvailable } = useCafeStore();
  const [mode, setMode] = useState<Mode>("people");
  const [hasStarted, setHasStarted] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway" | "Online">("Dine-in");
  const [customGuestName, setCustomGuestName] = useState("");

  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map((i) => i.category)))];

  const addToCart = (item: MenuItem) => {
    if (!isItemAvailable(item.name)) {
      toast.error(`${item.name} is currently out of stock in the pantry.`);
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
        if (!isItemAvailable(current.item.name)) {
          toast.error(`Pantry ingredients depleted for ${current.item.name}.`);
          return prev;
        }
      }
      return prev
        .map((i) => (i.item.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0);
    });
  };

  const cartTotal = cart.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const tax = +(cartTotal * 0.05).toFixed(2);
  const total = +(cartTotal + tax).toFixed(2);

  const handleCheckout = () => {
    const customerName = selectedCustomer || customGuestName.trim() || "Walk-in Guest";
    
    // Call placeOrder which updates orders, inventory, and customer spending
    const orderId = placeOrder(customerName, cart, orderType);
    
    toast.success(`POS Order #${orderId} generated for ${customerName}! Ticket pushed to rail.`);
    
    // Reset order panel
    setCart([]);
    setSelectedCustomer("");
    setCustomGuestName("");
    setMode("people"); // Go back to regulars list
  };

  // Filter regular customers
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft font-semibold">Guests & Sales Counter</p>
          <h1 className="text-3xl mt-1 text-espresso font-display font-medium">Regulars & The Till</h1>
          <p className="text-bark mt-1.5">Track loyal customers, manage Bean Club tiers, and ring up manual walk-ins.</p>
        </div>

        <div className="flex bg-paper p-1.5 rounded-full border border-line w-fit shadow-xs">
          {(["people", "order"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                mode === m 
                  ? "bg-espresso text-cream shadow-sm" 
                  : "text-bark hover:text-espresso"
              )}
            >
              {m === "order" && <ShoppingCart size={14} />}
              {m === "people" ? "Regulars list" : "New counter order"}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === "people" ? (
          <motion.div
            key="people-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
          >
            {/* Bean Club Card */}
            <Card raised className="flex flex-col items-start p-6 rounded-2xl border-line shadow-lg bg-paper-raised">
              <div className="w-12 h-12 rounded-xl bg-clay/10 flex items-center justify-center text-clay mb-5">
                <Award size={24} />
              </div>
              <h3 className="text-xl text-espresso font-semibold">Bean Club Rewards</h3>
              <p className="text-xs text-bark mt-1 mb-6 leading-relaxed">
                Loyalty is calculated automatically. Members accumulate points per ₹20 spent and progress through Bronze, Silver, and Gold tiers.
              </p>
              
              <div className="w-full space-y-3.5 bg-paper/60 p-4 rounded-xl border border-line/60 text-xs text-bark">
                <div className="flex justify-between font-medium">
                  <span>Gold members:</span>
                  <span className="font-mono font-bold text-espresso">{customers.filter(c => c.tier === "Gold").length}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Silver members:</span>
                  <span className="font-mono font-bold text-espresso">{customers.filter(c => c.tier === "Silver").length}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Average Member spent:</span>
                  <span className="font-mono font-bold text-espresso">
                    ₹{Math.round(customers.reduce((sum, c) => sum + c.spent, 0) / customers.length).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <NeonButton 
                variant="outline" 
                onClick={() => toast.success("Rewards program parameters saved.")}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border-line hover:bg-sand bg-paper cursor-pointer"
              >
                <Gift size={14} className="mr-1.5 inline" /> Reward settings
              </NeonButton>
            </Card>

            {/* Customers table */}
            <Card className="md:col-span-2 p-0 overflow-hidden rounded-[2rem] border-line shadow-lg bg-paper">
              <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg text-espresso font-semibold flex items-center gap-2">
                    <Users size={18} className="text-clay" /> Loyal Customers
                  </h3>
                  <p className="text-xs text-bark-soft mt-0.5">Visits and spending registered through POS transactions</p>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-soft" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search regulars…" 
                    className="bg-paper-raised border border-line rounded-xl pl-9 pr-4 py-2 text-xs text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 transition-all" 
                  />
                </div>
              </div>
              
              <div className="divide-y divide-line/60 overflow-y-auto max-h-[450px] custom-scrollbar">
                {filteredCustomers.length === 0 ? (
                  <div className="py-16 text-center text-bark-soft">
                    <p className="text-sm">No regular customers found matching your search.</p>
                  </div>
                ) : (
                  filteredCustomers.map((cust) => (
                    <div key={cust.name} className="px-6 py-4.5 flex items-center justify-between hover:bg-sand/20 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <span className="w-10 h-10 rounded-full bg-espresso text-cream flex items-center justify-center font-bold shadow-xs">
                          {cust.name.charAt(0)}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-espresso">{cust.name}</h4>
                          <p className="text-[10px] text-bark-soft flex items-center gap-1 mt-1 font-semibold">
                            <History size={12} /> Last visit: {cust.lastVisit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-mono text-sm text-espresso font-bold">₹{cust.spent.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-bark-soft">{cust.visits} visits</p>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border",
                          cust.tier === "Gold" && "bg-honey/10 text-honey border-honey/20",
                          cust.tier === "Silver" && "bg-sand text-bark border-line",
                          cust.tier === "Bronze" && "bg-sand/40 text-bark-soft border-line/40"
                        )}>
                          <Star size={10} fill="currentColor" /> {cust.tier}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="counter-pos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-start"
          >
            {/* POS Menu Grid */}
            <div className="flex-1 flex flex-col min-h-0 w-full">
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer",
                      activeCategory === cat ? "bg-espresso text-cream border-espresso" : "bg-paper border-line text-bark hover:text-espresso"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {MENU_ITEMS.filter((i) => activeCategory === "All" || i.category === activeCategory).map((item) => {
                    const available = isItemAvailable(item.name);
                    return (
                      <button
                        type="button"
                        disabled={!available}
                        onClick={() => addToCart(item)}
                        key={item.id}
                        className={cn(
                          "bg-paper border border-line rounded-2xl overflow-hidden flex flex-col text-left group hover:border-clay/40 transition-colors shadow-sm focus:outline-none relative",
                          !available && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <div className="h-28 w-full relative overflow-hidden bg-sand">
                          <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-cream/90 rounded text-espresso border border-line shadow-xs">
                            {item.category}
                          </span>
                          {!available && (
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center">
                              <span className="px-2 py-1 bg-destructive text-white rounded text-[10px] font-bold uppercase tracking-widest">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 flex items-center justify-between w-full">
                          <div>
                            <h4 className="text-sm font-semibold text-espresso leading-tight">{item.name}</h4>
                            <p className="font-mono text-sm text-clay font-bold mt-1">₹{item.price}</p>
                          </div>
                          {available && (
                            <span className="w-7 h-7 rounded-full bg-sand flex items-center justify-center text-espresso group-hover:bg-clay group-hover:text-cream transition-colors shadow-xs">
                              <Plus size={15} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* POS Cart Sidebar */}
            <Card className="w-full lg:w-96 flex flex-col h-[500px] shrink-0 p-0 overflow-hidden rounded-[2rem] border-line shadow-xl bg-paper">
              <div className="p-4.5 border-b border-line bg-sand/20 flex items-center justify-between">
                <h3 className="text-espresso font-semibold flex items-center gap-2">
                  <ShoppingCart size={17} className="text-clay font-bold" /> POS Checkout
                </h3>
                <span className="bg-espresso text-cream px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                  {cart.reduce((a, b) => a + b.qty, 0)} items
                </span>
              </div>

              {/* POS Cart Items list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-bark-soft gap-3 py-16">
                    <ShoppingCart size={36} className="opacity-30" />
                    <p className="text-xs">No items in POS tray yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {cart.map((c) => (
                      <div
                        key={c.item.id}
                        className="flex items-center gap-3 bg-paper-raised border border-line p-2 rounded-xl"
                      >
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-line bg-sand">
                          <ImageWithFallback src={c.item.image} alt={c.item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-espresso leading-tight truncate">{c.item.name}</h4>
                          <p className="font-mono text-xs text-clay font-bold mt-0.5">₹{c.item.price * c.qty}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-paper rounded-full p-0.5 border border-line">
                          <button onClick={() => updateQty(c.item.id, -1)} className="p-1 text-bark hover:text-espresso transition-colors"><Minus size={11} /></button>
                          <span className="w-4 text-center text-xs font-mono font-bold text-espresso">{c.qty}</span>
                          <button onClick={() => updateQty(c.item.id, 1)} className="p-1 text-bark hover:text-espresso transition-colors"><Plus size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* POS Metadata Form & Total */}
              {cart.length > 0 && (
                <div className="p-4.5 border-t border-line bg-sand/10 space-y-4">
                  {/* Select Customer */}
                  <div className="space-y-3.5 bg-paper p-3 rounded-xl border border-line/65">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-bark block mb-1.5">Select regular customer</label>
                      <select 
                        value={selectedCustomer}
                        onChange={(e) => {
                          setSelectedCustomer(e.target.value);
                          if (e.target.value) setCustomGuestName("");
                        }}
                        className="w-full bg-paper border border-line rounded-lg px-2.5 py-1.5 text-xs text-espresso focus:outline-none focus:border-clay/60 focus:ring-1 focus:ring-clay/15"
                      >
                        <option value="">-- Guest Explorer --</option>
                        {customers.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.tier})
                          </option>
                        ))}
                      </select>
                    </div>

                    {!selectedCustomer && (
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-bark block mb-1.5">Or write guest identifier</label>
                        <input
                          type="text"
                          value={customGuestName}
                          onChange={(e) => setCustomGuestName(e.target.value)}
                          placeholder="e.g. Table 6 or Rohan Malhotra"
                          className="w-full bg-paper border border-line rounded-lg px-2.5 py-1.5 text-xs text-espresso focus:outline-none focus:border-clay/60"
                        />
                      </div>
                    )}

                    <div className="flex bg-sand/30 border border-line/80 rounded-lg p-0.5 text-[10px] font-semibold">
                      {(["Dine-in", "Takeaway", "Online"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setOrderType(t)}
                          className={cn(
                            "flex-1 py-1 rounded text-center transition-all cursor-pointer",
                            orderType === t ? "bg-espresso text-cream shadow-xs" : "text-bark hover:text-espresso"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-bark"><span>Subtotal</span><span className="font-mono">₹{cartTotal}</span></div>
                    <div className="flex justify-between text-bark"><span>GST (5%)</span><span className="font-mono">₹{tax}</span></div>
                    <div className="flex justify-between pt-2 border-t border-line/60 text-espresso font-semibold text-sm">
                      <span>Total Amount</span>
                      <span className="font-mono text-clay font-bold">₹{total}</span>
                    </div>
                  </div>

                  <NeonButton 
                    variant="solid" 
                    onClick={handleCheckout}
                    className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CreditCard size={14} /> Take payment
                  </NeonButton>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
