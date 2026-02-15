"use client";

import { useTranslations, useLocale } from "next-intl";

const points = [
  { key: "fast" },
  { key: "certified" },
  { key: "transparent" },
  { key: "quality" },
] as const;

const iconClass = "w-10 h-10 text-red-500 shrink-0";

function WhyIcon({ name }: { name: (typeof points)[number]["key"] }) {
  switch (name) {
    case "fast":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case "certified":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "transparent":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case "quality":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function WhyExoterior() {
  const t = useTranslations("why");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section
      id="why"
      className="scroll-mt-20 border-t border-neutral-600/40 px-3 py-10 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-4xl min-w-0">
        <h2 className="text-center text-xl font-bold text-white sm:text-2xl md:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-6">
          {points.map(({ key }, i) => (
            <div
              key={key}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-center transition-all duration-300 ease-out hover:border-red-500/50 hover:bg-white/[0.05] active:scale-[0.99] sm:rounded-2xl sm:p-6 sm:hover:shadow-xl sm:hover:shadow-red-950/10 animate-[fade-in-up_0.6s_ease-out_both]"
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <div className="flex justify-center">
                <span className="inline-flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:text-red-400">
                  <WhyIcon name={key} />
                </span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-white sm:mt-3 sm:text-base">
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
