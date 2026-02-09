"use client";

import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden border-b-4 border-red-600 px-4 pb-16 pt-12 sm:pb-24 sm:pt-16 md:pb-28 md:pt-20">
      {/* Soft black & grey gradient overlay – blends with page bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/40 via-neutral-900/20 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl animate-[fade-in-up_0.7s_ease-out_both]">
          Exoterior
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-400 sm:text-lg md:text-xl animate-[fade-in-up_0.7s_ease-out_0.15s_both]">
          {t("tagline")}
        </p>
        <a
          href="#booking"
          className="mt-8 inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-red-950/50 transition-all duration-200 hover:from-red-500 hover:to-red-600 hover:shadow-red-500/35 active:scale-[0.98] animate-[fade-in-up_0.7s_ease-out_0.25s_both]"
        >
          {t("cta")}
        </a>
      </div>
    </section>
  );
}
