import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, User, ShieldCheck, Mail, Lock, Loader2, UserPlus, ChefHat } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/neon-button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { supabase } from "../utils/supabase";
import { triggerHaptic } from "../utils/haptics";

export function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "customer" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    triggerHaptic("medium");

    if (isSignUp) {
      // 1. Sign Up Flow
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || "Guest Explorer",
              role: role || "customer"
            }
          }
        });

        if (error) {
          triggerHaptic("error");
          toast.error(error.message);
        } else if (data?.user) {
          triggerHaptic("success");
          toast.success("Successfully registered! Please log in.");
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        triggerHaptic("success");
        toast.info("Offline mode: Account registration simulated.");
        setIsSignUp(false);
        setPassword("");
      }
    } else {
      // 2. Sign In Flow
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          triggerHaptic("error");
          toast.error(error.message);
        } else if (data?.user) {
          const userRole = data.user.user_metadata?.role || (email.includes("admin") ? "admin" : "customer");
          const userName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User";
          
          sessionStorage.setItem("user_role", userRole === "admin" ? "staff_manager" : userRole);
          sessionStorage.setItem("user_name", userName);
          triggerHaptic("success");
          toast.success(`Welcome back, ${userName}!`);
          
          if (userRole === "admin" || userRole === "staff_manager") {
            navigate("/manager");
          } else {
            navigate("/order");
          }
        }
      } else {
        // Offline / Mock Mode: Dynamically authenticate any credentials to facilitate clean local testing
        const nameFromEmail = email.split("@")[0];
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        
        sessionStorage.setItem("user_role", role === "admin" ? "staff_manager" : role);
        sessionStorage.setItem("user_name", role === "admin" ? formattedName || "Store Manager" : formattedName || "Guest Explorer");
        triggerHaptic("success");
        toast.info("Running in offline / mock mode.");
        toast.success(`Logged in as ${role === "admin" ? "Staff Manager" : "Customer"}!`);
        
        if (role === "admin") {
          navigate("/manager");
        } else {
          navigate("/order");
        }
      }
    }
    setIsLoading(false);
  };

  const handleRoleSelection = (selectedRole: "admin" | "customer") => {
    triggerHaptic("medium");
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 selection:bg-clay/20">
      <Link 
        to="/" 
        onClick={() => triggerHaptic("light")}
        className="absolute top-8 left-8 flex items-center gap-2 text-bark-soft hover:text-espresso transition-colors"
      >
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
          <h1 className="text-3xl text-espresso mb-2">
            {isSignUp ? "Join the Club" : "Welcome Back"}
          </h1>
          <p className="text-bark text-sm">
            {isSignUp ? "Create your Cardamom account" : "Choose your portal to continue"}
          </p>
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
                onClick={() => handleRoleSelection("customer")}
                className="group flex items-center gap-5 p-5 bg-sand/30 border border-line rounded-2xl hover:border-clay/50 hover:bg-sand/50 transition-all text-left cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-paper flex items-center justify-center text-clay group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-espresso font-semibold">Customer Portal</h3>
                  <p className="text-xs text-bark-soft">Order your favourite brew &amp; earn beans</p>
                </div>
                <ArrowRight className="ml-auto text-bark-soft group-hover:text-clay transition-colors" size={20} />
              </button>

              <button
                onClick={() => handleRoleSelection("admin")}
                className="group flex items-center gap-5 p-5 bg-sand/30 border border-line rounded-2xl hover:border-clay/50 hover:bg-sand/50 transition-all text-left cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-paper flex items-center justify-center text-espresso group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-espresso font-semibold">Staff Dashboard</h3>
                  <p className="text-xs text-bark-soft">Manage roastery, orders, and team</p>
                </div>
                <ArrowRight className="ml-auto text-bark-soft group-hover:text-espresso transition-colors" size={20} />
              </button>

              <button
                onClick={() => {
                  triggerHaptic("medium");
                  navigate("/chef");
                }}
                className="group flex items-center gap-5 p-5 bg-sand/30 border border-line rounded-2xl hover:border-clay/50 hover:bg-sand/50 transition-all text-left cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-paper flex items-center justify-center text-clay group-hover:scale-110 transition-transform">
                  <ChefHat size={24} />
                </div>
                <div>
                  <h3 className="text-espresso font-semibold">Kitchen &amp; Floor Board</h3>
                  <p className="text-xs text-bark-soft">Chef's KDS &amp; Waiter Table Floor View</p>
                </div>
                <ArrowRight className="ml-auto text-bark-soft group-hover:text-clay transition-colors" size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleAuth}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setRole(null);
                    setIsSignUp(false);
                  }}
                  className="text-xs text-bark-soft hover:text-espresso underline underline-offset-4 cursor-pointer"
                >
                  Change role
                </button>
                <span className="text-xs text-line">|</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-clay">
                  {role === "admin" ? "Staff" : "Customer"}
                </span>
                {role !== "admin" && (
                  <>
                    <span className="text-xs text-line">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("light");
                        setIsSignUp(!isSignUp);
                      }}
                      className="text-xs text-clay hover:text-espresso font-semibold cursor-pointer"
                    >
                      {isSignUp ? "Switch to Login" : "Switch to Register"}
                    </button>
                  </>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-soft" size={16} />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Jane Doe"
                      required
                      className="pl-10"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-soft" size={16} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. name@domain.com"
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
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => triggerHaptic("light")}
                      className="text-xs text-bark-soft hover:text-clay cursor-pointer bg-transparent border-0 p-0"
                    >
                      Forgot?
                    </button>
                  )}
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

              <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base cursor-pointer">
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  isSignUp
                    ? `Sign up as ${role === "admin" ? "Manager" : "Customer"}`
                    : `Sign in as ${role === "admin" ? "Manager" : "Customer"}`
                )}
              </Button>

              <div className="text-center pt-4 border-t border-line/60">
                <p className="text-xs text-bark-soft">
                  {isSignUp ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => { triggerHaptic("light"); setIsSignUp(false); }}
                        className="text-clay hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    role !== "admin" && (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => { triggerHaptic("light"); setIsSignUp(true); }}
                          className="text-clay hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0"
                        >
                          Join the Bean Club
                        </button>
                      </>
                    )
                  )}
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
