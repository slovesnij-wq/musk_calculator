import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  Building2,
  Car,
  Home,
  Landmark,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";

const RATE = 5930;

const MILESTONES = [
  { id: 1, seconds: 2, label: "Placeholder 1", amount: "$11,860", icon: "ShoppingCart" },
  { id: 2, seconds: 5, label: "Placeholder 2", amount: "$29,650", icon: "Car" },
  { id: 3, seconds: 9, label: "Placeholder 3", amount: "$53,370", icon: "User" },
  { id: 4, seconds: 13, label: "Placeholder 4", amount: "$77,090", icon: "User" },
  { id: 5, seconds: 18, label: "Placeholder 5", amount: "$106,740", icon: "Home" },
  { id: 6, seconds: 23, label: "Placeholder 6", amount: "$136,390", icon: "Home" },
  { id: 7, seconds: 29, label: "Placeholder 7", amount: "$172,070", icon: "Building" },
  { id: 8, seconds: 35, label: "Placeholder 8", amount: "$207,550", icon: "Building" },
  { id: 9, seconds: 47, label: "Placeholder 9", amount: "$278,900", icon: "Building2" },
  { id: 10, seconds: 57, label: "Placeholder 10", amount: "$338,010", icon: "Landmark" },
];

const ICONS = {
  ShoppingCart,
  Car,
  User,
  Users,
  Home,
  Building,
  Building2,
  Landmark,
};

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap");

:root {
  --bg: #000000;
  --accent: #FFDD31;
  --text: #FFFFFF;
  --muted: rgba(255,255,255,0.4);
  --card-bg: #FFFFFF;
  --card-text: #000000;
  --card-muted: rgba(0,0,0,0.4);
  --digit-w: 8vw;
  --digit-h: 11vw;
  --symbol-w: 6vw;
  --comma-w: 3vw;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: "IBM Plex Mono", monospace;
  overflow: hidden;
}

.app {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

.top-text {
  position: absolute;
  top: 10%;
  width: 100%;
  text-align: center;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.75rem;
  line-height: 1.6;
}

.counter-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5vw;
}

.digit-svg {
  width: var(--digit-w);
  height: var(--digit-h);
  display: block;
}

.digit-text {
  font-family: "Cormorant Garamond", serif;
  font-size: 72px;
  fill: var(--accent);
}

.symbol-svg {
  height: var(--digit-h);
  display: block;
}

.symbol-svg.dollar {
  width: var(--symbol-w);
}

.symbol-svg.comma {
  width: var(--comma-w);
}

.symbol-text {
  font-family: "Cormorant Garamond", serif;
  font-size: 60px;
  fill: var(--muted);
}

.milestones {
  position: fixed;
  left: 32px;
  bottom: 32px;
}

.milestone-stack {
  position: relative;
  width: 280px;
}

.milestone-card {
  width: 280px;
  height: 88px;
  background: var(--card-bg);
  color: var(--card-text);
  border-radius: 0;
  border: none;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.milestone-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.65rem;
  color: var(--card-muted);
}

.milestone-icon {
  width: 16px;
  height: 16px;
  color: var(--card-muted);
}

.milestone-amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--card-text);
}

.source {
  position: fixed;
  right: 32px;
  bottom: 32px;
  color: var(--muted);
  font-size: 0.6rem;
  font-family: "IBM Plex Mono", monospace;
}

@media (max-width: 640px) {
  :root {
    --digit-w: 12vw;
    --digit-h: 16vw;
    --symbol-w: 8vw;
    --comma-w: 4vw;
  }

  .milestones {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    bottom: 24px;
  }

  .milestone-stack {
    width: 90vw;
  }

  .milestone-card {
    width: 90vw;
  }
}
`;

const SvgDigit = ({ digit, prevDigit }) => (
  <svg className="digit-svg" viewBox="0 0 60 80" aria-hidden="true">
    <AnimatePresence initial={false}>
      <motion.text
        key={digit}
        className="digit-text"
        x="30"
        y="65"
        textAnchor="middle"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ duration: 0.12 }}
      >
        {digit}
      </motion.text>
    </AnimatePresence>
  </svg>
);

const SvgSymbol = ({ char, type }) => (
  <svg className={`symbol-svg ${type}`} viewBox="0 0 60 80" aria-hidden="true">
    <text className="symbol-text" x="30" y="65" textAnchor="middle">
      {char}
    </text>
  </svg>
);

const Counter = ({ value }) => {
  const display = `$${value.toLocaleString("en-US")}`;
  const chars = display.split("");

  return (
    <div className="counter" aria-label={display}>
      {chars.map((char, index) => {
        if (/\d/.test(char)) {
          return <SvgDigit key={`digit-${index}`} digit={char} prevDigit={char} />;
        }

        if (char === "$") {
          return <SvgSymbol key={`symbol-${index}`} char="$" type="dollar" />;
        }

        return <SvgSymbol key={`symbol-${index}`} char="," type="comma" />;
      })}
    </div>
  );
};

const MilestoneCard = ({ card, index }) => {
  const Icon = ICONS[card.icon] || Landmark;
  const positions = [
    { y: 0, scale: 1, opacity: 1 },
    { y: -96, scale: 0.97, opacity: 0.5 },
    { y: -184, scale: 0.94, opacity: 0.2 },
  ];
  const target = positions[Math.min(index, 2)];

  return (
    <motion.div
      className="milestone-card"
      layout
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: target.y, scale: target.scale, opacity: target.opacity }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="milestone-line">
        <Icon className="milestone-icon" />
        <span>
          {card.seconds} сек. · {card.label}
        </span>
      </div>
      <div className="milestone-amount">{card.amount}</div>
    </motion.div>
  );
};

const MilestoneStack = ({ cards }) => (
  <div className="milestone-stack">
    <AnimatePresence>
      {cards.map((card, index) => (
        <MilestoneCard key={card.id} card={card} index={index} />
      ))}
    </AnimatePresence>
  </div>
);

const App = () => {
  const [dollars, setDollars] = useState(0);
  const [visibleCards, setVisibleCards] = useState([]);
  const nextMilestoneRef = useRef(0);

  useEffect(() => {
    let rafId;
    const start = performance.now();

    const tick = (now) => {
      const elapsedMs = now - start;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const amount = Math.floor((elapsedMs / 1000) * RATE);

      setDollars(amount);

      let nextIndex = nextMilestoneRef.current;
      if (nextIndex < MILESTONES.length) {
        const toAdd = [];
        while (nextIndex < MILESTONES.length && elapsedSeconds >= MILESTONES[nextIndex].seconds) {
          toAdd.unshift(MILESTONES[nextIndex]);
          nextIndex += 1;
        }

        if (toAdd.length > 0) {
          nextMilestoneRef.current = nextIndex;
          setVisibleCards((prev) => [...toAdd, ...prev].slice(0, 3));
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="app">
      <style>{STYLES}</style>
      <div className="top-text">
        <div>ИЛОН МАСК ЗАРАБОТАЛ</div>
        <div>С МОМЕНТА КАК ВЫ ОТКРЫЛИ ЭТУ СТРАНИЦУ</div>
      </div>
      <div className="counter-wrap">
        <Counter value={dollars} />
      </div>
      <div className="milestones">
        <MilestoneStack cards={visibleCards} />
      </div>
      <div className="source">Источник: рост состояния $187 млрд в 2025 г. Forbes, 2026</div>
    </div>
  );
};

export default App;
