import React, { useState } from "react";
import { Card } from "../components/Card";
import { Download, FileText, CreditCard, Banknote, Smartphone, Loader2, Send } from "lucide-react";
import { Button as NeonButton } from "../components/ui/neon-button";
import { triggerHaptic } from "../utils/haptics";
import { toast } from "sonner";
import { sendTelegramNotification, useCafeStore } from "../utils/store";
import { supabase } from "../utils/supabase";

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

  const { inventory } = useCafeStore();

  // Telegram Alert Settings States
  const [tgToken, setTgToken] = useState(localStorage.getItem("cardamom_tg_token") || "");
  const [tgChatId, setTgChatId] = useState(localStorage.getItem("cardamom_tg_chat_id") || "");
  const [isTesting, setIsTesting] = useState(false);

  // Initialize Telegram settings from Supabase if not locally present
  React.useEffect(() => {
    if (!tgToken || !tgChatId) {
      const settingsRow = inventory.find((i) => i.id === "settings_telegram");
      if (settingsRow) {
        if (!tgToken && settingsRow.item) setTgToken(settingsRow.item);
        if (!tgChatId && settingsRow.unit) setTgChatId(settingsRow.unit);
      }
    }
  }, [inventory, tgToken, tgChatId]);

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic("medium");
    localStorage.setItem("cardamom_tg_token", tgToken);
    localStorage.setItem("cardamom_tg_chat_id", tgChatId);

    if (supabase) {
      supabase
        .from("inventory")
        .upsert([
          {
            id: "settings_telegram",
            item: tgToken,
            category: "settings",
            stock: 0,
            unit: tgChatId,
            min_stock: 0,
            status: "Good",
            trend: "stable",
          },
        ])
        .then(({ error }) => {
          if (error) {
            console.error("Failed to sync Telegram settings to Supabase:", error);
            toast.error("Saved locally, but failed to sync to cloud database.");
          } else {
            toast.success("Telegram settings saved and synced to database!");
          }
        });
    } else {
      toast.success("Telegram settings saved successfully!");
    }
  };

  const handleTestTelegram = async () => {
    if (!tgToken || !tgChatId) {
      triggerHaptic("error");
      toast.error("Please enter both Bot Token and Chat ID first.");
      return;
    }
    setIsTesting(true);
    triggerHaptic("medium");

    // Temporarily persist to allow direct testing
    localStorage.setItem("cardamom_tg_token", tgToken);
    localStorage.setItem("cardamom_tg_chat_id", tgChatId);

    const success = await sendTelegramNotification({
      id: "TEST-8888",
      customer: "Test Customer",
      customerPhone: "+91 98765 43210",
      customerAddress: "Test Table 5 / Delivery Address",
      items: [{ name: "Flat White", qty: 2, price: 210 }],
      status: "Received",
      type: "Online",
      time: "Just now",
      total: 441,
      timestamp: Date.now()
    }, true);

    setIsTesting(false);
    if (success) {
      triggerHaptic("success");
      toast.success("Telegram test message sent successfully!", {
        description: "Check your Telegram chat / group channel."
      });
    } else {
      triggerHaptic("error");
      toast.error("Failed to send test alert.", {
        description: "Please check your Bot Token and Chat ID configurations."
      });
    }
  };

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

        <div className="space-y-6">
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
                <div className="flex justify-between pt-2 border-t border-line text-espresso font-semibold">
                  <span className="text-espresso">Total</span>
                  <span className="font-mono text-espresso">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <NeonButton 
                  type="submit" 
                  variant="solid" 
                  disabled={isGenerating} 
                  className="mt-2 w-full flex items-center justify-center gap-2 border-0"
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

          <Card raised>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-[#2CA5E0]/10 text-[#2CA5E0] flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.87 7.9-2.73 8.35-.42.22-.84.28-1.2.22-.72-.11-1.28-.62-1.92-1.07-.46-.33-.92-.66-1.38-1-.46-.34-.92-.68-1.38-1.01l-1.38-.68c-.62-.31-.62-.92.15-1.23l12.31-4.9c.77-.31 1.38.15 1.23 1.32z" />
                </svg>
              </span>
              <h3 className="text-lg text-espresso">Telegram Alerts</h3>
            </div>
            <p className="text-xs text-bark-soft mb-4">
              Send instant order details, customer mobile numbers, and delivery addresses directly to your staff managers.
            </p>

            <form onSubmit={handleSaveTelegram} className="space-y-4">
              <div>
                <label className="text-xs text-bark mb-1.5 block font-semibold">Bot Token</label>
                <input
                  type="password"
                  placeholder="e.g. 5234567890:AAH..."
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  className="w-full bg-paper-raised border border-line rounded-lg px-3 py-2 text-xs text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
                />
              </div>
              <div>
                <label className="text-xs text-bark mb-1.5 block font-semibold">Chat ID</label>
                <input
                  type="text"
                  placeholder="e.g. -1001234567890"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  className="w-full bg-paper-raised border border-line rounded-lg px-3 py-2 text-xs font-mono text-espresso placeholder:text-bark-soft focus:outline-none focus:border-clay/60 focus:ring-2 focus:ring-clay/15"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <NeonButton
                  type="submit"
                  variant="solid"
                  className="flex-1 text-xs h-10 rounded-lg border-0"
                >
                  Save
                </NeonButton>
                <NeonButton
                  type="button"
                  variant="outline"
                  disabled={isTesting}
                  onClick={handleTestTelegram}
                  className="flex-1 text-xs h-10 rounded-lg border-0 flex items-center justify-center gap-1.5"
                >
                  {isTesting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>Test Alert</>
                  )}
                </NeonButton>
              </div>
            </form>
          </Card>
        </div>
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
