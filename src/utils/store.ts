import { create } from 'zustand';
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export type OrderStatus = "Received" | "Preparing" | "Ready" | "Served";
export type OrderType = "Dine-in" | "Takeaway" | "Online";

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  status: OrderStatus;
  type: OrderType;
  time: string;
  total: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  amount: number;
  method: "UPI" | "Card" | "Cash";
  status: "Paid" | "Pending";
  time: string;
  timestamp: number;
  customer: string;
  itemsSummary: string;
}

export interface InventoryItem {
  id: string;
  item: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  status: "Good" | "Low" | "Critical";
  trend: "up" | "down" | "stable";
}

export interface Customer {
  name: string;
  visits: number;
  spent: number;
  tier: "Gold" | "Silver" | "Bronze";
  lastVisit: string;
  loyaltyPoints?: number;
}

export interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface TableCall {
  id: string;
  tableNo: string;
  timestamp: number;
  resolved: boolean;
}

export interface Employee {
  name: string;
  role: string;
  shift: string;
  status: "On shift" | "Upcoming" | "Off shift";
  score: number;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Flat White", category: "Hot drinks", price: 210, image: "https://images.unsplash.com/photo-1615485736894-a2d2e6d4cd9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 2, name: "Cappuccino", category: "Hot drinks", price: 190, image: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 3, name: "Pour Over", category: "Hot drinks", price: 240, image: "https://images.unsplash.com/photo-1522012188892-24beb30278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 4, name: "Cinnamon Roll", category: "Pastries", price: 180, image: "https://images.unsplash.com/photo-1645995575875-ea6511c9d127?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 5, name: "Iced Latte", category: "Cold drinks", price: 230, image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 6, name: "Single-Origin Espresso", category: "Hot drinks", price: 160, image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 7, name: "Caramel Macchiato", category: "Hot drinks", price: 360, image: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 8, name: "Dark Espresso", category: "Hot drinks", price: 180, image: "https://images.unsplash.com/photo-1579992357154-faf4bde95b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 9, name: "Iced Cold Brew", category: "Cold drinks", price: 320, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 10, name: "Butter Croissant", category: "Pastries", price: 220, image: "https://images.unsplash.com/photo-1623334044303-241021148842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" },
  { id: 11, name: "Blueberry Muffin", category: "Pastries", price: 240, image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80" }
];

const RECIPES: Record<string, { itemId: string; qty: number }[]> = {
  "Flat White": [
    { itemId: "INV-001", qty: 0.02 }, // 20g espresso beans
    { itemId: "INV-002", qty: 0.2 },  // 200ml whole milk
  ],
  "Cappuccino": [
    { itemId: "INV-001", qty: 0.02 },
    { itemId: "INV-002", qty: 0.25 },
  ],
  "Pour Over": [
    { itemId: "INV-001", qty: 0.015 },
  ],
  "Cinnamon Roll": [
    { itemId: "INV-005", qty: 1 },
  ],
  "Iced Latte": [
    { itemId: "INV-001", qty: 0.02 },
    { itemId: "INV-002", qty: 0.2 },
  ],
  "Single-Origin Espresso": [
    { itemId: "INV-001", qty: 0.015 },
  ],
  "Caramel Macchiato": [
    { itemId: "INV-001", qty: 0.02 },
    { itemId: "INV-002", qty: 0.2 },
    { itemId: "INV-007", qty: 0.02 }, // 2% of syrup bottle
  ],
  "Dark Espresso": [
    { itemId: "INV-001", qty: 0.015 },
  ],
  "Iced Cold Brew": [
    { itemId: "INV-001", qty: 0.025 },
  ],
  "Butter Croissant": [
    { itemId: "INV-004", qty: 1 },
  ],
  "Blueberry Muffin": [
    { itemId: "INV-006", qty: 1 },
  ],
};

const INITIAL_ORDERS: Order[] = [
  { id: "1042", customer: "Alice M.", items: [{ name: "Caramel Macchiato", qty: 2, price: 360 }, { name: "Butter Croissant", qty: 1, price: 220 }], status: "Received", type: "Dine-in", time: "2m", total: 940, timestamp: Date.now() - 120000 },
  { id: "1043", customer: "Swiggy Rider", items: [{ name: "Dark Espresso", qty: 1, price: 180 }, { name: "Blueberry Muffin", qty: 1, price: 240 }], status: "Received", type: "Online", time: "1m", total: 420, timestamp: Date.now() - 60000 },
  { id: "1040", customer: "John D.", items: [{ name: "Iced Latte", qty: 1, price: 230 }], status: "Preparing", type: "Takeaway", time: "5m", total: 230, timestamp: Date.now() - 300000 },
  { id: "1039", customer: "Table 4", items: [{ name: "Flat White", qty: 2, price: 210 }, { name: "Blueberry Muffin", qty: 2, price: 240 }], status: "Preparing", type: "Dine-in", time: "8m", total: 900, timestamp: Date.now() - 480000 },
  { id: "1038", customer: "Sarah K.", items: [{ name: "Iced Cold Brew", qty: 1, price: 320 }], status: "Ready", type: "Takeaway", time: "12m", total: 320, timestamp: Date.now() - 720000 },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "INV-001", item: "Espresso beans (house blend)", category: "Raw material", stock: 11.45, unit: "kg", minStock: 3.0, status: "Good", trend: "down" },
  { id: "INV-002", item: "Whole milk", category: "Dairy", stock: 3.8, unit: "L", minStock: 2.0, status: "Good", trend: "down" },
  { id: "INV-003", item: "Almond milk", category: "Dairy", stock: 1.5, unit: "L", minStock: 3.0, status: "Critical", trend: "down" },
  { id: "INV-004", item: "Butter croissants", category: "Pastry", stock: 23, unit: "pcs", minStock: 10, status: "Good", trend: "up" },
  { id: "INV-005", item: "Cinnamon rolls", category: "Pastry", stock: 14, unit: "pcs", minStock: 5, status: "Good", trend: "stable" },
  { id: "INV-006", item: "Blueberry muffins", category: "Pastry", stock: 15, unit: "pcs", minStock: 6, status: "Good", trend: "stable" },
  { id: "INV-007", item: "Vanilla syrup", category: "Syrup", stock: 4.88, unit: "bottles", minStock: 2.0, status: "Good", trend: "stable" },
  { id: "INV-008", item: "Takeaway cups (M)", category: "Packaging", stock: 148, unit: "pcs", minStock: 50, status: "Good", trend: "down" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "INV-2406-118", amount: 540, method: "UPI", status: "Paid", time: "10 min ago", timestamp: Date.now() - 600000, customer: "Emma Thompson", itemsSummary: "2x Cappuccino" },
  { id: "INV-2406-117", amount: 220, method: "Card", status: "Paid", time: "45 min ago", timestamp: Date.now() - 2700000, customer: "Sarah Jenkins", itemsSummary: "1x Butter Croissant" },
  { id: "INV-2406-116", amount: 760, method: "Cash", status: "Paid", time: "1 hr ago", timestamp: Date.now() - 3600000, customer: "Michael Chen", itemsSummary: "2x Flat White, 1x Muffin" },
  { id: "INV-2406-115", amount: 1125, method: "Card", status: "Pending", time: "2 hr ago", timestamp: Date.now() - 7200000, customer: "Table 2", itemsSummary: "3x Latte, 2x Cinnamon Roll" },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { name: "Emma Thompson", visits: 42, spent: 18450, tier: "Gold", lastVisit: "2 days ago", loyaltyPoints: 1840 },
  { name: "Michael Chen", visits: 38, spent: 15380, tier: "Gold", lastVisit: "Today", loyaltyPoints: 1530 },
  { name: "Sarah Jenkins", visits: 25, spent: 8210, tier: "Silver", lastVisit: "1 week ago", loyaltyPoints: 820 },
];

const INITIAL_FEEDBACK: Feedback[] = [
  { id: "FB-001", orderId: "1038", customerName: "Sarah Jenkins", rating: 5, comment: "The Indiranagar Cold Brew is extremely smooth! Best in Bengaluru.", timestamp: Date.now() - 3600000 },
  { id: "FB-002", orderId: "1039", customerName: "Michael Chen", rating: 4, comment: "Loved the Flat White. Blueberry Muffin was tasty but a tiny bit crumbly. Staff was super polite!", timestamp: Date.now() - 7200000 },
  { id: "FB-003", orderId: "1040", customerName: "Emma Thompson", rating: 5, comment: "Incredibly fast service, and the custom cardamom profile is amazing. A masterpiece!", timestamp: Date.now() - 10800000 },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { name: "Alex Mercer", role: "Head barista", shift: "08:00 – 16:00", status: "On shift", score: 98 },
  { name: "Jordan Lee", role: "Cashier", shift: "08:00 – 14:00", status: "On shift", score: 92 },
  { name: "Casey Smith", role: "Server", shift: "10:00 – 18:00", status: "On shift", score: 89 },
  { name: "Sam Wilson", role: "Barista", shift: "14:00 – 22:00", status: "Upcoming", score: 95 },
];


export function getStoreData() {
  const getOrInit = <T>(key: string, initial: T): T => {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initial;
    }
  };

  return {
    orders: getOrInit<Order[]>("cafe_orders", INITIAL_ORDERS),
    inventory: getOrInit<InventoryItem[]>("cafe_inventory", INITIAL_INVENTORY),
    transactions: getOrInit<Transaction[]>("cafe_transactions", INITIAL_TRANSACTIONS),
    customers: getOrInit<Customer[]>("cafe_customers", INITIAL_CUSTOMERS),
    employees: getOrInit<Employee[]>("cafe_employees", INITIAL_EMPLOYEES),
    feedbacks: getOrInit<Feedback[]>("cafe_feedbacks", INITIAL_FEEDBACK),
    tableCalls: getOrInit<TableCall[]>("cafe_table_calls", []),
  };
}

export function writeStoreData(data: ReturnType<typeof getStoreData>) {
  localStorage.setItem("cafe_orders", JSON.stringify(data.orders));
  localStorage.setItem("cafe_inventory", JSON.stringify(data.inventory));
  localStorage.setItem("cafe_transactions", JSON.stringify(data.transactions));
  localStorage.setItem("cafe_customers", JSON.stringify(data.customers));
  localStorage.setItem("cafe_employees", JSON.stringify(data.employees));
  localStorage.setItem("cafe_feedbacks", JSON.stringify(data.feedbacks));
  localStorage.setItem("cafe_table_calls", JSON.stringify(data.tableCalls));
  useCafeStoreData.setState(data);
}

// Dispatch Telegram Notification helper
export const sendTelegramNotification = async (
  order: Order,
  modeOrTest: "new" | "status_change" | "test" | boolean = "new",
  oldStatus?: OrderStatus
) => {
  const isTest = modeOrTest === true || modeOrTest === "test";
  const isStatusChange = modeOrTest === "status_change";

  let token = localStorage.getItem("cardamom_tg_token");
  let chatId = localStorage.getItem("cardamom_tg_chat_id");

  // Fallback to reading settings synced in inventory if not set in local storage
  if (!token || !chatId) {
    try {
      const localInv = localStorage.getItem("cafe_inventory");
      if (localInv) {
        const inventory: InventoryItem[] = JSON.parse(localInv);
        const settingsRow = inventory.find((i) => i.id === "settings_telegram");
        if (settingsRow) {
          token = settingsRow.item || token;
          chatId = settingsRow.unit || chatId;
        }
      }
    } catch (e) {
      console.warn("Failed to read telegram settings from inventory cache:", e);
    }
  }

  const emojiMap: Record<string, string> = {
    "Dine-in": "🍽️ Dine-in",
    "Takeaway": "🛍️ Takeaway",
    "Online": "🚚 Delivery",
  };

  const typeLabel = emojiMap[order.type] || order.type;

  let messageText = "";

  if (isTest) {
    messageText = `☕ <b>Cardamom Telegram Test Message</b>\nYour integration settings are configured successfully! 🎉`;
  } else if (isStatusChange) {
    const statusEmoji = order.status === "Preparing" ? "👨‍🍳" : order.status === "Ready" ? "✅" : order.status === "Served" ? "🎉" : "⏳";
    messageText = 
      `🔔 <b>Cardamom Order Update!</b>\n` +
      `───────────────────────\n` +
      `<b>Order ID:</b> #${order.id}\n` +
      `<b>Customer:</b> ${order.customer}\n` +
      `<b>Type:</b> ${typeLabel}\n\n` +
      `🔄 <b>Status:</b> <s>${oldStatus || "Received"}</s> ➔ <b>${order.status}</b>\n` +
      `───────────────────────\n` +
      `${statusEmoji} <i>Status is now ${order.status.toUpperCase()}</i>`;
  } else {
    const itemsText = order.items
      .map((item) => `• ${item.qty}x <b>${item.name}</b> (₹${item.price})`)
      .join("\n");

    messageText = 
      `☕ <b>New Cardamom Order Received!</b>\n` +
      `───────────────────────\n` +
      `<b>Order ID:</b> #${order.id}\n` +
      `<b>Type:</b> ${typeLabel}\n\n` +
      `👤 <b>Customer Name:</b> ${order.customer}\n` +
      `📞 <b>Mobile:</b> ${order.customerPhone || "N/A"}\n` +
      `📍 <b>Delivery/Table:</b> ${order.customerAddress || "N/A"}\n\n` +
      `<b>Items Ordered:</b>\n${itemsText}\n\n` +
      `<b>Total Amount:</b> ₹${order.total} (incl. GST)\n` +
      `───────────────────────\n` +
      `⏳ <b>Status:</b> Received - Awaiting preparation`;
  }

  if (typeof window !== "undefined") {
    const event = new CustomEvent("telegram_notification_simulated", {
      detail: { message: messageText, orderId: order.id }
    });
    window.dispatchEvent(event);
  }

  if (!token || !chatId) {
    console.log("Telegram notification (simulated):\n", messageText);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "HTML",
      }),
    });
    return response.ok;
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
    return false;
  }
};

// Custom hook for unified café state with Supabase sync
const useCafeStoreData = create<ReturnType<typeof getStoreData>>(() => getStoreData());

export function useCafeStore() {
  const data = useCafeStoreData();

  useEffect(() => {
    const handler = () => {
      useCafeStoreData.setState(getStoreData());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Sync state from Supabase once on mount and subscribe to realtime updates
  useEffect(() => {
    if (!supabase) return;

    const syncFromSupabase = async () => {
      try {
        const [ordersRes, invRes, txRes, custRes, empRes] = await Promise.all([
          supabase.from("orders").select("*").order("timestamp", { ascending: false }),
          supabase.from("inventory").select("*"),
          supabase.from("transactions").select("*").order("timestamp", { ascending: false }),
          supabase.from("customers").select("*").order("spent", { ascending: false }),
          supabase.from("employees").select("*")
        ]);

        const store = getStoreData();

        if (ordersRes.data && ordersRes.data.length > 0) {
          store.orders = ordersRes.data as Order[];
        }
        if (invRes.data && invRes.data.length > 0) {
          store.inventory = invRes.data.map((i: any) => ({
            id: i.id,
            item: i.item,
            category: i.category,
            stock: Number(i.stock),
            unit: i.unit,
            minStock: Number(i.min_stock),
            status: i.status as "Good" | "Low" | "Critical",
            trend: i.trend as "up" | "down" | "stable",
          }));
        }
        if (txRes.data && txRes.data.length > 0) {
          store.transactions = txRes.data.map((t: any) => ({
            id: t.id,
            amount: Number(t.amount),
            method: t.method as "UPI" | "Card" | "Cash",
            status: t.status as "Paid" | "Pending",
            time: t.time,
            timestamp: Number(t.timestamp),
            customer: t.customer,
            itemsSummary: t.items_summary,
          }));
        }
        if (custRes.data && custRes.data.length > 0) {
          store.customers = custRes.data.map((c: any) => ({
            name: c.name,
            visits: Number(c.visits),
            spent: Number(c.spent),
            tier: c.tier as "Gold" | "Silver" | "Bronze",
            lastVisit: c.last_visit,
          }));
        }
        if (empRes.data && empRes.data.length > 0) {
          store.employees = empRes.data.map((e: any) => ({
            name: e.name,
            role: e.role,
            shift: e.shift,
            status: e.status as "On shift" | "Upcoming" | "Off shift",
            score: Number(e.score),
          }));
        }

        writeStoreData(store);
      } catch (err) {
        console.warn("Failed to sync initial data from Supabase, table might not exist yet:", err);
      }
    };

    syncFromSupabase();

    // Subscribe to schema changes (Insert, Update, Delete) to enable Realtime
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        syncFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const placeOrder = (
    customer: string,
    items: { item: MenuItem; qty: number }[],
    type: OrderType,
    customerPhone?: string,
    customerAddress?: string
  ) => {
    const store = getStoreData();
    const orderId = (1000 + store.orders.length + Math.floor(Math.random() * 9000)).toString();
    const orderItems: OrderItem[] = items.map((i) => ({
      name: i.item.name,
      qty: i.qty,
      price: i.item.price,
    }));
    const total = items.reduce((sum, i) => sum + i.item.price * i.qty, 0);
    const gstTotal = Math.round(total * 1.05);

    // 1. Create order
    const newOrder: Order = {
      id: orderId,
      customer,
      customerPhone,
      customerAddress,
      items: orderItems,
      status: "Received",
      type,
      time: "Just now",
      total: gstTotal,
      timestamp: Date.now(),
    };

    store.orders = [newOrder, ...store.orders];

    // Trigger Telegram notification
    sendTelegramNotification(newOrder);

    // Push to Supabase if connected
    if (supabase) {
      supabase.from("orders").insert([newOrder]).then(({ error }) => {
        if (error) console.error("Supabase placeOrder error:", error);
      });
    }

    // 2. Deduct inventory
    items.forEach(({ item, qty }) => {
      const recipe = RECIPES[item.name];
      if (recipe) {
        recipe.forEach(({ itemId, qty: recipeQty }) => {
          const invItem = store.inventory.find((i) => i.id === itemId);
          if (invItem) {
            invItem.stock = Math.max(0, parseFloat((invItem.stock - recipeQty * qty).toFixed(3)));
            invItem.status = getInventoryStatus(invItem.stock, invItem.minStock);
            invItem.trend = "down";

            if (supabase) {
              supabase.from("inventory").update({
                stock: invItem.stock,
                status: invItem.status,
                trend: "down"
              }).eq("id", itemId).then(({ error }) => {
                if (error) console.error("Supabase deduct inventory error:", error);
              });
            }
          }
        });
      }
      
      // Deduct takeaway cup for drinks if applicable
      if ((type === "Takeaway" || type === "Online") && item.category.includes("drinks")) {
        const cupItem = store.inventory.find((i) => i.id === "INV-008");
        if (cupItem) {
          cupItem.stock = Math.max(0, cupItem.stock - qty);
          cupItem.status = getInventoryStatus(cupItem.stock, cupItem.minStock);
          cupItem.trend = "down";

          if (supabase) {
            supabase.from("inventory").update({
              stock: cupItem.stock,
              status: cupItem.status,
              trend: "down"
            }).eq("id", "INV-008").then(({ error }) => {
              if (error) console.error("Supabase cup inventory error:", error);
            });
          }
        }
      }
    });

    // 3. Update customer stats if exist
    const cust = store.customers.find((c) => c.name.toLowerCase() === customer.toLowerCase());
    if (cust) {
      cust.visits += 1;
      cust.spent += gstTotal;
      cust.tier = cust.spent > 15000 ? "Gold" : cust.spent > 5000 ? "Silver" : "Bronze";
      cust.lastVisit = "Today";
      cust.loyaltyPoints = (cust.loyaltyPoints || 0) + Math.round(gstTotal * 0.1);

      if (supabase) {
        supabase.from("customers").upsert([{
          name: cust.name,
          visits: cust.visits,
          spent: cust.spent,
          tier: cust.tier,
          last_visit: cust.lastVisit
        }]).then(({ error }) => {
          if (error) console.error("Supabase update customer stats error:", error);
        });
      }
    } else if (customer.trim() !== "" && !customer.includes("Table") && !customer.includes("Rider")) {
      // Create new customer
      const newCustomer: Customer = {
        name: customer,
        visits: 1,
        spent: gstTotal,
        tier: gstTotal > 5000 ? "Silver" : "Bronze",
        lastVisit: "Today",
        loyaltyPoints: Math.round(gstTotal * 0.1),
      };
      store.customers = [...store.customers, newCustomer];

      if (supabase) {
        supabase.from("customers").insert([{
          name: newCustomer.name,
          visits: newCustomer.visits,
          spent: newCustomer.spent,
          tier: newCustomer.tier,
          last_visit: newCustomer.lastVisit
        }]).then(({ error }) => {
          if (error) console.error("Supabase insert new customer error:", error);
        });
      }
    }

    writeStoreData(store);
    return orderId;
  };

  const advanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const store = getStoreData();
    store.orders = store.orders.map((o) => {
      if (o.id === orderId) {
        const updated = { ...o, status: nextStatus };
        
        if (supabase) {
          supabase.from("orders").update({ status: nextStatus }).eq("id", orderId).then(({ error }) => {
            if (error) console.error("Supabase advanceOrderStatus error:", error);
          });
        }

        // Trigger Telegram status update notification
        sendTelegramNotification(updated, "status_change", o.status);

        // If advanced to Served, automatically generate a transaction!
        if (nextStatus === "Served") {
          const txId = `INV-${new Date().getFullYear().toString().substring(2)}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${100 + store.transactions.length}`;
          const itemsSummary = o.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
          const newTx: Transaction = {
            id: txId,
            amount: o.total,
            method: o.type === "Online" ? "UPI" : Math.random() > 0.5 ? "Card" : "Cash",
            status: "Paid",
            time: "Just now",
            timestamp: Date.now(),
            customer: o.customer,
            itemsSummary,
          };
          store.transactions = [newTx, ...store.transactions];

          if (supabase) {
            supabase.from("transactions").insert([{
              id: newTx.id,
              amount: newTx.amount,
              method: newTx.method,
              status: newTx.status,
              time: newTx.time,
              timestamp: newTx.timestamp,
              customer: newTx.customer,
              items_summary: newTx.itemsSummary
            }]).then(({ error }) => {
              if (error) console.error("Supabase insert transaction error:", error);
            });
          }
        }
        return updated;
      }
      return o;
    });
    writeStoreData(store);
  };

  const cancelOrder = (orderId: string) => {
    const store = getStoreData();
    store.orders = store.orders.filter((o) => o.id !== orderId);
    
    if (supabase) {
      supabase.from("orders").delete().eq("id", orderId).then(({ error }) => {
        if (error) console.error("Supabase cancelOrder error:", error);
      });
    }

    writeStoreData(store);
  };

  const restockInventory = (itemId: string, qty: number) => {
    const store = getStoreData();
    store.inventory = store.inventory.map((item) => {
      if (item.id === itemId) {
        const newStock = parseFloat((item.stock + qty).toFixed(2));
        const updatedStatus = getInventoryStatus(newStock, item.minStock);

        if (supabase) {
          supabase.from("inventory").update({
            stock: newStock,
            status: updatedStatus,
            trend: "up"
          }).eq("id", itemId).then(({ error }) => {
            if (error) console.error("Supabase restockInventory error:", error);
          });
        }

        return {
          ...item,
          stock: newStock,
          status: updatedStatus,
          trend: "up" as const,
        };
      }
      return item;
    });
    writeStoreData(store);
  };

  const addManualInvoice = (customer: string, amount: number, method: "UPI" | "Card" | "Cash") => {
    const store = getStoreData();
    const txId = `INV-${new Date().getFullYear().toString().substring(2)}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${100 + store.transactions.length}`;
    const newTx: Transaction = {
      id: txId,
      amount,
      method,
      status: "Paid",
      time: "Just now",
      timestamp: Date.now(),
      customer: customer || "Walk-in Guest",
      itemsSummary: "Counter order",
    };
    store.transactions = [newTx, ...store.transactions];

    if (supabase) {
      supabase.from("transactions").insert([{
        id: newTx.id,
        amount: newTx.amount,
        method: newTx.method,
        status: newTx.status,
        time: newTx.time,
        timestamp: newTx.timestamp,
        customer: newTx.customer,
        items_summary: newTx.itemsSummary
      }]).then(({ error }) => {
        if (error) console.error("Supabase addManualInvoice error:", error);
      });
    }
    
    // Also increment customer metrics
    if (customer && customer.trim() !== "") {
      const cust = store.customers.find((c) => c.name.toLowerCase() === customer.toLowerCase());
      if (cust) {
        cust.visits += 1;
        cust.spent += amount;
        cust.tier = cust.spent > 15000 ? "Gold" : cust.spent > 5000 ? "Silver" : "Bronze";
        cust.lastVisit = "Today";

        if (supabase) {
          supabase.from("customers").upsert([{
            name: cust.name,
            visits: cust.visits,
            spent: cust.spent,
            tier: cust.tier,
            last_visit: cust.lastVisit
          }]).then(({ error }) => {
            if (error) console.error("Supabase upsert customer invoice error:", error);
          });
        }
      } else {
        const newCustomer: Customer = {
          name: customer,
          visits: 1,
          spent: amount,
          tier: amount > 5000 ? "Silver" : "Bronze",
          lastVisit: "Today",
        };
        store.customers = [...store.customers, newCustomer];

        if (supabase) {
          supabase.from("customers").insert([{
            name: newCustomer.name,
            visits: newCustomer.visits,
            spent: newCustomer.spent,
            tier: newCustomer.tier,
            last_visit: newCustomer.lastVisit
          }]).then(({ error }) => {
            if (error) console.error("Supabase insert customer invoice error:", error);
          });
        }
      }
    }
    
    writeStoreData(store);
    return txId;
  };

  const toggleEmployeeShift = (name: string) => {
    const store = getStoreData();
    store.employees = store.employees.map((emp) => {
      if (emp.name === name) {
        const nextStatus = emp.status === "On shift" ? "Off shift" : "On shift";

        if (supabase) {
          supabase.from("employees").update({
            status: nextStatus
          }).eq("name", name).then(({ error }) => {
            if (error) console.error("Supabase toggleEmployeeShift error:", error);
          });
        }

        return { ...emp, status: nextStatus as "On shift" | "Off shift" };
      }
      return emp;
    });
    writeStoreData(store);
  };

  const isItemAvailable = (itemName: string): boolean => {
    const recipe = RECIPES[itemName];
    if (!recipe) return true;
    return recipe.every(({ itemId, qty }) => {
      const invItem = data.inventory.find((i) => i.id === itemId);
      return invItem ? invItem.stock >= qty : true;
    });
  };

  const addCustomerFeedback = (orderId: string, customerName: string, rating: number, comment: string) => {
    const store = getStoreData();
    const newFeedback: Feedback = {
      id: `FB-${100 + store.feedbacks.length + Math.floor(Math.random() * 900)}`,
      orderId,
      customerName: customerName || "Guest Explorer",
      rating,
      comment,
      timestamp: Date.now()
    };
    store.feedbacks = [newFeedback, ...store.feedbacks];

    // Award feedback points (+50 loyalty points)
    const cust = store.customers.find((c) => c.name.toLowerCase() === customerName.toLowerCase());
    if (cust) {
      cust.loyaltyPoints = (cust.loyaltyPoints || 0) + 50;
    }

    writeStoreData(store);
  };

  const callWaiter = (tableNo: string) => {
    const store = getStoreData();
    // Resolve any active call for this table first
    store.tableCalls = store.tableCalls.filter(c => c.tableNo !== tableNo);
    const newCall: TableCall = {
      id: `TC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tableNo,
      timestamp: Date.now(),
      resolved: false
    };
    store.tableCalls = [newCall, ...store.tableCalls];
    writeStoreData(store);
  };

  const resolveTableCall = (callId: string) => {
    const store = getStoreData();
    store.tableCalls = store.tableCalls.map(c => c.id === callId ? { ...c, resolved: true } : c);
    // clean up resolved calls immediately from current list
    store.tableCalls = store.tableCalls.filter(c => !c.resolved);
    writeStoreData(store);
  };

  return {
    ...data,
    placeOrder,
    advanceOrderStatus,
    cancelOrder,
    restockInventory,
    addManualInvoice,
    toggleEmployeeShift,
    isItemAvailable,
    addCustomerFeedback,
    callWaiter,
    resolveTableCall,
  };
}

function getInventoryStatus(stock: number, minStock: number): "Good" | "Low" | "Critical" {
  if (stock <= minStock * 0.5) return "Critical";
  if (stock <= minStock) return "Low";
  return "Good";
}
