"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer id="footer" className="scroll-mt-20 border-t-4 border-red-600 bg-black px-4 py-10 text-neutral-300 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="w-full text-start sm:w-auto">
          <p className="font-semibold text-white">{t("contact")}</p>
          <p className="mt-2 text-sm text-start">
            {t("phone")}: <a href="tel:+200000000000" dir="ltr" className="inline-block transition-colors duration-200 hover:text-red-400" style={{ unicodeBidi: "isolate" }}>+20 000 000 0000</a>
          </p>
          <p className="text-sm text-start">
            {t("whatsapp")}: <a href="https://wa.me/200000000000" target="_blank" rel="noopener noreferrer" dir="ltr" className="inline-block transition-colors duration-200 hover:text-red-400" style={{ unicodeBidi: "isolate" }}>+20 000 000 0000</a>
          </p>
          <p className="text-sm text-start">
            {t("email")}: <a href="mailto:info@exoterior.com" dir="ltr" className="inline-block transition-colors duration-200 hover:text-red-400" style={{ unicodeBidi: "isolate" }}>info@exoterior.com</a>
          </p>
        </div>
        <div className="w-full text-start sm:w-auto">
          <p className="font-semibold text-white">{t("links")}</p>
          <div className="mt-2 flex flex-col items-start gap-1 text-sm">
            <a href="#services" className="transition-colors duration-200 hover:text-red-400">{tNav("services")}</a>
            <a href="#booking" className="transition-colors duration-200 hover:text-red-400">{tNav("booking")}</a>
            <a href="#faq" className="transition-colors duration-200 hover:text-red-400">{tNav("faq")}</a>
            <Link href="/" locale={locale === "ar" ? "en" : "ar"} className="transition-colors duration-200 hover:text-red-400">{tNav("langSwitch")}</Link>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
        © Exoterior. {t("rights")}
      </p>
    </footer>
  );
}
