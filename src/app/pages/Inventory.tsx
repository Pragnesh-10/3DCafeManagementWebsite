import React, { useState } from "react";
import { Card } from "../components/Card";
import { AlertTriangle, Package, RefreshCw, Plus, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Button as NeonButton } from "../components/ui/neon-button";

const INVENTORY = [
  { id: "INV-001", item: "Espresso beans (house blend)", category: "Raw material", stock: "12 kg", status: "Good", trend: "down" },
  { id: "INV-002", item: "Whole milk", category: "Dairy", stock: "4 L", status: "Low", trend: "down" },
  { id: "INV-003", item: "Almond milk", category: "Dairy", stock: "2 L", status: "Critical", trend: "down" },
  { id: "INV-004", item: "Butter croissants", category: "Pastry", stock: "24 pcs", status: "Good", trend: "up" },
  { id: "INV-005", item: "Vanilla syrup", category: "Syrup", stock: "5 bottles", status: "Good", trend: "stable" },
  { id: "INV-006", item: "Takeaway cups (M)", category: "Packaging", stock: "150 pcs", status: "Good", trend: "down" },
] as const;

const statusStyles: Record<string, string> = {
  Good: "bg-sage/12 text-sage",
  Low: "bg-honey/15 text-honey",
  Critical: "bg-berry/12 text-berry",
};

export function Inventory() {
  const [query, setQuery] = useState("");
  const rows = INVENTORY.filter((r) => r.item.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft">Back of house</p>
          <h1 className="text-3xl mt-1 text-espresso">The pantry</h1>
          <p className="text-bark mt-1.5">What's on the shelf, and what needs reordering.</p>
        </div>
        <div className="flex gap-3">
          <NeonButton variant="ghost">
            <RefreshCw size={15} /> Sync
          </NeonButton>
          <NeonButton variant="solid">
            <Plus size={15} /> Purchase order
          </NeonButton>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-bark text-sm">Low on stock</p>
              <h3 className="text-3xl font-mono text-espresso mt-1">4</h3>
            </div>
            <div className="p-2.5 bg-honey/15 rounded-lg text-honey"><AlertTriangle size={20} /></div>
          </div>
          <p className="mt-4 text-sm text-bark">Two items already queued for auto-reorder.</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-bark text-sm">Pantry value</p>
              <h3 className="text-3xl font-mono text-espresso mt-1">₹2,02,450</h3>
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
                  <td className="px-5 py-3.5 text-sm font-mono text-espresso">{item.stock}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs ${statusStyles[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-clay hover:text-clay-dark text-sm transition-colors">Reorder</button>
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
