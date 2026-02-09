"use client";

import { useTranslations } from "next-intl";
import { MAIN_SERVICES } from "@/lib/services";

export default function ServicesOverview() {
  const t = useTranslations("services");

  return (
    <section id="services" className="scroll-mt-20 border-t border-neutral-800 bg-neutral-950 px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-neutral-400 sm:text-base animate-[fade-in-up_0.6s_ease-out_0.1s_both]">
          {t("subtitle")}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {MAIN_SERVICES.map((id, i) => (
            <div
              key={id}
              className="rounded-xl border border-neutral-800 bg-black/60 px-3 py-3.5 text-center transition-all duration-300 ease-out hover:scale-105 hover:border-red-500 hover:bg-red-950/40 hover:shadow-lg hover:shadow-red-950/20 animate-[fade-in-up_0.5s_ease-out_both]"
              style={{ animationDelay: `${80 + i * 40}ms` }}
            >
              <span className="text-xs font-medium text-neutral-200 sm:text-sm">
                {t(`main.${id}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
