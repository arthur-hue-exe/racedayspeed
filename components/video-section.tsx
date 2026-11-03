"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Play, Pause } from "lucide-react";
import { useState } from "react";

export function VideoSection({
  videoUrl,
  posterUrl,
  images,
  whatsappUrl,
}: {
  videoUrl: string;
  posterUrl: string;
  images: { url: string; alt: string }[];
  whatsappUrl: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const width = useTransform(scrollYProgress, [0.1, 0.5], ["84%", "100%"]);
  const radius = useTransform(scrollYProgress, [0.1, 0.5], ["1.6rem", "0rem"]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <section ref={ref} className="relative overflow-hidden py-24 md:py-32" aria-labelledby="film-title">
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(183,240,0,0.08),transparent_65%)]"
      />
      <div className="container-race">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="text-racing">02</span>
              <span aria-hidden className="h-px w-8 bg-racing/50" />
              Campanha
            </p>
            <h2
              id="film-title"
              className="mt-3 max-w-xl font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-bold uppercase leading-[0.92]"
            >
              A velocidade <span className="text-racing italic">não espera</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-metal">
            Peças que carregam a cultura das pistas para o dia a dia. Imagens do catálogo
            oficial Race Day.
          </p>
        </div>

        <motion.div
          style={reduced ? undefined : { width, borderRadius: radius }}
          className="relative mx-auto aspect-[16/9] overflow-hidden border border-white/10 bg-carbon shadow-[0_60px_120px_-60px_rgba(0,0,0,1)]"
        >
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                controls
                className="absolute inset-0 size-full object-cover"
                aria-label="Filme de campanha Race Day"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-20 hidden md:block">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-lime">Race Day Film</p>
                <p className="mt-2 font-display text-3xl font-semibold uppercase leading-none text-white">
                  Da pista para as ruas
                </p>
              </div>
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition hover:border-racing hover:text-racing"
              >
                {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
              </button>
            </>
          ) : (
            <>
              <div className="absolute inset-0 grid grid-cols-3">
                {images.slice(0, 3).map((image, index) => (
                  <div key={image.url} className="relative overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="33vw"
                      className={`object-cover opacity-80 ${
                        index === 1 ? "scale-105" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-[0.6rem] uppercase tracking-[0.34em] text-lime">
                  Campanha Race Day
                </p>
                <p className="mt-3 max-w-2xl font-display text-[clamp(1.8rem,4vw,3.4rem)] font-semibold uppercase leading-[0.94] text-white">
                  Mais que um estilo,
                  <br />
                  uma paixão
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-racing px-6 py-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-lime"
                >
                  Falar com a Race Day
                </a>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
