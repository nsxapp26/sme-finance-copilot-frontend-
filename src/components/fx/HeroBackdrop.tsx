import React from "react";

// Hero backdrop: 4-color aurora + 3D grid floor + rising particles (decoration only, no data)
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 0.7) % 6}s`,
  duration: `${6 + (i % 5)}s`,
  size: 3 + (i % 3) * 2,
}));

export const HeroBackdrop: React.FC<{ animate: boolean }> = ({ animate }) => (
  <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="hero-aurora absolute inset-0">
      <span className="w-[28rem] h-[28rem] -top-32 -left-24 bg-brand" />
      <span className="w-[22rem] h-[22rem] top-10 right-[-6rem] bg-resource" style={{ animationDelay: "-4s" }} />
      <span className="w-[18rem] h-[18rem] bottom-[-6rem] left-1/3 bg-fuchsia-500" style={{ animationDelay: "-8s" }} />
      <span className="w-[14rem] h-[14rem] top-1/3 left-1/2 bg-amber-400/70" style={{ animationDelay: "-2s" }} />
    </div>
    <div className="hero-grid" />
    {animate && PARTICLES.map((p, i) => (
      <span key={i} className="hero-particle"
        style={{ left: p.left, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }} />
    ))}
  </div>
);

// Title pops in word by word (Thai is split on spaces)
export const PopWords: React.FC<{ text: string; startAt?: number; shine?: boolean }> = ({ text, startAt = 0, shine }) => (
  <>
    {text.split(" ").map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        <span className={`word-pop ${shine ? "text-shine" : ""}`} style={{ animationDelay: `${(startAt + i) * 90}ms` }}>{word}</span>
        {" "}
      </React.Fragment>
    ))}
  </>
);
