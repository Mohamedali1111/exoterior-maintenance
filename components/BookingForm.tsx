"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  MAIN_SERVICES,
  SUB_SERVICES,
  SUB_SERVICE_ESTIMATES,
  type MainServiceId,
} from "@/lib/services";
import { EGYPT_PHONE_REGEX, GOOGLE_CALENDAR_APPOINTMENT_LINK, FORMSUBMIT_EMAIL } from "@/lib/constants";

const STEPS = 4;

type FormData = {
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  building: string;
  subServices: string[];
  notes: string;
  appointmentConfirmed: boolean;
};

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  street: "",
  area: "",
  city: "",
  building: "",
  subServices: [],
  notes: "",
  appointmentConfirmed: false,
};

function formatFullAddress(data: { street: string; area: string; city: string; building: string }): string {
  return [data.street, data.area, data.city, data.building].filter(Boolean).join(", ") || "";
}

type Errors = Partial<Record<keyof FormData, string>>;

function getEstimatedRange(subServiceIds: string[]): [number, number] | null {
  if (subServiceIds.length === 0) return null;
  let min = 0;
  let max = 0;
  for (const id of subServiceIds) {
    const range = SUB_SERVICE_ESTIMATES[id];
    if (range) {
      min += range[0];
      max += range[1];
    }
  }
  return min && max ? [min, max] : null;
}

type GeocodedAddress = { street: string; area: string; city: string };

async function reverseGeocode(lat: number, lon: number): Promise<GeocodedAddress> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const a = data.address || {};
  return {
    street: [a.road, a.house_number].filter(Boolean).join(" ") || "",
    area: a.suburb || a.neighbourhood || a.city_district || "",
    city: a.city || a.town || a.state || "",
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
    if (!formData.street.trim()) e.street = t("validation.addressRequired");
    if (!formData.area.trim()) e.area = t("validation.addressRequired");
    if (!formData.city.trim()) e.city = t("validation.addressRequired");
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
          const { street, area, city } = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          update({ street, area, city });
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

  const fullAddress = formatFullAddress(formData);

  const estimate = getEstimatedRange(formData.subServices);

  const handleSubmit = async () => {
    if (step !== STEPS) return;
    setSubmitError(null);
    setSubmitLoading(true);
    const [min, max] = estimate || [0, 0];
    const body = new FormData();
    body.append("_subject", "Exoterior – New booking request");
    body.append("_captcha", "false");
    body.append("Full Name", formData.fullName);
    body.append("Phone", formData.phone);
    body.append("Address", fullAddress);
    body.append("Services", formData.subServices.map((s) => tServices(`sub.${s}`)).join(", "));
    body.append("Notes", formData.notes);
    body.append("Estimated Cost", `${min} - ${max} EGP`);
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
      className="scroll-mt-20 border-t border-neutral-600/40 px-4 py-12 sm:px-6 sm:py-16 md:py-20 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>

        <div className="mb-6 flex gap-2 sm:gap-2.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label="Booking progress">
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

        <div className="card-surface rounded-2xl p-4 text-start sm:p-6 md:p-8 transition-all duration-300">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4 text-start">
              <h3 className="text-lg font-semibold text-white text-start">
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
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
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
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("street")}
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => update({ street: e.target.value })}
                  placeholder={t("streetPlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
                {errors.street && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.street}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("area")}
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => update({ area: e.target.value })}
                  placeholder={t("areaPlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
                {errors.area && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.area}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("city")}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => update({ city: e.target.value })}
                  placeholder={t("cityPlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("building")}
                </label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => update({ building: e.target.value })}
                  placeholder={t("buildingPlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rtl:sm:flex-row-reverse">
                <p className="text-sm font-medium text-neutral-400 text-start">
                  {t("fullAddress")}: <span className="font-normal text-neutral-300">{fullAddress || "—"}</span>
                </p>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locationLoading}
                  className="min-h-[44px] shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50 text-start"
                >
                  {locationLoading ? "…" : t("useMyLocation")}
                </button>
              </div>
              {locationError && (
                <p className="mt-1 text-sm text-amber-500 text-start">{locationError}</p>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6 text-start">
              <h3 className="text-lg font-semibold text-white text-start">
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
                      className={`flex w-full min-h-[52px] items-center justify-between px-4 py-3 text-start transition-colors ${
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
                  className="mt-1.5 min-h-[88px] w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6 text-start">
              <h3 className="text-lg font-semibold text-white text-start">
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
              {estimate && (
                <div className="rounded-xl border border-white/[0.12] bg-white/[0.04] p-4">
                  <p className="text-sm font-medium text-neutral-300">
                    {t("estimatedCost")}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-red-400">
                    {t("estimatedCostRange", {
                      min: estimate[0],
                      max: estimate[1],
                    })}
                  </p>
                </div>
              )}
              <p className="text-sm text-neutral-400">
                {t("paymentMethod")}
              </p>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6 text-start">
              <h3 className="text-lg font-semibold text-white text-start">
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
                  <dd className="font-medium text-white text-start">{fullAddress || "—"}</dd>
                </div>
                {formData.subServices.length > 0 && (
                  <div>
                    <dt className="text-neutral-500 text-start">{t("subServices")}</dt>
                    <dd className="font-medium text-white text-start">
                      {formData.subServices.map((s) => tServices(`sub.${s}`)).join(", ")}
                    </dd>
                  </div>
                )}
                {estimate && (
                  <div>
                    <dt className="text-neutral-500 text-start">{t("estimatedCost")}</dt>
                    <dd className="font-medium text-red-400 text-start">
                      {t("estimatedCostRange", { min: estimate[0], max: estimate[1] })}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="text-sm text-neutral-400 text-start">
                {t("contactAfterSubmit")}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="min-h-[52px] rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-sm font-medium text-neutral-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98] text-start rtl:order-1"
            >
              {t("back")}
            </button>
            {step < STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[52px] rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] text-start rtl:order-2"
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
                  className="min-h-[52px] w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 sm:w-auto text-start"
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
