"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
      disable: prefersReducedMotion || window.innerWidth < 768, // Disable AOS on small/slow devices
    });
    // Refresh AOS to catch new elements
    AOS.refresh();

    if (prefersReducedMotion) return;

    // Re-calculate hover triggers and tilt cards after a short delay to allow DOM to render
    const initInteractivity = () => {
      // Custom Cursor Logic
      const cursor = cursorRef.current;
      const triggers = document.querySelectorAll(
        '.hover-trigger, a, button, [role="button"]'
      );

      const handleMouseEnter = () => cursor?.classList.add("hovered");
      const handleMouseLeave = () => cursor?.classList.remove("hovered");

      triggers.forEach((trigger) => {
        trigger.addEventListener("mouseenter", handleMouseEnter);
        trigger.addEventListener("mouseleave", handleMouseLeave);
      });

      // 3D Tilt Card Logic
      const cards = document.querySelectorAll(
        ".tilt-card"
      ) as NodeListOf<HTMLElement>;
      cards.forEach((card) => {
        let rafId: number;
        const handleCardMouseMove = (e: MouseEvent) => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          });
        };

        const handleCardMouseLeave = () => {
          cancelAnimationFrame(rafId);
          card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
        };

        card.addEventListener("mousemove", handleCardMouseMove);
        card.addEventListener("mouseleave", handleCardMouseLeave);
      });
    };

    const timeoutId = setTimeout(initInteractivity, 150);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    // Global Cursor Follower
    const cursor = cursorRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    let cursorRafId: number;
    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.4;
      cursorY += dy * 0.4;

      if (cursor) {
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      cursorRafId = requestAnimationFrame(updateCursor);
    };

    document.addEventListener("mousemove", handleMouseMove);
    updateCursor();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (cursorRafId) cancelAnimationFrame(cursorRafId);
    };
  }, []);

  const isAdminPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/dashboard");

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      {!isAdminPage && <Navbar />}
      <main className={`${!isAdminPage ? "bg-black" : ""} min-h-screen`}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
};

export default Layout;
