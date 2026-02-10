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
      className="scroll-mt-20 border-t border-neutral-600/40 px-4 py-14 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <div className="mt-10 flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-6">
          {steps.map(({ key, num }, i) => (
            <div
              key={key}
              className="flex flex-1 flex-col items-center text-center transition-transform duration-300 active:scale-[0.98] animate-[fade-in-up_0.6s_ease-out_both] sm:hover:-translate-y-1"
              style={{ animationDelay: `${100 + i * 120}ms` }}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-red-600/80 bg-red-950/40 text-lg font-bold text-red-400 shadow-lg shadow-red-950/20 transition-all duration-300 hover:scale-105 hover:border-red-500 hover:bg-red-900/30 hover:shadow-red-950/30 sm:h-12 sm:w-12 sm:rounded-full">
                {num}
              </div>
              <h3 className="mt-4 font-semibold text-white sm:mt-3">
                {t(key)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {t(`${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
