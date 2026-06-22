import React, { useState } from "react";
import { Card } from "../components/Card";
import { AlertTriangle, Package, RefreshCw, Plus, ArrowUp, ArrowDown, Minus, RefreshCcw } from "lucide-react";
import { Button as NeonButton } from "../components/ui/neon-button";
import { useCafeStore, InventoryItem } from "../utils/store";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  Good: "bg-sage/12 text-sage border border-sage/15",
  Low: "bg-honey/15 text-honey border border-honey/20",
  Critical: "bg-berry/12 text-berry border border-berry/15",
};

// Cost per unit of each item for dynamic pantry value calculation
const COST_PER_UNIT: Record<string, number> = {
  "INV-001": 750,  // Espresso beans (₹750/kg)
  "INV-002": 70,   // Whole milk (₹70/L)
  "INV-003": 210,  // Almond milk (₹210/L)
  "INV-004": 80,   // Butter croissants (₹80/pc)
  "INV-005": 90,   // Cinnamon rolls (₹90/pc)
  "INV-006": 95,   // Blueberry muffins (₹95/pc)
  "INV-007": 450,  // Vanilla syrup (₹450/bottle)
  "INV-008": 6,    // Takeaway cups (₹6/pc)
};

// Sensible reorder amounts
const REORDER_QUANTITY: Record<string, number> = {
  "INV-001": 10,  // 10 kg
  "INV-002": 15,  // 15 L
  "INV-003": 10,  // 10 L
  "INV-004": 30,  // 30 pcs
  "INV-005": 20,  // 20 pcs
  "INV-006": 20,  // 20 pcs
  "INV-007": 5,   // 5 bottles
  "INV-008": 100, // 100 cups
};

export function Inventory() {
  const { inventory, restockInventory } = useCafeStore();
  const [query, setQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const rows = inventory.filter((r) => r.item.toLowerCase().includes(query.toLowerCase()));

  // Calculate dynamic KPIs
  const lowStockCount = inventory.filter((item) => item.status === "Low" || item.status === "Critical").length;
  
  const totalPantryValue = inventory.reduce((total, item) => {
    const cost = COST_PER_UNIT[item.id] || 0;
    return total + item.stock * cost;
  }, 0);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Inventory register synced with local roastery database.");
    }, 1000);
  };

  const handleReorder = (item: InventoryItem) => {
    const qty = REORDER_QUANTITY[item.id] || 10;
    restockInventory(item.id, qty);
    toast.success(`Purchase order completed: Restocked +${qty} ${item.unit} of ${item.item}.`);
  };

  return (
    <div className="space-y-7 font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft font-semibold">Back of House</p>
          <h1 className="text-3xl mt-1 text-espresso font-display font-medium">The Pantry</h1>
          <p className="text-bark mt-1.5">Manage raw materials, track ingredient levels, and execute instant restock commands.</p>
        </div>
        <div className="flex gap-3">
          <NeonButton 
            variant="outline" 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 cursor-pointer bg-paper border-line hover:bg-sand/30"
          >
            <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} /> 
            {isSyncing ? "Syncing..." : "Sync register"}
          </NeonButton>
          <NeonButton 
            variant="solid"
            onClick={() => toast.info("Select 'Reorder' in the stock register to trigger purchase orders.")}
            className="flex items-center gap-1.5 cursor-pointer shadow-[0_8px_20px_-8px_rgba(184,92,56,0.3)]"
          >
            <Plus size={15} /> Purchase order
          </NeonButton>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-2xl border-line">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-bark text-sm font-medium">Out/Low on Stock</p>
              <h3 className="text-3xl font-mono text-espresso mt-1 font-bold">{lowStockCount}</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${lowStockCount > 0 ? "bg-honey/15 text-honey animate-pulse" : "bg-sand text-bark-soft"}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="mt-4 text-xs text-bark">
            {lowStockCount > 0 
              ? `${lowStockCount} ingredient items require immediate purchasing attention.`
              : "All raw ingredients are stocked within safe limits."}
          </p>
        </Card>

        <Card className="rounded-2xl border-line">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-bark text-sm font-medium">Pantry Value</p>
              <h3 className="text-3xl font-mono text-espresso mt-1 font-bold">₹{Math.round(totalPantryValue).toLocaleString("en-IN")}</h3>
            </div>
            <div className="p-2.5 bg-sage/12 rounded-xl text-sage"><Package size={20} /></div>
          </div>
          <p className="mt-4 text-xs text-bark">
            Calculated dynamically based on real-time unit stock costs.
          </p>
        </Card>

        <Card raised className="relative overflow-hidden rounded-2xl border-line">
          <span className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-clay/8" />
          <p className="text-clay text-xs font-bold uppercase tracking-wider">Roastery Alert</p>
          <h3 className="text-lg text-espresso leading-snug mt-1 font-semibold">Almond Milk Check</h3>
          <p className="mt-3 text-xs text-bark leading-relaxed">
            The Indiranagar pocket reported high plant-milk pulls. Check stock regularly before the weekend rush.
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden rounded-[2rem] border-line shadow-lg bg-paper">
        <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg text-espresso font-semibold">Stock Register</h3>
            <p className="text-xs text-bark-soft mt-0.5">Real-time counts mapped to recipe calculations</p>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="bg-paper-raised border border-line rounded-xl px-4 py-2 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 transition-all"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-bark-soft font-semibold bg-sand/15">
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Item</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">On Hand</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {rows.map((item) => (
                <tr key={item.id} className="hover:bg-sand/25 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-bark-soft">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-espresso">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      {item.item}
                      {item.trend === "up" && <ArrowUp size={13} className="text-sage" />}
                      {item.trend === "down" && <ArrowDown size={13} className="text-clay" />}
                      {item.trend === "stable" && <Minus size={13} className="text-bark-soft" />}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-bark">{item.category}</td>
                  <td className="px-6 py-4 text-sm font-mono text-espresso font-semibold">
                    {item.stock} {item.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider text-[10px] ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleReorder(item)}
                      className="text-clay hover:text-clay-dark text-xs font-semibold transition-all px-3 py-1.5 rounded-lg border border-clay/20 bg-clay/5 hover:bg-clay/10 cursor-pointer focus:outline-none"
                    >
                      Reorder (+{REORDER_QUANTITY[item.id] || 10})
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-bark-soft">
                    No items found matching "{query}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
