import React from "react";
import { Card } from "../components/Card";
import { motion, AnimatePresence } from "motion/react";
import { Clock, CheckCircle2, ChefHat, ShoppingBag, UtensilsCrossed, Globe, ChevronRight, XCircle } from "lucide-react";
import { cn } from "../utils/cn";
import { useCafeStore, OrderStatus, OrderType } from "../utils/store";
import { toast } from "sonner";

const COLUMNS: { title: OrderStatus; icon: React.ElementType; dot: string; bg: string }[] = [
  { title: "Received", icon: Clock, dot: "bg-honey animate-pulse", bg: "bg-honey/5 border-honey/20" },
  { title: "Preparing", icon: ChefHat, dot: "bg-clay animate-spin", bg: "bg-clay/5 border-clay/20" },
  { title: "Ready", icon: CheckCircle2, dot: "bg-sage animate-bounce", bg: "bg-sage/5 border-sage/20" },
  { title: "Served", icon: ShoppingBag, dot: "bg-bark-soft", bg: "bg-bark-soft/5 border-line/40" },
];

export function Orders() {
  const { orders, advanceOrderStatus, cancelOrder } = useCafeStore();

  const getTypeIcon = (type: OrderType) => {
    switch (type) {
      case "Dine-in":
        return <UtensilsCrossed size={13} />;
      case "Takeaway":
        return <ShoppingBag size={13} />;
      case "Online":
        return <Globe size={13} />;
    }
  };

  const handleAdvance = (id: string, currentStatus: OrderStatus) => {
    const next: OrderStatus =
      currentStatus === "Received" ? "Preparing" :
      currentStatus === "Preparing" ? "Ready" : "Served";
    
    advanceOrderStatus(id, next);
    
    if (next === "Ready") {
      toast.success(`Order #${id} marked as READY. Customer notified!`);
    } else if (next === "Served") {
      toast.success(`Order #${id} served successfully! Invoice archived.`);
    } else {
      toast.info(`Order #${id} status: ${next}`);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col font-sans">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft font-semibold">Front of house</p>
          <h1 className="text-3xl mt-1 text-espresso font-display font-medium">Order Rail</h1>
          <p className="text-bark mt-1.5">Advance tickets as the kitchen and bar prepare each item.</p>
        </div>
        <div className="text-xs bg-paper border border-line px-3.5 py-1.5 rounded-full text-bark font-medium flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-honey animate-pulse" />
          {orders.filter(o => o.status !== "Served").length} active tickets
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 overflow-hidden min-h-0">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.title);
          return (
            <div 
              key={col.title} 
              className={cn(
                "flex flex-col h-full rounded-[2rem] border p-4.5 overflow-hidden transition-all shadow-xs bg-paper/60",
                colOrders.length > 0 ? "border-line" : "border-line/45"
              )}
            >
              {/* Header of Column */}
              <div className="flex items-center justify-between mb-4 px-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", col.dot)} />
                  <span className="text-sm font-semibold uppercase tracking-wider text-espresso">
                    {col.title}
                  </span>
                </div>
                <span className="bg-sand text-espresso px-2 py-0.5 rounded-full text-xs font-mono font-bold">
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar">
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
                      <Card raised className="p-4.5 border-line hover:border-clay/40 transition-colors relative group shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-espresso font-bold">#{order.id}</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-sand px-1.5 py-0.5 rounded border border-line text-bark-soft">
                                {order.type}
                              </span>
                            </div>
                            <p className="text-bark text-xs font-medium flex items-center gap-1.5 mt-1.5">
                              {getTypeIcon(order.type)} {order.customer}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-bark-soft bg-sand px-2 py-0.5 rounded-md border border-line/60">
                              {order.time}
                            </span>
                            
                            {/* Cancel button for Staff */}
                            {order.status === "Received" && (
                              <button
                                onClick={() => {
                                  cancelOrder(order.id);
                                  toast.error(`Order #${order.id} was voided/cancelled.`);
                                }}
                                className="p-1 hover:bg-destructive/15 rounded text-bark-soft hover:text-destructive transition-colors"
                                title="Void Order"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-1.5 mb-4 bg-cream/35 border border-line/40 p-2.5 rounded-xl text-sm text-bark">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 justify-between">
                              <div className="flex gap-2">
                                <span className="font-mono text-clay font-bold">{item.qty}×</span>
                                <span className="font-medium text-espresso">{item.name}</span>
                              </div>
                              <span className="text-xs text-bark-soft font-mono">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-line/75">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-bark-soft font-bold">Total Amount</p>
                            <span className="font-mono text-espresso font-bold text-base">₹{order.total}</span>
                          </div>
                          
                          {order.status !== "Served" && (
                            <button
                              onClick={() => handleAdvance(order.id, order.status)}
                              className="text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 bg-espresso hover:bg-clay text-cream transition-all shadow-sm focus:outline-none cursor-pointer"
                            >
                              <span>
                                {order.status === "Received" ? "Prepare" :
                                 order.status === "Preparing" ? "Ready" : "Serve"}
                              </span>
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-line/50 rounded-2xl text-bark-soft">
                    <p className="text-xs">No orders in this queue</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
