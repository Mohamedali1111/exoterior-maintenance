"use client";

import { useTranslations } from "next-intl";
import { useRef, useEffect } from "react";

const HERO_VIDEO_SRC =
  typeof process.env.NEXT_PUBLIC_HERO_VIDEO_URL === "string" &&
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL.length > 0
    ? process.env.NEXT_PUBLIC_HERO_VIDEO_URL
    : "/videos/hero-bg.mp4";

export default function Hero() {
  const t = useTranslations("hero");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force play on mount and when visible again (e.g. after client-side nav) – no controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    play();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) play();
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-[50vh] overflow-hidden border-b-4 border-red-600 px-4 pb-16 pt-14 sm:min-h-[60vh] sm:pb-24 sm:pt-16 md:min-h-[65vh] md:pb-28 md:pt-20">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="h-full w-full object-cover [object-position:center_center] pointer-events-none"
          style={{ background: "#0a0a0a" }}
          aria-hidden
          src={HERO_VIDEO_SRC}
        />
      </div>
      {/* Overlays: darken video so text stays readable and blend with page */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" aria-hidden />
      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[40vh] max-w-3xl flex-col items-center justify-center text-center sm:min-h-[50vh]">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl animate-[fade-in-up_0.7s_ease-out_both]">
          Exoterior
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-200 drop-shadow-md sm:text-lg md:text-xl animate-[fade-in-up_0.7s_ease-out_0.15s_both]">
          {t("tagline")}
        </p>
        <a
          href="#booking"
          className="mt-8 inline-flex min-h-[48px] min-w-[180px] touch-manipulation items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-red-950/50 transition-all duration-200 hover:from-red-500 hover:to-red-600 hover:shadow-red-500/35 active:scale-[0.98] animate-[fade-in-up_0.7s_ease-out_0.25s_both] sm:min-h-[52px] sm:min-w-[200px] sm:px-8 sm:py-4"
        >
          {t("cta")}
        </a>
      </div>
    </section>
  );
}
