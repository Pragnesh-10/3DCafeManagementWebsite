import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Coffee, Leaf, Zap, Heart, MapPin } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/neon-button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Landing() {
  return (
    <div className="min-h-screen bg-cream text-espresso selection:bg-clay/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full h-20 border-b border-line bg-cream/85 backdrop-blur-md z-50 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-espresso text-cream flex items-center justify-center shadow-[0_2px_6px_-2px_rgba(44,33,24,0.5)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="12" rx="7.5" ry="10" transform="rotate(35 12 12)" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 5C12 9 12 15 16 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <div className="leading-none">
            <span className="block text-lg font-display font-semibold text-espresso tracking-tight">Cardamom</span>
            <span className="block text-[0.55rem] uppercase tracking-[0.2em] text-bark-soft mt-0.5">Coffee Roasters</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-bark-soft">
          <a href="#roastery" className="hover:text-espresso transition-colors">Roastery</a>
          <a href="#menu" className="hover:text-espresso transition-colors">Menu</a>
          <a href="#locations" className="hover:text-espresso transition-colors">Locations</a>
        </div>
        <Link to="/login">
          <Button variant="solid" size="sm" className="rounded-full px-6">
            Sign In
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-clay font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" /> Established 2018 · Bengaluru
            </span>
            <h1 className="text-5xl md:text-7xl font-display text-espresso leading-[1.05] mb-8">
              Brewing <span className="italic font-normal text-clay">Connection</span>, One Bean at a Time.
            </h1>
            <p className="text-xl text-bark leading-relaxed mb-10 max-w-xl">
              From the high elevations of Chikmagalur to our roastery on Brigade Road. Experience the soul of South Indian coffee, reimagined with modern craft.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="rounded-full w-full sm:w-auto h-14 px-8">
                  Start Your Order <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto h-14 px-8">
                Explore the Roast
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden border border-line shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop"
                alt="Coffee Roasting Process"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-espresso/10 mix-blend-multiply" />
            </div>
            {/* Floating Badges */}
            <motion.div
              className="absolute -top-6 -right-6 bg-paper border border-line rounded-2xl p-4 shadow-xl flex items-center gap-3"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-10 h-10 rounded-full bg-clay/10 flex items-center justify-center text-clay">
                <Leaf size={20} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-tighter text-bark-soft">Source</div>
                <div className="text-sm font-semibold text-espresso">Direct Trade</div>
              </div>
            </motion.div>
            <motion.div
              className="absolute -bottom-8 -left-8 bg-paper border border-line rounded-2xl p-5 shadow-xl flex items-center gap-4"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-12 h-12 rounded-full bg-honey/10 flex items-center justify-center text-honey">
                <Coffee size={24} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-tighter text-bark-soft">Daily Roast</div>
                <div className="text-sm font-semibold text-espresso">Medium-Dark</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-sand/30 border-y border-line px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-espresso mb-4">The Cardamom Standard</h2>
            <p className="text-bark max-w-2xl mx-auto">Every cup is a result of meticulous sourcing, precise roasting, and a passion for the perfect pour.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Leaf />, title: "Ethically Sourced", desc: "We partner directly with farmers in Karnataka to ensure fair wages and sustainable practices." },
              { icon: <Zap />, title: "Small Batch Roasting", desc: "Our beans are roasted daily in batches under 10kg to maintain peak flavor profiles." },
              { icon: <Heart />, title: "Crafted with Care", desc: "Our baristas undergo 200+ hours of training to master the art of the cardamom brew." }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-paper border border-line p-8 rounded-[2rem] hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-clay/10 text-clay flex items-center justify-center mb-6">
                  {React.cloneElement(f.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-xl text-espresso mb-3">{f.title}</h3>
                <p className="text-bark leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className="py-24 px-6 md:px-12 bg-cream">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-[2rem] overflow-hidden border border-line">
                <ImageWithFallback src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" alt="Cafe Interior" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square rounded-[2rem] overflow-hidden border border-line mt-8">
                <ImageWithFallback src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop" alt="Cafe Exterior" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl text-espresso mb-8 leading-tight">Visit Our Roastery & <br/><span className="italic font-normal text-clay">Tasting Rooms</span></h2>
            <div className="space-y-8">
              {[
                { name: "Brigade Road Roastery", addr: "42 Brigade Rd, Shanthala Nagar, Bengaluru", hours: "7:00 AM - 11:00 PM" },
                { name: "Indiranagar Pocket", addr: "721, 100 Feet Rd, Indiranagar, Bengaluru", hours: "8:00 AM - 10:00 PM" },
                { name: "Whitefield Station", addr: "Nexus Shantiniketan, Whitefield, Bengaluru", hours: "9:00 AM - 10:00 PM" }
              ].map((loc, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-clay/20 flex items-center justify-center text-clay mt-1">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <h4 className="text-lg text-espresso mb-1">{loc.name}</h4>
                    <p className="text-sm text-bark mb-1">{loc.addr}</p>
                    <p className="text-xs uppercase tracking-widest text-bark-soft">{loc.hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-line bg-paper px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5 opacity-60">
            <span className="w-7 h-7 rounded-full bg-espresso text-cream flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="12" rx="7.5" ry="10" transform="rotate(35 12 12)" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 5C12 9 12 15 16 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-display font-semibold text-espresso">Cardamom</span>
          </div>
          <p className="text-xs text-bark-soft uppercase tracking-[0.2em]">© 2026 Cardamom Coffee Roasters. All rights reserved.</p>
          <div className="flex gap-6">
            {['Instagram', 'Twitter', 'LinkedIn'].map(s => (
              <a key={s} href="#" className="text-xs uppercase tracking-widest text-bark-soft hover:text-clay transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
