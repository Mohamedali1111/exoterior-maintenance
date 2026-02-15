"use client";

import { useTranslations, useLocale } from "next-intl";
import { MAIN_SERVICES } from "@/lib/services";

export default function ServicesOverview() {
  const t = useTranslations("services");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section
      id="services"
      className="scroll-mt-20 border-t border-neutral-600/40 px-3 py-10 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-5xl min-w-0">
        <h2 className="text-center text-xl font-bold text-white sm:text-2xl md:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs text-neutral-400 sm:mt-3 sm:text-sm md:text-base animate-[fade-in-up_0.6s_ease-out_0.1s_both]">
          {t("subtitle")}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {MAIN_SERVICES.map((id, i) => (
            <div
              key={id}
              className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-2.5 text-center transition-all duration-300 ease-out hover:border-red-500/60 hover:bg-red-950/30 active:scale-[0.98] sm:min-h-[52px] sm:rounded-2xl sm:px-4 sm:py-4 sm:hover:shadow-lg sm:hover:shadow-red-950/20 animate-[fade-in-up_0.5s_ease-out_both]"
              style={{ animationDelay: `${80 + i * 40}ms` }}
            >
              <span className="text-[11px] font-medium text-neutral-200 leading-tight sm:text-xs md:text-sm">
                {t(`main.${id}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
