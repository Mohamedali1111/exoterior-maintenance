"use client";

import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden border-b-4 border-red-600 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black px-4 py-16 sm:py-24 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl animate-[fade-in-up_0.7s_ease-out_both]">
          Exoterior
        </h1>
        <p className="mt-4 text-base text-neutral-400 sm:text-lg md:text-xl animate-[fade-in-up_0.7s_ease-out_0.15s_both]">
          {t("tagline")}
        </p>
        <a
          href="#booking"
          className="mt-8 inline-block min-h-[48px] min-w-[180px] rounded-full bg-red-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-red-950/40 transition-all duration-300 ease-out hover:scale-105 hover:bg-red-500 hover:shadow-red-500/30 active:scale-100 active:bg-red-700 animate-[fade-in-up_0.7s_ease-out_0.25s_both]"
        >
          {t("cta")}
        </a>
      </div>
    </section>
  );
}
