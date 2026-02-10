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
      className="scroll-mt-20 border-t border-neutral-600/40 px-4 py-14 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-neutral-400 sm:text-base animate-[fade-in-up_0.6s_ease-out_0.1s_both]">
          {t("subtitle")}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {MAIN_SERVICES.map((id, i) => (
            <div
              key={id}
              className="flex min-h-[56px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-center transition-all duration-300 ease-out hover:border-red-500/60 hover:bg-red-950/30 hover:shadow-lg hover:shadow-red-950/20 active:scale-[0.98] animate-[fade-in-up_0.5s_ease-out_both] sm:min-h-[64px]"
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
