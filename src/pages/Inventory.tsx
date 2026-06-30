import React, { useState } from "react";
import { Card } from "../components/Card";
import { AlertTriangle, Package, RefreshCw, Plus, ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";
import { Button as NeonButton } from "../components/ui/neon-button";
import { toast } from "sonner";
import { useCafeStore } from "../utils/store";

const statusStyles: Record<string, string> = {
  Good: "bg-sage/12 text-sage",
  Low: "bg-honey/15 text-honey",
  Critical: "bg-berry/12 text-berry",
};

export function Inventory() {
  const [query, setQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const { inventory, restockInventory } = useCafeStore();

  const rows = inventory.filter(
    (r) => r.id !== "settings_telegram" && r.item.toLowerCase().includes(query.toLowerCase())
  );

  // Count items with Low/Critical status
  const criticalCount = inventory.filter(
    (i) => i.id !== "settings_telegram" && (i.status === "Low" || i.status === "Critical")
  ).length;

  // Calculate total pantry value dynamically if needed, or estimate
  const inventoryValue = 202450; // Dynamic mock value

  const handleSync = () => {
    setIsSyncing(true);
    navigator.vibrate?.(22);
    setTimeout(() => {
      setIsSyncing(false);
      navigator.vibrate?.([15, 60, 15]);
      toast.success("Inventory synchronized with local warehouse!");
    }, 1100);
  };

  const handlePurchaseOrder = () => {
    navigator.vibrate?.(22);
    toast.success("Purchase order created", {
      description: "Draft purchase order sent to supplier for approval."
    });
  };

  const handleReorder = (id: string, name: string) => {
    navigator.vibrate?.(12);
    // Restock with 10 units dynamically
    restockInventory(id, 10);
    toast.success(`Replenished 10 units of ${name}!`, {
      description: "Inventory stock counts updated in real-time."
    });
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft">Back of house</p>
          <h1 className="text-3xl mt-1 text-espresso">The pantry</h1>
          <p className="text-bark mt-1.5">What's on the shelf, and what needs reordering.</p>
        </div>
        <div className="flex gap-3">
          <NeonButton onClick={handleSync} variant="ghost" disabled={isSyncing} className="cursor-pointer">
            {isSyncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Sync
          </NeonButton>
          <NeonButton onClick={handlePurchaseOrder} variant="solid" className="cursor-pointer">
            <Plus size={15} /> Purchase order
          </NeonButton>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-bark text-sm">Low/Critical stock</p>
              <h3 className="text-3xl font-mono text-espresso mt-1">{criticalCount}</h3>
            </div>
            <div className="p-2.5 bg-honey/15 rounded-lg text-honey"><AlertTriangle size={20} /></div>
          </div>
          <p className="mt-4 text-sm text-bark">Replenishment warnings active for low units.</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-bark text-sm">Pantry value</p>
              <h3 className="text-3xl font-mono text-espresso mt-1">₹{inventoryValue.toLocaleString("en-IN")}</h3>
            </div>
            <div className="p-2.5 bg-sage/12 rounded-lg text-sage"><Package size={20} /></div>
          </div>
          <p className="mt-4 text-sm text-bark">Wastage down <span className="text-sage">12%</span> this week.</p>
        </Card>

        <Card raised className="relative overflow-hidden">
          <span className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-clay/8" />
          <p className="text-clay text-sm">Weekend note</p>
          <h3 className="text-xl text-espresso leading-snug mt-1">Stock up on almond milk</h3>
          <p className="mt-3 text-sm text-bark">The Brigade Road marathon lands Saturday — plant-milk pulls usually jump sharply.</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-line flex items-center justify-between gap-4">
          <h3 className="text-lg text-espresso">Stock register</h3>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter items…"
            className="bg-paper-raised border border-line rounded-lg px-3.5 py-1.5 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                {["Code", "Item", "Category", "On hand", "Status", ""].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs uppercase tracking-wider text-bark-soft font-medium ${h === "" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-line/60 last:border-0 hover:bg-sand/40 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-bark-soft">{item.id}</td>
                  <td className="px-5 py-3.5 text-sm text-espresso">
                    <span className="inline-flex items-center gap-1.5">
                      {item.item}
                      {item.trend === "up" && <ArrowUp size={13} className="text-sage" />}
                      {item.trend === "down" && <ArrowDown size={13} className="text-clay" />}
                      {item.trend === "stable" && <Minus size={13} className="text-bark-soft" />}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-bark">{item.category}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-espresso">{item.stock.toFixed(2)} {item.unit}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs ${statusStyles[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button 
                      onClick={() => handleReorder(item.id, item.item)}
                      className="text-clay hover:text-clay-dark text-sm transition-colors cursor-pointer bg-transparent border-0 p-0"
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
