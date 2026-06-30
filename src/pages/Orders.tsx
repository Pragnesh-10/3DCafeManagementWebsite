import React from "react";
import { Card } from "../components/Card";
import { motion, AnimatePresence } from "motion/react";
import { Clock, CheckCircle2, ChefHat, ShoppingBag, UtensilsCrossed, Globe, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";
import { toast } from "sonner";
import { useCafeStore, type OrderStatus, type OrderType } from "../utils/store";

const COLUMNS: { title: OrderStatus; icon: React.ElementType; dot: string }[] = [
  { title: "Received", icon: Clock, dot: "bg-honey" },
  { title: "Preparing", icon: ChefHat, dot: "bg-clay" },
  { title: "Ready", icon: CheckCircle2, dot: "bg-sage" },
  { title: "Served", icon: ShoppingBag, dot: "bg-bark-soft" },
];

export function Orders() {
  const { orders, advanceOrderStatus } = useCafeStore();

  const moveOrder = (id: string, newStatus: OrderStatus) => {
    if (newStatus === "Served") {
      navigator.vibrate?.([15, 60, 15]);
    } else {
      navigator.vibrate?.(22);
    }
    
    advanceOrderStatus(id, newStatus);
    toast.success(`Order #${id} is now in ${newStatus.toLowerCase()} status!`);
  };

  const getTypeIcon = (type: OrderType) => {
    switch (type) {
      case "Dine-in": return <UtensilsCrossed size={13} />;
      case "Takeaway": return <ShoppingBag size={13} />;
      case "Online": return <Globe size={13} />;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-bark-soft">Front of house</p>
        <h1 className="text-3xl mt-1 text-espresso">Order rail</h1>
        <p className="text-bark mt-1.5">Drag a ticket forward as the bar works through it.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 overflow-hidden">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.title);
          return (
            <div key={col.title} className="flex flex-col h-full bg-paper/60 rounded-[var(--radius)] border border-line p-3.5 overflow-hidden">
              <div className="flex items-center justify-between mb-3.5 px-1">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", col.dot)} />
                  <h3 className="text-sm text-espresso">{col.title}</h3>
                </div>
                <span className="text-bark-soft text-xs font-mono">{colOrders.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {colOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card raised className="p-4 hover:border-clay/40 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono text-espresso">#{order.id}</span>
                            <p className="text-bark text-xs flex items-center gap-1.5 mt-1">
                              {getTypeIcon(order.type)} {order.type} · {order.customer}
                            </p>
                          </div>
                          <span className="text-[0.7rem] font-mono text-bark-soft bg-sand px-1.5 py-0.5 rounded">{order.time}</span>
                        </div>

                        <div className="space-y-1 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 text-sm text-bark">
                              <span className="font-mono text-clay">{item.qty}×</span>
                              <span>{item.name}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-line">
                          <span className="font-mono text-espresso">₹{order.total}</span>
                          {order.status !== "Served" && (
                            <button
                              onClick={() => {
                                const next: OrderStatus =
                                  order.status === "Received" ? "Preparing" :
                                  order.status === "Preparing" ? "Ready" : "Served";
                                moveOrder(order.id, next);
                              }}
                              className="text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1 bg-espresso text-cream hover:bg-clay transition-colors cursor-pointer"
                            >
                              Advance <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colOrders.length === 0 && (
                  <p className="text-center text-xs text-bark-soft py-8">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
