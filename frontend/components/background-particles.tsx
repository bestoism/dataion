"use client";

import { useEffect, useState } from "react";

export function BackgroundParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const particles = Array.from({ length: 40 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      
      {/* GLOW */}
      <div
        className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 
        w-[90%] h-[500px]
        bg-[radial-gradient(circle,rgba(59,130,246,0.45)_0%,transparent_70%)]
        dark:bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,transparent_70%)]
        blur-[100px] rounded-full animate-breathing"
      />

      {/* PARTIKEL */}
      {particles.map((_, i) => {
        const left = Math.random() * 100 + "%";
        const durationNum = Math.random() * 15 + 10; 
        const duration = durationNum + "s";
        const delay = "-" + (Math.random() * durationNum) + "s"; 
        const size = Math.random() * 5 + 3 + "px";

        return (
          <div
            key={i}
            className="
              absolute bottom-0 /* <--- Set posisi awal di bawah */
              rounded-full 
              bg-blue-500/40 dark:bg-indigo-300/40
              blur-[0.5px]
              shadow-[0_0_12px_rgba(99,102,241,0.6)]
              animate-float-up
            "
            style={{
              left,
              width: size,
              height: size,
              animationDuration: duration,
              animationDelay: delay,
            }}
          />
        );
      })}
    </div>
  );
}