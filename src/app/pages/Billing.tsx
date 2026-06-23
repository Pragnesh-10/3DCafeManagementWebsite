import React, { useState } from "react";
import { Card } from "../components/Card";
import { Download, FileText, CreditCard, Banknote, Smartphone, Loader2 } from "lucide-react";
import { Button as NeonButton } from "../components/ui/neon-button";
import { triggerHaptic } from "../utils/haptics";
import { toast } from "sonner";

const TRANSACTIONS = [
  { id: "INV-2406-118", amount: 540, method: "UPI", status: "Paid", time: "10 min ago" },
  { id: "INV-2406-117", amount: 220, method: "Card", status: "Paid", time: "45 min ago" },
  { id: "INV-2406-116", amount: 760, method: "Cash", status: "Paid", time: "1 hr ago" },
  { id: "INV-2406-115", amount: 1125, method: "Card", status: "Pending", time: "2 hr ago" },
] as const;

function MethodIcon({ method }: { method: string }) {
  if (method === "Cash") return <Banknote size={17} />;
  if (method === "UPI") return <Smartphone size={17} />;
  return <CreditCard size={17} />;
}

export function Billing() {
  const [subtotal, setSubtotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const gst = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const handleExport = () => {
    triggerHaptic("medium");
    toast.success("Transactions exported as CSV successfully!");
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtotal || subtotal <= 0) {
      triggerHaptic("error");
      toast.error("Please enter a valid amount first");
      return;
    }
    
    setIsGenerating(true);
    triggerHaptic("medium");
    
    setTimeout(() => {
      setIsGenerating(false);
      triggerHaptic("success");
      toast.success(`Invoice generated for ${customerName || "Table"} · ₹${total.toLocaleString("en-IN")}`, {
        description: "Sent directly to Cardamom thermal printer",
      });
      // Reset form
      setSubtotal(0);
      setCustomerName("");
      const formEl = document.getElementById("invoice-form") as HTMLFormElement;
      if (formEl) formEl.reset();
    }, 1500);
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft">Counter</p>
          <h1 className="text-3xl mt-1 text-espresso">Billing &amp; payments</h1>
          <p className="text-bark mt-1.5">UPI, card and cash — every invoice GST-stamped.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-line">
            <h3 className="text-lg text-espresso">Recent transactions</h3>
            <button 
              onClick={handleExport}
              className="text-sm text-clay hover:text-clay-dark flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={15} /> Export
            </button>
          </div>
          <div className="divide-y divide-line/60 overflow-y-auto max-h-[400px] custom-scrollbar">
            {TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-sand/40 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-bark">
                    <MethodIcon method={tx.method} />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-espresso">{tx.id}</p>
                    <p className="text-xs text-bark-soft">{tx.time} · {tx.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-espresso">₹{tx.amount.toLocaleString("en-IN")}</p>
                  <p className={`text-xs ${tx.status === "Paid" ? "text-sage" : "text-honey"}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card raised>
          <h3 className="text-lg text-espresso mb-4">Quick invoice</h3>
          <form id="invoice-form" onSubmit={handleGenerateInvoice} className="space-y-4">
            <div>
              <label className="text-xs text-bark mb-1.5 block">Customer / table</label>
              <input 
                type="text" 
                placeholder="e.g. Table 4" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-paper-raised border border-line rounded-lg px-3 py-2 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15" 
              />
            </div>
            <div>
              <label className="text-xs text-bark mb-1.5 block">Amount (₹)</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={subtotal || ""}
                onChange={(e) => setSubtotal(Number(e.target.value) || 0)}
                className="w-full bg-paper-raised border border-line rounded-lg px-3 py-2 text-sm font-mono text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
              />
            </div>
            <div className="pt-3 border-t border-line space-y-2">
              <Row label="Subtotal" value={subtotal} />
              <Row label="GST (5%)" value={gst} />
              <div className="flex justify-between pt-2 border-t border-line">
                <span className="text-espresso">Total</span>
                <span className="font-mono text-espresso">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <NeonButton 
                type="submit" 
                variant="solid" 
                disabled={isGenerating} 
                className="mt-2 w-full flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Printing...
                  </>
                ) : (
                  <>
                    <FileText size={16} /> Generate invoice
                  </>
                )}
              </NeonButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm text-bark">
      <span>{label}</span>
      <span className="font-mono">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
