import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, User, ShieldCheck, Mail, Lock, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/neon-button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "customer" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (role === "admin") {
      // Mock admin credentials
      if (email === "admin@cardamom.com" && password === "admin123") {
        sessionStorage.setItem("user_role", "admin");
        sessionStorage.setItem("user_name", "Priya Nair");
        toast.success("Welcome back, Priya!");
        navigate("/admin");
      } else {
        toast.error("Invalid admin credentials. Use admin@cardamom.com / admin123");
      }
    } else {
      // Mock customer credentials
      if (email === "hello@guest.com" && password === "guest123") {
        sessionStorage.setItem("user_role", "customer");
        sessionStorage.setItem("user_name", "Guest Explorer");
        toast.success("Welcome to Cardamom!");
        navigate("/order");
      } else {
        toast.error("Invalid credentials. Use hello@guest.com / guest123");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 selection:bg-clay/20">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-bark-soft hover:text-espresso transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm uppercase tracking-widest">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-paper border border-line p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(44,33,24,0.15)]"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-espresso text-cream flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="12" rx="7.5" ry="10" transform="rotate(35 12 12)" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 5C12 9 12 15 16 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl text-espresso mb-2">Welcome Back</h1>
          <p className="text-bark text-sm">Choose your portal to continue</p>
        </div>

        <AnimatePresence mode="wait">
          {!role ? (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid gap-4"
            >
              <button
                onClick={() => setRole("customer")}
                className="group flex items-center gap-5 p-5 bg-sand/30 border border-line rounded-2xl hover:border-clay/50 hover:bg-sand/50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-paper flex items-center justify-center text-clay group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-espresso font-semibold">Customer Portal</h3>
                  <p className="text-xs text-bark-soft">Order your favourite brew &amp; earn beans</p>
                  <p className="text-[10px] font-mono text-bark-soft/60 mt-1">hello@guest.com · guest123</p>
                </div>
                <ArrowRight className="ml-auto text-bark-soft group-hover:text-clay transition-colors" size={20} />
              </button>

              <button
                onClick={() => setRole("admin")}
                className="group flex items-center gap-5 p-5 bg-sand/30 border border-line rounded-2xl hover:border-clay/50 hover:bg-sand/50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-paper flex items-center justify-center text-espresso group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-espresso font-semibold">Staff Dashboard</h3>
                  <p className="text-xs text-bark-soft">Manage roastery, orders, and team</p>
                  <p className="text-[10px] font-mono text-bark-soft/60 mt-1">admin@cardamom.com · admin123</p>
                </div>
                <ArrowRight className="ml-auto text-bark-soft group-hover:text-espresso transition-colors" size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-xs text-bark-soft hover:text-espresso underline underline-offset-4"
                >
                  Change role
                </button>
                <span className="text-xs text-line">|</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-clay">
                  {role === "admin" ? "Staff" : "Guest"}
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-soft" size={16} />
                  <Input
                    id="email"
                    type="email"
                    placeholder={role === "admin" ? "admin@cardamom.com" : "hello@guest.com"}
                    required
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-bark-soft hover:text-clay">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-soft" size={16} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `Sign in as ${role === "admin" ? "Manager" : "Customer"}`
                )}
              </Button>

              <div className="text-center pt-4 border-t border-line/60">
                <p className="text-xs text-bark-soft">
                  Don't have an account? <button type="button" className="text-clay hover:underline font-semibold">Join the Bean Club</button>
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 text-center text-[10px] uppercase tracking-[0.3em] text-bark-soft font-medium">
        Cardamom Roastery Systems · v2.4.0
      </div>
    </div>
  );
}
