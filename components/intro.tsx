"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const IntroCanvas = dynamic(() => import("./intro-canvas"), {
  ssr: false,
  loading: () => null,
});

const SESSION_KEY = "raceday.intro.v1";
const DURATION = 4200;

export function IntroExperience() {
  const [visible, setVisible] = useState(false);
  const [canRender3d, setCanRender3d] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    setLeaving(true);
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // armazenamento indisponível
    }
    window.setTimeout(() => setVisible(false), 620);
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) return;

    const canvas = document.createElement("canvas");
    const supported = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
    setCanRender3d(supported);
    setVisible(true);
    const timer = window.setTimeout(finish, DURATION);
    return () => window.clearTimeout(timer);
  }, [finish]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, finish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Abertura Race Day Speed & Glory"
          initial={{ opacity: 1 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] overflow-hidden bg-ink"
        >
          {canRender3d ? (
            <IntroCanvas />
          ) : (
            <div className="absolute inset-0 speed-lines opacity-40" />
          )}

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(8,10,13,0.85)_100%)]" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.42em" }}
              transition={{ duration: 1.1, delay: 0.15 }}
              className="mb-4 text-[0.6rem] uppercase text-metal"
            >
              Est. Motorsport Culture
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-display text-[clamp(3.2rem,13vw,10rem)] text-white"
            >
              Race Day
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.75 }}
              className="mt-1 font-display text-[clamp(0.8rem,2.4vw,1.3rem)] font-semibold uppercase italic tracking-[0.32em] text-racing"
            >
              Speed &amp; Glory
            </motion.p>

            <div className="mt-10 h-px w-52 overflow-hidden bg-white/12">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: DURATION / 1000, ease: "linear" }}
                className="h-full w-full bg-gradient-to-r from-racing to-lime"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-8 right-6 z-20 rounded-full border border-white/15 px-5 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-metal transition hover:border-racing/60 hover:text-white"
          >
            Pular introdução
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
