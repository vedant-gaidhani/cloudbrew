"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ReservationForm from "@/components/ReservationForm";
import Footer from "@/components/Footer";
import Image from "next/image";
import { fetchMenuItems, MenuItem, db } from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { collection, onSnapshot, query } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { menuItems, setMenuItems, addToCart, setCartOpen, forceClosed } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive unique categories from items
  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category || "Uncategorized")))];

  // Filter items
  const filteredItems = activeCategory === "All" ? menuItems : menuItems.filter(item => item.category === activeCategory);

  useEffect(() => {
    let unsubscribe = () => { };

    const loadData = async () => {
      // Load initial batch synchronously if there are no keys (mock mode)
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        if (menuItems.length === 0) {
          const items = await fetchMenuItems();
          setMenuItems(items);
        }
        return;
      }

      // Connect real-time snapshot listener
      const q = query(collection(db, "menu_items"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
        setMenuItems(items);
      });
    };

    loadData();
    return () => unsubscribe();
  }, [setMenuItems]);

  useGSAP(() => {
    if (loading) return;

    // Background Color Transition (Cream -> Lavender -> Cream)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".menu-section",
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });

    tl.to(document.body, { backgroundColor: "#E8DFF5", duration: 1 })
      .to(document.body, { backgroundColor: "#F8EDE3", duration: 1 }, "+=0.5");

    // Perpetual Floating Objects
    gsap.to(".floating-perpetual", {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "linear",
    });

    gsap.to(".floating-bounce", {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // 3. Scroll Velocity & Depth (Surreal Sips)
    gsap.to(".layer-front", {
      yPercent: -150,
      ease: "none",
      scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

    gsap.to(".layer-back", {
      yPercent: 50,
      ease: "none",
      scrollTrigger: {
        trigger: "#about",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

    // 4. Menu Hover Physics (Desktop Only)
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const menuItems = gsap.utils.toArray(".menu-item");
      const handleEnter = () => gsap.to(document.body, { backgroundColor: "#FFD6BA", duration: 0.5, ease: "power2.out", overwrite: "auto" });
      const handleLeave = () => gsap.to(document.body, { backgroundColor: "#E8DFF5", duration: 0.5, ease: "power2.out", overwrite: "auto" });

      menuItems.forEach((item: any) => {
        item.addEventListener("mouseenter", handleEnter);
        item.addEventListener("mouseleave", handleLeave);
      });

      return () => {
        menuItems.forEach((item: any) => {
          item.removeEventListener("mouseenter", handleEnter);
          item.removeEventListener("mouseleave", handleLeave);
        });
      };
    });

  }, { dependencies: [loading], scope: containerRef });

  return (
    <SmoothScroll>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      {!loading && (
        <div ref={containerRef}>
          <Navbar />
          <main>
            <Hero />

            {/* Section 2: Menu Bleed Grid */}
            <section id="menu" className="menu-section relative w-full min-h-screen py-32 px-6 flex flex-col items-center z-10 transition-colors duration-500">
              <h2 className="font-serif text-6xl md:text-8xl font-bold mb-8 text-cb-espresso text-center">
                The Menu
              </h2>

              {/* Sticky Category Navigation */}
              <div className="sticky top-24 z-40 w-full max-w-6xl mx-auto py-4 mb-4 flex gap-4 overflow-x-auto hide-scrollbar snap-x px-4 -mx-4 items-center justify-start md:justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-3 rounded-full font-sans text-[10px] sm:text-xs tracking-widest uppercase font-bold whitespace-nowrap transition-colors snap-center shadow-sm ${activeCategory === category
                        ? 'bg-cb-espresso text-cb-cream'
                        : 'bg-white/50 text-cb-espresso hover:bg-white/80 border border-cb-espresso/10'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Animated Grid Container */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto mt-8">
                {menuItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 opacity-50 font-sans tracking-widest uppercase text-sm">
                    Brewing the menu...
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                        key={item.id}
                        className={`menu-item glass p-4 md:p-6 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 ${!item.is_available ? 'opacity-50 grayscale' : ''}`}
                      >
                        {/* Compact Card Design */}
                        <div className="w-full aspect-square md:aspect-[4/5] relative mb-6 bg-cb-espresso/5 rounded-xl overflow-hidden flex items-center justify-center group pointer-events-none">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="object-cover w-4/5 h-4/5 mix-blend-multiply drop-shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 ease-out" loading="lazy" />
                          ) : (
                            <span className="font-serif opacity-30 text-2xl">C B .</span>
                          )}
                        </div>

                        <div className="w-full text-left md:text-center px-2 flex-grow flex flex-col">
                          <h3 className="font-serif text-2xl font-bold mb-2 text-cb-espresso">{item.name}</h3>
                          <p className="font-sans text-xs opacity-70 uppercase tracking-widest mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-cb-espresso/10">
                            <div className="font-sans font-bold text-xl text-cb-espresso">${item.price.toFixed(2)}</div>
                            <button
                              onClick={() => {
                                if (!item.is_available || forceClosed) return;
                                addToCart(item);
                                setCartOpen(true);
                              }}
                              disabled={!item.is_available || forceClosed}
                              className={`px-6 py-2.5 rounded-full font-sans text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed ${!item.is_available || forceClosed ? 'bg-cb-espresso/10 text-cb-espresso/50 shadow-none' : 'bg-cb-espresso text-cb-cream hover:opacity-90 shadow-xl shadow-cb-espresso/20'}`}
                            >
                              {!item.is_available ? 'Sold Out' : forceClosed ? 'Closed' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            </section>

            {/* Section 3: Interactive Objects */}
            <section id="about" className="relative w-full min-h-screen py-32 overflow-hidden flex items-center justify-center">
              <div className="text-center z-20 max-w-3xl px-6">
                <h2 className="font-serif text-6xl md:text-8xl font-bold mb-8 text-cb-espresso">
                  Surreal Sips
                </h2>
                <p className="font-sans text-xl leading-relaxed">
                  We blend high-fashion aesthetics with the comfort of a creamy dream.
                  Every cup is a masterpiece, crafted to elevate your senses and defy gravity.
                </p>
              </div>

              {/* Decorative Floating Objects */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-60">
                <Image
                  src="/assets/images/objects/sugar-final.webp"
                  alt="Sugar Cube"
                  width={200}
                  height={200}
                  className="layer-front floating-perpetual absolute top-1/4 left-1/4 w-[15vw] max-w-[200px]"
                />
                <Image
                  src="/assets/images/objects/macaron-final.webp"
                  alt="Macaron"
                  width={250}
                  height={250}
                  className="layer-back floating-bounce floating-perpetual absolute bottom-1/4 right-1/4 w-[20vw] max-w-[250px]"
                />
              </div>
            </section>

            {/* Section 4: Reservations */}
            <section id="reserve" className="relative w-full min-h-[80vh] py-32 px-6 flex flex-col items-center justify-center">
              <div className="z-20 text-center mb-16 max-w-2xl text-cb-espresso">
                <h2 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-cb-espresso">
                  Secure Your Cloud
                </h2>
                <p className="font-sans text-lg opacity-80 leading-relaxed">
                  Reserve your table ahead of time and prepare for an ethereal journey of taste and ambiance. Let us know you're coming.
                </p>
              </div>

              <div className="relative z-20 w-full">
                <ReservationForm />
              </div>
            </section>

            <Footer />
          </main>
        </div>
      )}
    </SmoothScroll>
  );
}
