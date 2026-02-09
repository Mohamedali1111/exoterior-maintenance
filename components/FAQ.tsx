"use client";

import { useTranslations, useLocale } from "next-intl";

const items = [
  { q: "q1", a: "a1" },
  { q: "q2", a: "a2" },
  { q: "q3", a: "a3" },
] as const;

export default function FAQ() {
  const t = useTranslations("faq");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section id="faq" className="scroll-mt-20 border-t border-neutral-600/40 px-4 py-12 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>
        <ul className="mt-8 list-none space-y-4 ps-0 pe-0">
          {items.map(({ q, a }, i) => (
            <li
              key={q}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-start transition-all duration-300 ease-out hover:border-red-500/40 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-red-950/10 active:scale-[0.99] animate-[fade-in-up_0.6s_ease-out_both] sm:p-6"
              style={{ animationDelay: `${150 + i * 100}ms` }}
            >
              <h3 className="font-semibold text-white text-start">
                {t(q)}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-400 text-start">
                {t(a)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
