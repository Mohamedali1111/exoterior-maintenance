"use client";

import { useTranslations, useLocale } from "next-intl";

const steps = [
  { key: "step1", num: 1 },
  { key: "step2", num: 2 },
  { key: "step3", num: 3 },
] as const;

export default function HowItWorks() {
  const t = useTranslations("how");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section
      id="how"
      className="scroll-mt-20 border-t border-neutral-600/40 px-3 py-10 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-3xl min-w-0">
        <h2 className="text-center text-xl font-bold text-white sm:text-2xl md:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <div className="mt-6 flex flex-col gap-6 sm:mt-10 sm:flex-row sm:justify-between sm:gap-6">
          {steps.map(({ key, num }, i) => (
            <div
              key={key}
              className="flex flex-1 flex-col items-center text-center transition-transform duration-300 active:scale-[0.98] animate-[fade-in-up_0.6s_ease-out_both] sm:hover:-translate-y-1"
              style={{ animationDelay: `${100 + i * 120}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-red-600/80 bg-red-950/40 text-base font-bold text-red-400 shadow-md transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-full sm:hover:scale-105 sm:hover:border-red-500 sm:hover:bg-red-900/30">
                {num}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white sm:mt-3 sm:text-base">
                {t(key)}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 sm:mt-2 sm:text-sm">
                {t(`${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
