"use client";

import { useTranslations } from "next-intl";

const steps = [
  { key: "step1", num: 1 },
  { key: "step2", num: 2 },
  { key: "step3", num: 3 },
] as const;

export default function HowItWorks() {
  const t = useTranslations("how");

  return (
    <section id="how" className="scroll-mt-20 border-t border-neutral-800 bg-neutral-950 px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:justify-between">
          {steps.map(({ key, num }, i) => (
            <div
              key={key}
              className="flex flex-1 flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 animate-[fade-in-up_0.6s_ease-out_both]"
              style={{ animationDelay: `${100 + i * 120}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-red-950/50 text-lg font-bold text-red-400 transition-all duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-900/40 hover:shadow-lg hover:shadow-red-950/30">
                {num}
              </div>
              <h3 className="mt-3 font-semibold text-white">
                {t(key)}
              </h3>
              <p className="mt-1 text-sm text-neutral-400">
                {t(`${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
