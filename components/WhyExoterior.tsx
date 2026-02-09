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
      className="scroll-mt-20 border-t border-neutral-800 bg-neutral-950 px-4 py-12 sm:px-6 sm:py-16 md:py-20"
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
              className="group rounded-xl border border-neutral-800 bg-black/60 p-4 text-center sm:p-5 transition-all duration-300 ease-out hover:border-red-500/60 hover:bg-neutral-900 hover:shadow-lg hover:shadow-red-950/20 hover:-translate-y-0.5 animate-[fade-in-up_0.6s_ease-out_both]"
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <span className="text-2xl inline-block transition-transform duration-300 group-hover:scale-110" aria-hidden>{icon}</span>
              <h3 className="mt-2 font-semibold text-white">
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
