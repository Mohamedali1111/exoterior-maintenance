"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useEffect, useState } from "react";

const HERO_VIDEO_SRC =
  typeof process.env.NEXT_PUBLIC_HERO_VIDEO_URL === "string" &&
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL.length > 0
    ? process.env.NEXT_PUBLIC_HERO_VIDEO_URL
    : "/videos/hero-bg.mp4";

/** Optional: show this image until the video plays. Add public/videos/hero-poster.jpg for instant hero. */
const HERO_VIDEO_POSTER = "/videos/hero-poster.jpg";

export default function Hero() {
  const t = useTranslations("hero");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  // Defer loading the video until after page is ready so initial load is fast
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    const startLoadingVideo = () => setVideoSrc(HERO_VIDEO_SRC);
    if (typeof document === "undefined") return;
    if (document.readyState === "complete") {
      startLoadingVideo();
    } else {
      window.addEventListener("load", startLoadingVideo);
      return () => window.removeEventListener("load", startLoadingVideo);
    }
  }, []);

  // Force play when video is loaded and when visible again
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const play = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });

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
  }, [videoSrc]);

  return (
    <section className="relative min-h-[45vh] overflow-hidden border-b-4 border-red-600 px-3 pb-12 pt-10 sm:min-h-[55vh] sm:px-4 sm:pb-20 sm:pt-14 md:min-h-[65vh] md:pb-28 md:pt-20">
      {/* Video layer: full bleed, perfect fit. Video loads after page so site feels fast. */}
      <div className="absolute inset-0 min-h-full min-w-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_VIDEO_POSTER}
          disablePictureInPicture
          disableRemotePlayback
          onCanPlay={() => setVideoReady(true)}
          className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center pointer-events-none transition-opacity duration-500"
          style={{
            background: "#0a0a0a",
            opacity: videoReady ? 1 : 0,
          }}
          aria-hidden
          src={videoSrc}
        />
      </div>
      {/* Overlays: darken video so text stays readable and blend with page */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" aria-hidden />
      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[35vh] max-w-3xl flex-col items-center justify-center text-center sm:min-h-[50vh]">
        <h1 className="animate-[fade-in-up_0.7s_ease-out_both]">
          <Image
            src="/Logo.png"
            alt="Exoterior"
            width={320}
            height={120}
            className="logo-on-dark-hero w-44 sm:w-60 md:w-72 h-auto object-contain"
            priority
          />
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-200 drop-shadow-md sm:mt-4 sm:text-base md:text-lg animate-[fade-in-up_0.7s_ease-out_0.15s_both]">
          {t("tagline")}
        </p>
        <a
          href="#booking"
          className="mt-5 inline-flex min-h-[42px] min-w-0 touch-manipulation items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-red-500 hover:to-red-600 active:scale-[0.98] animate-[fade-in-up_0.7s_ease-out_0.25s_both] sm:min-h-[48px] sm:min-w-[160px] sm:rounded-2xl sm:px-6 sm:py-3 sm:text-base"
        >
          {t("cta")}
        </a>
      </div>
    </section>
  );
}
