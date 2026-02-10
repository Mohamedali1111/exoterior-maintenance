"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MAIN_SERVICES, SUB_SERVICES, type MainServiceId } from "@/lib/services";
import { EGYPT_PHONE_REGEX, GOOGLE_CALENDAR_APPOINTMENT_LINK, FORMSUBMIT_EMAIL, GOVERNORATE_IDS } from "@/lib/constants";

const STEPS = 4;

type FormData = {
  fullName: string;
  phone: string;
  governorate: string;
  addressLine: string;
  subServices: string[];
  notes: string;
  appointmentConfirmed: boolean;
};

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  governorate: "",
  addressLine: "",
  subServices: [],
  notes: "",
  appointmentConfirmed: false,
};

type Errors = Partial<Record<keyof FormData, string>>;

type GeocodedAddress = { governorate: string; addressLine: string };

const GOVERNORATE_MATCH: Record<string, string> = {
  cairo: "cairo", القاهرة: "cairo", "al qahirah": "cairo",
  giza: "giza", الجيزة: "giza",
  alexandria: "alexandria", الإسكندرية: "alexandria",
  dakahlia: "dakahlia", الدقهلية: "dakahlia",
  "red sea": "red_sea", "red sea governorate": "red_sea",
  beheira: "beheira", البحيرة: "beheira",
  fayoum: "fayoum", الفيوم: "fayoum",
  gharbia: "gharbia", الغربية: "gharbia",
  ismailia: "ismailia", الإسماعيلية: "ismailia",
  menoufia: "menoufia", المنوفية: "menoufia",
  minya: "minya", المنيا: "minya",
  qalyubia: "qalyubia", القليوبية: "qalyubia",
  qena: "qena", sohag: "sohag", سوهاج: "sohag",
  "beni suef": "beni_suef", "bani suwayf": "beni_suef",
  aswan: "aswan", أسوان: "aswan",
  asyut: "asyut", أسيوط: "asyut", assiut: "asyut",
  damietta: "damietta", دمياط: "damietta",
  "kafr el sheikh": "kafr_el_sheikh", "kafr el-sheikh": "kafr_el_sheikh",
  luxor: "luxor", الأقصر: "luxor",
  matrouh: "matrouh", مطروح: "matrouh",
  "new valley": "new_valley", "al wadi al jadid": "new_valley",
  "north sinai": "north_sinai", "port said": "port_said", بورسعيد: "port_said",
  "south sinai": "south_sinai", suez: "suez", السويس: "suez",
};

function matchGovernorate(name: string): string {
  if (!name) return "";
  const key = name.toLowerCase().trim();
  return GOVERNORATE_MATCH[key] || "";
}

async function reverseGeocode(lat: number, lon: number): Promise<GeocodedAddress> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const a = data.address || {};
  const state = (a.state || a.county || "").toString();
  const city = (a.city || a.town || a.village || "").toString();
  const governorateId = matchGovernorate(state) || matchGovernorate(city);
  const streetPart = [a.road, a.house_number].filter(Boolean).join(" ");
  const areaPart = a.suburb || a.neighbourhood || a.city_district || "";
  const addressLine = [streetPart, areaPart, city].filter(Boolean).join(", ") || data.display_name || "";
  return {
    governorate: governorateId || state || city,
    addressLine: addressLine || state || city,
  };
}

export default function BookingForm() {
  const t = useTranslations("booking");
  const tServices = useTranslations("services");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<MainServiceId | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(updates) as (keyof FormData)[]) next[k] = undefined;
      return next;
    });
  };

  const validateStep1 = (): boolean => {
    const e: Errors = {};
    if (!formData.fullName.trim()) e.fullName = t("validation.nameRequired");
    if (!formData.phone.trim()) e.phone = t("validation.phoneRequired");
    else if (!EGYPT_PHONE_REGEX.test(formData.phone.replace(/\s/g, "")))
      e.phone = t("validation.phoneInvalid");
    if (!formData.governorate.trim()) e.governorate = t("validation.addressRequired");
    if (!formData.addressLine.trim()) e.addressLine = t("validation.addressRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Errors = {};
    if (formData.subServices.length === 0)
      e.subServices = t("validation.subServiceRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: Errors = {};
    if (!formData.appointmentConfirmed)
      e.appointmentConfirmed = t("validation.appointmentConfirmedRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < STEPS) setStep((s) => s + 1);
  };

  const handleUseLocation = () => {
    setLocationError(null);
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { governorate: gov, addressLine: line } = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          update({
            governorate: GOVERNORATE_IDS.includes(gov as typeof GOVERNORATE_IDS[number]) ? gov : formData.governorate,
            addressLine: line || formData.addressLine,
          });
        } catch {
          setLocationError("Could not get address");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Location denied or unavailable");
        setLocationLoading(false);
      }
    );
  };

  const toggleSubService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subServices: prev.subServices.includes(id)
        ? prev.subServices.filter((s) => s !== id)
        : [...prev.subServices, id],
    }));
    setErrors((prev) => ({ ...prev, subServices: undefined }));
  };

  const toggleCategory = (id: MainServiceId) => {
    setExpandedCategory((prev) => (prev === id ? null : id));
  };

  const governorateLabel = formData.governorate
    ? (GOVERNORATE_IDS.includes(formData.governorate as (typeof GOVERNORATE_IDS)[number])
        ? t(`governorates.${formData.governorate}`)
        : formData.governorate)
    : "";
  const fullAddressDisplay = [governorateLabel, formData.addressLine].filter(Boolean).join(", ");

  const handleSubmit = async () => {
    if (step !== STEPS) return;
    setSubmitError(null);
    setSubmitLoading(true);
    const body = new FormData();
    body.append("_subject", "Exoterior – New booking request");
    body.append("_captcha", "false");
    body.append("Full Name", formData.fullName);
    body.append("Phone", formData.phone);
    body.append("Address", fullAddressDisplay);
    body.append("Services", formData.subServices.map((s) => tServices(`sub.${s}`)).join(", "));
    body.append("Notes", formData.notes);
    try {
      const res = await fetch(`https://formsubmit.co/${FORMSUBMIT_EMAIL}`, {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="booking" className="scroll-mt-20 border-t border-neutral-600/40 px-4 py-12 sm:py-16 pb-[max(3rem,env(safe-area-inset-bottom))]">
        <div className="card-surface mx-auto max-w-lg rounded-2xl border-red-500/30 bg-red-950/20 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-red-400">
            {t("successTitle")}
          </h2>
          <p className="mt-3 text-neutral-400">
            {t("successMessage")}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 min-h-[52px] min-w-[180px] rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98]"
          >
            {t("successCta")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="booking"
      className="scroll-mt-20 border-t border-neutral-600/40 px-4 py-14 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold leading-tight text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>

        <div className="mt-8 flex gap-2 sm:gap-2.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label="Booking progress">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2.5 flex-1 rounded-full transition-all duration-500 ease-out sm:h-2 ${
                s <= step ? "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.4)]" : "bg-white/[0.12]"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <div className="mt-8 card-surface rounded-2xl p-5 text-start sm:p-6 md:p-8 transition-all duration-300">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5 text-start">
              <h3 className="text-lg font-semibold text-white text-start pb-1">
                {t("step1")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => update({ fullName: e.target.value })}
                  placeholder={t("fullNamePlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full touch-manipulation rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  placeholder={t("phonePlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full touch-manipulation rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("governorate")}
                </label>
                <select
                  value={formData.governorate}
                  onChange={(e) => update({ governorate: e.target.value })}
                  className="mt-1.5 min-h-[48px] w-full touch-manipulation appearance-none rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start [&>option]:bg-neutral-900 [&>option]:text-white"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <option value="">{t("governoratePlaceholder")}</option>
                  {GOVERNORATE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t(`governorates.${id}`)}
                    </option>
                  ))}
                </select>
                {errors.governorate && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.governorate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("fullAddress")}
                </label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={(e) => update({ addressLine: e.target.value })}
                  placeholder={t("fullAddressPlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full touch-manipulation rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
                {errors.addressLine && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.addressLine}</p>
                )}
              </div>

              {/* Use my location – map-style card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-neutral-900/80 to-neutral-950/90 p-0">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(220,38,38,0.06)_50%,transparent_100%)] pointer-events-none" aria-hidden />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6">
                  <div className="flex shrink-0 items-center justify-center rounded-xl bg-red-950/40 p-4 ring-1 ring-red-500/20">
                    <svg className="w-10 h-10 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <h4 className="font-semibold text-white">
                      {t("useMyLocationTitle")}
                    </h4>
                    <p className="mt-1 text-sm text-neutral-400">
                      {t("useMyLocationDesc")}
                    </p>
                    {locationError && (
                      <p className="mt-2 text-sm text-amber-500">{locationError}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locationLoading}
                    className="shrink-0 min-h-[48px] touch-manipulation rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {locationLoading ? t("useMyLocationDetecting") : t("useMyLocation")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6 text-start">
              <h3 className="text-lg font-semibold text-white text-start pb-1">
                {t("step2")}
              </h3>
              <p className="text-sm text-neutral-400 text-start">
                {t("categories")} — {t("expandCategory")}
              </p>
              <div className="space-y-2">
                {MAIN_SERVICES.map((mainId) => (
                  <div
                    key={mainId}
                    className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all duration-200 hover:border-white/[0.12]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(mainId)}
                      className={`flex w-full min-h-[48px] touch-manipulation items-center justify-between px-4 py-3.5 text-start transition-colors sm:min-h-[52px] ${
                        expandedCategory === mainId
                          ? "border-b border-white/[0.08] bg-white/[0.05] text-red-400"
                          : "text-neutral-200 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="font-medium">{tServices(`main.${mainId}`)}</span>
                      <span className="text-lg text-neutral-500" aria-hidden>
                        {expandedCategory === mainId ? "−" : "+"}
                      </span>
                    </button>
                    {expandedCategory === mainId && (
                      <div className="border-t border-white/[0.06] p-3 pt-2">
                        <p className="mb-2 text-xs font-medium text-neutral-500 text-start">
                          {t("subServices")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SUB_SERVICES[mainId].map((subId) => (
                            <label
                              key={subId}
                              className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.99]"
                            >
                              <input
                                type="checkbox"
                                checked={formData.subServices.includes(subId)}
                                onChange={() => toggleSubService(subId)}
                                className="h-4 w-4 shrink-0 rounded border-neutral-500 text-red-600"
                              />
                              <span className="text-sm text-neutral-200">
                                {tServices(`sub.${subId}`)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {errors.subServices && (
                  <p className="mt-2 text-sm text-red-500 text-start">{errors.subServices}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("notes")}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder={t("notesPlaceholder")}
                  rows={3}
                  className="mt-1.5 min-h-[88px] w-full touch-manipulation rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6 text-start">
              <h3 className="text-lg font-semibold text-white text-start pb-1">
                {t("step3")}
              </h3>
              <p className="text-sm text-neutral-400">
                {t("appointmentDuration")}
              </p>
              <a
                href={GOOGLE_CALENDAR_APPOINTMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98]"
              >
                {t("selectAppointment")}
              </a>
              <p className="text-xs text-neutral-500">
                {t("selectAppointmentHelp")}
              </p>
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.appointmentConfirmed}
                  onChange={(e) =>
                    update({ appointmentConfirmed: e.target.checked })
                  }
                  className="h-5 w-5 shrink-0 rounded border-neutral-500 text-red-600"
                />
                <span className="text-sm font-medium text-neutral-200">
                  {t("iBookedAppointment")}
                </span>
              </label>
              {errors.appointmentConfirmed && (
                <p className="text-sm text-red-500">{errors.appointmentConfirmed}</p>
              )}
              <div className="rounded-xl border border-white/[0.12] bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-neutral-200">
                  {t("paymentMethods")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {t("paymentMethodsDesc")}
                </p>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6 text-start">
              <h3 className="text-lg font-semibold text-white text-start pb-1">
                {t("reviewSummary")}
              </h3>
              <dl className="space-y-2 text-sm text-start">
                <div>
                  <dt className="text-neutral-500 text-start">{t("fullName")}</dt>
                  <dd className="font-medium text-white text-start">{formData.fullName}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 text-start">{t("phone")}</dt>
                  <dd className="font-medium text-white text-start" dir="ltr">{formData.phone}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 text-start">{t("fullAddress")}</dt>
                  <dd className="font-medium text-white text-start">{fullAddressDisplay || "—"}</dd>
                </div>
                {formData.subServices.length > 0 && (
                  <div>
                    <dt className="text-neutral-500 text-start">{t("subServices")}</dt>
                    <dd className="font-medium text-white text-start">
                      {formData.subServices.map((s) => tServices(`sub.${s}`)).join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="text-sm text-neutral-400 text-start">
                {t("contactAfterSubmit")}
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="min-h-[48px] touch-manipulation rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-neutral-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98] text-start rtl:order-1 sm:min-h-[52px]"
            >
              {t("back")}
            </button>
            {step < STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[48px] touch-manipulation rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] text-start rtl:order-2 sm:min-h-[52px]"
              >
                {t("next")}
              </button>
            ) : (
              <div className="rtl:order-2 sm:inline">
                {submitError && (
                  <p className="mb-2 text-sm text-red-500 text-start">{submitError}</p>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="min-h-[48px] touch-manipulation w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 sm:min-h-[52px] sm:w-auto text-start"
                >
                  {submitLoading ? "…" : t("submit")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
