"use client";

import { useTranslations, useLocale } from "next-intl";

const points = [
  { key: "fast", icon: "⚡" },
  { key: "certified", icon: "✓" },
  { key: "transparent", icon: "£" },
  { key: "quality", icon: "★" },
] as const;

export default function WhyExoterior() {
  const t = useTranslations("why");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section
      id="why"
      className="scroll-mt-20 border-t border-white/[0.06] px-4 py-12 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {points.map(({ key, icon }, i) => (
            <div
              key={key}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-center transition-all duration-300 ease-out hover:border-red-500/50 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-red-950/10 active:scale-[0.99] animate-[fade-in-up_0.6s_ease-out_both] sm:p-6"
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <span className="text-2xl inline-block transition-transform duration-300 group-hover:scale-110" aria-hidden>{icon}</span>
              <h3 className="mt-3 font-semibold text-white">
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
