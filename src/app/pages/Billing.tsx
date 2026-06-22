import React, { useState } from "react";
import { Card } from "../components/Card";
import { Download, FileText, CreditCard, Banknote, Smartphone, Receipt, PlusCircle, Trash2 } from "lucide-react";
import { Button as NeonButton } from "../components/ui/neon-button";
import { useCafeStore } from "../utils/store";
import { toast } from "sonner";

function MethodIcon({ method }: { method: string }) {
  if (method === "Cash") return <Banknote size={17} />;
  if (method === "UPI") return <Smartphone size={17} />;
  return <CreditCard size={17} />;
}

export function Billing() {
  const { transactions, addManualInvoice } = useCafeStore();
  const [subtotal, setSubtotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "Cash">("UPI");

  const gst = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (subtotal <= 0) {
      toast.error("Please enter a valid amount to generate an invoice.");
      return;
    }

    const txId = addManualInvoice(customerName.trim(), total, paymentMethod);
    toast.success(`Invoice ${txId} generated & payment recorded!`);
    
    // Reset form
    setSubtotal(0);
    setCustomerName("");
    // Also reset numeric inputs
    const input = document.getElementById("invoice-amount") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }
    const headers = "Invoice ID,Customer,Amount (₹),Method,Status,Timestamp\n";
    const rows = transactions
      .map(
        (tx) =>
          `"${tx.id}","${tx.customer.replace(/"/g, '""')}",${tx.amount},"${tx.method}","${tx.status}","${new Date(tx.timestamp).toLocaleString()}"`
      )
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cardamom_billing_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transaction history exported as CSV!");
  };

  return (
    <div className="space-y-7 font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bark-soft font-semibold">Counter & Finance</p>
          <h1 className="text-3xl mt-1 text-espresso font-display font-medium">Billing & Payments</h1>
          <p className="text-bark mt-1.5">UPI, Card, and Cash registers — dynamically connected to order fulfillment.</p>
        </div>
        <div className="flex gap-3">
          <NeonButton 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center gap-1.5 cursor-pointer bg-paper hover:bg-sand/30 border-line"
          >
            <Download size={15} /> Export History
          </NeonButton>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Transactions Card */}
        <Card className="lg:col-span-2 p-0 overflow-hidden rounded-[2rem] border-line shadow-lg bg-paper">
          <div className="flex items-center justify-between p-5 border-b border-line">
            <div>
              <h3 className="text-lg text-espresso font-semibold flex items-center gap-2">
                <Receipt size={18} className="text-clay" /> Recent Transactions
              </h3>
              <p className="text-xs text-bark-soft mt-0.5">Live transaction log across front of house & mobile orders</p>
            </div>
            <span className="text-xs bg-sand text-espresso font-mono font-bold px-2.5 py-1 rounded-full border border-line">
              {transactions.length} invoices
            </span>
          </div>
          
          <div className="divide-y divide-line/60 overflow-y-auto max-h-[500px] custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="py-20 text-center text-bark-soft">
                <p className="text-sm">No transactions recorded yet.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4.5 hover:bg-sand/25 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-espresso shadow-xs">
                      <MethodIcon method={tx.method} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-espresso font-bold">{tx.id}</p>
                        <span className="text-[10px] bg-sand px-1.5 py-0.2 rounded border border-line/60 text-bark font-medium">
                          {tx.method}
                        </span>
                      </div>
                      <p className="text-xs text-bark-soft mt-1">
                        {tx.time} · <span className="font-medium text-bark">{tx.customer}</span>
                      </p>
                      {tx.itemsSummary && (
                        <p className="text-[10px] text-bark-soft italic truncate max-w-xs sm:max-w-md mt-0.5">
                          {tx.itemsSummary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-espresso text-base">₹{tx.amount.toLocaleString("en-IN")}</p>
                    <p className={`text-xs font-semibold mt-1 ${tx.status === "Paid" ? "text-sage" : "text-honey animate-pulse"}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Invoice Card */}
        <Card raised className="rounded-[2rem] border-line shadow-lg p-6 bg-paper-raised">
          <h3 className="text-lg text-espresso font-semibold mb-1.5 flex items-center gap-2">
            <PlusCircle size={18} className="text-clay" /> Quick Invoice
          </h3>
          <p className="text-xs text-bark-soft mb-5">Ring up counter sales directly to feed analytics</p>
          
          <form onSubmit={handleGenerateInvoice} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-bark block mb-1.5">Customer / Table Identifier</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Table 4 or Emma Thompson" 
                className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-sm text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 transition-all"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-bark block mb-1.5">Payment Method</label>
              <div className="flex bg-sand/30 border border-line/80 rounded-xl p-0.5 text-xs font-medium">
                {(["UPI", "Card", "Cash"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-center transition-all cursor-pointer",
                      paymentMethod === method ? "bg-espresso text-cream shadow-xs" : "text-bark hover:text-espresso"
                    )}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-bark block mb-1.5">Amount (₹)</label>
              <input
                id="invoice-amount"
                type="number"
                min={0}
                placeholder="0"
                onChange={(e) => setSubtotal(Number(e.target.value) || 0)}
                className="w-full bg-paper border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15 transition-all"
              />
            </div>

            <div className="pt-4 border-t border-line/70 space-y-3">
              <Row label="Subtotal" value={subtotal} />
              <Row label="GST (5%)" value={gst} />
              <div className="flex justify-between pt-2 border-t border-line/70 items-end">
                <span className="text-espresso font-semibold text-sm">Total Amount</span>
                <span className="font-mono text-clay font-bold text-lg">₹{total.toLocaleString("en-IN")}</span>
              </div>
              
              <NeonButton 
                type="submit" 
                variant="solid" 
                className="mt-3 w-full h-11 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-[0_8px_20px_-8px_rgba(184,92,56,0.3)] cursor-pointer"
              >
                <FileText size={15} /> Generate Invoice
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
    <div className="flex justify-between text-xs text-bark font-medium">
      <span>{label}</span>
      <span className="font-mono text-espresso">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
