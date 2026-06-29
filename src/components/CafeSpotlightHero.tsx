import { motion, useAnimation, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, memo, useCallback } from "react";
import { IndianRupee, ArrowRight } from "lucide-react";
import { cn } from "../utils/cn";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button as NeonButton } from "./ui/neon-button";

type CafeProduct = {
  id: number;
  name: string;
  price: string;
  score: number;
  image: string;
};

// Café menu items used for the floating spotlight field.
const sampleProducts: CafeProduct[] = [
  { id: 1, name: "Flat White", price: "₹210", score: 96, image: "https://images.unsplash.com/photo-1615485736894-a2d2e6d4cd9a?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Cappuccino", price: "₹190", score: 94, image: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Pour Over", price: "₹240", score: 92, image: "https://images.unsplash.com/photo-1522012188892-24beb302783d?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "Cinnamon Roll", price: "₹180", score: 95, image: "https://images.unsplash.com/photo-1645995575875-ea6511c9d127?q=80&w=800&auto=format&fit=crop" },
  { id: 5, name: "Iced Latte", price: "₹230", score: 90, image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop" },
  { id: 6, name: "Single-Origin Espresso", price: "₹160", score: 93, image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?q=80&w=800&auto=format&fit=crop" },
  { id: 7, name: "Double Espresso", price: "₹180", score: 91, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop" },
];

const keyProducts = sampleProducts.slice(0, 5);
const backgroundProducts = sampleProducts.slice(5);

interface ProductMetadata {
  name: string;
  price: string;
  score: number;
}

type Size = { width: number; height: number };
type Edge = "top" | "bottom" | "left" | "right";
type Point = { x: number; y: number };

function getRandomEdgePoint(size: Size, edge: Edge): Point {
  const margin = 100;
  switch (edge) {
    case "top": return { x: Math.random() * size.width, y: -margin };
    case "bottom": return { x: Math.random() * size.width, y: size.height + margin };
    case "left": return { x: -margin, y: Math.random() * size.height };
    case "right": return { x: size.width + margin, y: Math.random() * size.height };
  }
}

function createCurvedPath(start: Point, end: Point): Point[] {
  const curveVariation = 30 + Math.random() * 60;
  const midX = (start.x + end.x) / 2 + (Math.random() - 0.5) * curveVariation;
  const midY = (start.y + end.y) / 2 + (Math.random() - 0.5) * curveVariation;
  return [start, { x: midX, y: midY }, end];
}

interface AnimatedProductProps {
  product: CafeProduct;
  isKeyProduct?: boolean;
  containerSize: Size;
  onReachCenter?: (metadata: ProductMetadata) => void;
  onComplete?: () => void;
}

function AnimatedProduct({ product, isKeyProduct = false, containerSize, onReachCenter, onComplete }: AnimatedProductProps) {
  const controls = useAnimation();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const edges: Edge[] = ["top", "bottom", "left", "right"];

      if (isKeyProduct) {
        const startPoint = getRandomEdgePoint(containerSize, edges[Math.floor(Math.random() * 4)]);
        const centerPoint = { x: containerSize.width / 2 - 40, y: containerSize.height / 2 - 40 };

        await controls.set({ x: startPoint.x, y: startPoint.y, scale: 0.7, filter: "blur(4px)", opacity: 0.8 });
        await controls.start({
          x: centerPoint.x, y: centerPoint.y, scale: 1.8, filter: "blur(0px)", opacity: 1,
          transition: { duration: 3 + Math.random() * 2, ease: "easeInOut", type: "tween" },
        });

        onReachCenter?.({ name: product.name, price: product.price, score: product.score });
        await new Promise((r) => setTimeout(r, 3000));
        if (cancelled) return;

        const exit = getRandomEdgePoint(containerSize, edges[Math.floor(Math.random() * 4)]);
        await controls.start({
          x: exit.x, y: exit.y, scale: 0.7, filter: "blur(4px)", opacity: 0.5,
          transition: { duration: 2.5 + Math.random(), ease: "easeInOut", type: "tween" },
        });
        if (!cancelled) onComplete?.();
      } else {
        while (!cancelled) {
          const start = getRandomEdgePoint(containerSize, edges[Math.floor(Math.random() * 4)]);
          const end = getRandomEdgePoint(containerSize, edges[Math.floor(Math.random() * 4)]);
          const path = createCurvedPath(start, end);

          await controls.set({ x: start.x, y: start.y, scale: 0.5 + Math.random() * 0.4, filter: "blur(2px)", opacity: 0.5 + Math.random() * 0.4 });
          for (let i = 1; i < path.length; i++) {
            if (cancelled) return;
            await controls.start({
              x: path[i].x, y: path[i].y,
              transition: { duration: 2 + Math.random() * 2, ease: "linear", type: "tween" },
            });
          }
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKeyProduct, containerSize]);

  return (
    <motion.div
      className="absolute w-16 h-16 md:w-20 md:h-20"
      animate={controls}
      initial={{ scale: 0.5 + Math.random() * 0.4, filter: "blur(2px)", opacity: 0.6 }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-line shadow-[0_10px_30px_-12px_rgba(44,33,24,0.4)] bg-sand">
        <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-espresso/10" />
      </div>
    </motion.div>
  );
}

function CircularProgress({ value, size = 32 }: { value: number; size?: number }) {
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-[2.5px] border-line" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, var(--sage) 0deg ${pct * 3.6}deg, transparent ${pct * 3.6}deg 360deg)`,
          mask: `radial-gradient(circle at center, transparent ${size / 2 - 3}px, black ${size / 2 - 2}px)`,
          WebkitMask: `radial-gradient(circle at center, transparent ${size / 2 - 3}px, black ${size / 2 - 2}px)`,
        }}
      />
      <span className="relative text-xs font-mono text-sage z-10">{value}</span>
    </div>
  );
}

const MetadataDisplay = memo(function MetadataDisplay({ metadata }: { metadata: ProductMetadata }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
    >
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Price — left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 15 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-paper border border-line rounded-lg p-2.5 shadow-[0_12px_30px_-12px_rgba(44,33,24,0.4)]"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-clay rounded-full flex items-center justify-center">
              <IndianRupee className="w-3 h-3 text-cream" />
            </span>
            <div>
              <div className="text-xs text-bark-soft">Price</div>
              <div className="text-sm font-mono text-espresso">{metadata.price}</div>
            </div>
          </div>
        </motion.div>

        {/* Loved score — right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: -15 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 bg-paper border border-line rounded-lg p-2.5 shadow-[0_12px_30px_-12px_rgba(44,33,24,0.4)]"
        >
          <div className="flex items-center gap-2">
            <CircularProgress value={metadata.score} size={32} />
            <div>
              <div className="text-xs text-bark-soft">Loved</div>
              <div className="text-sm font-mono text-sage">{metadata.score}%</div>
            </div>
          </div>
        </motion.div>

        {/* Name — top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-paper border border-line rounded-lg p-3 shadow-[0_12px_30px_-12px_rgba(44,33,24,0.4)] min-w-[180px] max-w-[260px]"
        >
          <div className="text-sm font-display text-espresso text-center leading-tight">{metadata.name}</div>
        </motion.div>
      </div>
    </motion.div>
  );
});

export function CafeSpotlightHero({ onStart }: { onStart?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<Size>({ width: 800, height: 600 });
  const [currentMetadata, setCurrentMetadata] = useState<ProductMetadata | null>(null);
  const [keyProductIndex, setKeyProductIndex] = useState(0);
  const [isKeyProductAnimating, setIsKeyProductAnimating] = useState(true);
  const [backgroundProductInstances] = useState(() =>
    Array.from({ length: 12 }, (_, index) => ({
      id: `bg-${index}`,
      product: backgroundProducts[index % backgroundProducts.length],
    }))
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const updateSize = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerSize({ width: rect.width, height: rect.height });
        }
      }, 100);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const handleKeyProductComplete = useCallback(() => {
    setIsKeyProductAnimating(false);
    setTimeout(() => {
      setKeyProductIndex((prev) => (prev + 1) % keyProducts.length);
      setIsKeyProductAnimating(true);
    }, 100);
  }, []);

  const handleProductReachCenter = useCallback((metadata: ProductMetadata) => {
    setCurrentMetadata(metadata);
    setTimeout(() => setCurrentMetadata(null), 3000);
  }, []);

  return (
    <section className="relative rounded-[var(--radius)] border border-line bg-paper overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center p-6 md:p-10">
        {/* Left — copy */}
        <motion.div
          className="space-y-5 text-center lg:text-left order-2 lg:order-1"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-bark-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-clay" /> Freshly roasted daily
          </span>
          <motion.h1
            className="text-4xl md:text-5xl text-espresso leading-[1.05]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Good things brew <span className="italic font-normal text-clay">slowly</span>.
            <br /> Order your perfect cup.
          </motion.h1>
          <motion.p
            className="text-lg text-bark max-w-xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Beans roasted in small batches on Brigade Road, pulled to order by our baristas.
            Browse the menu, build your tray, and we'll have it ready at the counter.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <NeonButton variant="solid" size="lg" onClick={onStart}>
              Start your order <ArrowRight size={18} />
            </NeonButton>
          </motion.div>
        </motion.div>

        {/* Right — floating product field */}
        <motion.div
          className="relative order-1 lg:order-2"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <div
            ref={containerRef}
            className="relative w-full h-80 md:h-[420px] lg:h-[480px] rounded-[var(--radius)] overflow-hidden border border-line"
            style={{
              background: `radial-gradient(circle at 30% 20%, rgba(184,92,56,0.10), transparent 60%), radial-gradient(circle at 70% 80%, rgba(192,137,47,0.10), transparent 60%), linear-gradient(135deg, var(--paper-raised), var(--sand))`,
            }}
          >
            {backgroundProductInstances.map((item) => (
              <AnimatedProduct key={item.id} product={item.product} containerSize={containerSize} />
            ))}
            {isKeyProductAnimating && (
              <AnimatedProduct
                key={`key-${keyProducts[keyProductIndex].id}-${keyProductIndex}`}
                product={keyProducts[keyProductIndex]}
                isKeyProduct
                containerSize={containerSize}
                onReachCenter={handleProductReachCenter}
                onComplete={handleKeyProductComplete}
              />
            )}
            <AnimatePresence mode="wait">
              {currentMetadata && <MetadataDisplay metadata={currentMetadata} />}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
