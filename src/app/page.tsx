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

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const { menuItems, setMenuItems, addToCart, setCartOpen, forceClosed } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

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

    // 4. Menu Hover Physics
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
  }, { dependencies: [loading], scope: containerRef });

  return (
    <SmoothScroll>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      {!loading && (
        <div ref={containerRef}>
          <Navbar />
          <main>
            <Hero />

            {/* Section 2: Menu Bleed */}
            <section id="menu" className="menu-section relative w-full min-h-screen py-32 px-6 flex flex-col items-center justify-center z-10 transition-colors duration-500">
              <h2 className="font-serif text-6xl md:text-8xl font-bold mb-16 text-cb-espresso text-center">
                The Menu
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full">
                {menuItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 opacity-50 font-sans tracking-widest uppercase text-sm">
                    Brewing the menu...
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <div key={item.id} className={`menu-item glass p-8 rounded-2xl flex flex-col items-center justify-between text-center transform hover:scale-105 transition-transform duration-300 ${!item.is_available ? 'opacity-50 grayscale' : ''}`}>
                      <div>
                        {item.image_url && (
                          <div className="w-32 h-32 mx-auto mb-6 relative rotate-[-10deg] hover:rotate-0 transition-transform duration-500">
                            <img src={item.image_url} alt={item.name} className="object-cover w-full h-full mix-blend-multiply drop-shadow-2xl" loading="lazy" />
                          </div>
                        )}
                        <h3 className="font-serif text-3xl font-bold mb-2">{item.name}</h3>
                        <p className="font-sans text-xs opacity-80 uppercase tracking-widest mb-4">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-auto w-full flex items-center justify-between pt-6 border-t border-cb-espresso/10">
                        <div className="font-sans font-bold text-xl">${item.price.toFixed(2)}</div>
                        <button
                          onClick={() => {
                            if (!item.is_available || forceClosed) return;
                            addToCart(item);
                            setCartOpen(true);
                          }}
                          disabled={!item.is_available || forceClosed}
                          className={`px-6 py-2 rounded-full font-sans text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed ${!item.is_available || forceClosed ? 'bg-cb-espresso/20 text-cb-espresso/50' : 'bg-cb-espresso text-cb-cream hover:bg-cb-espresso/80'}`}
                        >
                          {!item.is_available ? 'Sold Out' : forceClosed ? 'Store Closed' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
