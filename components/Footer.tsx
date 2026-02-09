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
        <div className="text-start">
          <p className="font-semibold text-white">{t("contact")}</p>
          <p className="mt-2 text-sm">
            {t("phone")}: <a href="tel:+200000000000" className="transition-colors duration-200 hover:text-red-400">+20 000 000 0000</a>
          </p>
          <p className="text-sm">
            {t("whatsapp")}: <a href="https://wa.me/200000000000" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-red-400">+20 000 000 0000</a>
          </p>
          <p className="text-sm">
            {t("email")}: <a href="mailto:info@exoterior.com" className="transition-colors duration-200 hover:text-red-400">info@exoterior.com</a>
          </p>
        </div>
        <div className="text-start">
          <p className="font-semibold text-white">{t("links")}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm">
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
