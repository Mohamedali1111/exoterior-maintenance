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
  address: string;
  mainService: MainServiceId | "";
  subServices: string[];
  notes: string;
  imageLink: string;
  appointmentConfirmed: boolean;
};

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  address: "",
  mainService: "",
  subServices: [],
  notes: "",
  imageLink: "",
  appointmentConfirmed: false,
};

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

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const a = data.address;
  const parts = [
    a?.road,
    a?.suburb || a?.neighbourhood,
    a?.city_district || a?.city || a?.town,
    a?.state,
  ].filter(Boolean);
  return parts.join(", ") || data.display_name || "";
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
    if (!formData.address.trim()) e.address = t("validation.addressRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Errors = {};
    if (!formData.mainService) e.mainService = t("validation.mainServiceRequired");
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
          const address = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude
          );
          update({ address });
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

  const selectMainService = (id: MainServiceId) => {
    update({ mainService: id, subServices: [] });
  };

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
    body.append("Address", formData.address);
    body.append("Main Service", formData.mainService ? tServices(`main.${formData.mainService}`) : "");
    body.append("Sub Services", formData.subServices.map((s) => tServices(`sub.${s}`)).join(", "));
    body.append("Notes", formData.notes);
    body.append("Image URL", formData.imageLink);
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
      <section id="booking" className="scroll-mt-20 border-t border-neutral-800 bg-neutral-950 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-lg rounded-2xl border-2 border-red-800 bg-red-950/30 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-red-400">
            {t("successTitle")}
          </h2>
          <p className="mt-3 text-neutral-400">
            {t("successMessage")}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 min-h-[48px] min-w-[160px] rounded-full bg-red-600 px-6 py-3 font-medium text-white shadow-lg shadow-red-950/30 transition-all duration-300 hover:scale-105 hover:bg-red-500"
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
      className="scroll-mt-20 border-t border-neutral-800 bg-neutral-950 px-4 py-12 sm:px-6 sm:py-16 md:py-20"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>

        <div className="mb-6 flex gap-1.5 sm:gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label="Booking progress">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ease-out ${
                s <= step ? "bg-red-600" : "bg-neutral-700"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-black/60 p-4 shadow-xl shadow-black/30 text-start sm:p-6 md:p-8 transition-all duration-300 hover:border-neutral-600 hover:shadow-red-950/10">
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
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2.5 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
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
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2.5 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("address")}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start rtl:sm:flex-row-reverse">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => update({ address: e.target.value })}
                    placeholder={t("addressPlaceholder")}
                    className="min-h-[44px] flex-1 rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2.5 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                    dir={isAr ? "rtl" : "ltr"}
                  />
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locationLoading}
                    className="min-h-[44px] shrink-0 rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-700 disabled:opacity-50 text-start"
                  >
                    {locationLoading ? "…" : t("useMyLocation")}
                  </button>
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.address}</p>
                )}
                {locationError && (
                  <p className="mt-1 text-sm text-amber-500 text-start">{locationError}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6 text-start">
              <h3 className="text-lg font-semibold text-white text-start">
                {t("step2")}
              </h3>
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-300 text-start">
                  {t("mainService")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {MAIN_SERVICES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectMainService(id)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px] sm:min-h-0 text-start ${
                        formData.mainService === id
                          ? "border-red-600 bg-red-900/30 text-red-300 ring-2 ring-red-500/30"
                          : "border-neutral-600 bg-neutral-900 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
                      }`}
                    >
                      {tServices(`main.${id}`)}
                    </button>
                  ))}
                </div>
                {errors.mainService && (
                  <p className="mt-1 text-sm text-red-500">{errors.mainService}</p>
                )}
              </div>
              {formData.mainService && (
                <div>
                  <p className="mb-2 text-sm font-medium text-neutral-300 text-start">
                    {t("subServices")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUB_SERVICES[formData.mainService].map((id) => (
                      <label key={id} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-neutral-600 px-3 py-2.5 transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-800/50">
                        <input
                          type="checkbox"
                          checked={formData.subServices.includes(id)}
                          onChange={() => toggleSubService(id)}
                          className="h-5 w-5 shrink-0 rounded border-neutral-500 text-red-600"
                        />
                        <span className="text-sm text-neutral-200">
                          {tServices(`sub.${id}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.subServices && (
                    <p className="mt-1 text-sm text-red-500">{errors.subServices}</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("notes")}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder={t("notesPlaceholder")}
                  rows={3}
                  className="mt-1 min-h-[80px] w-full rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2.5 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("imageLink")}
                </label>
                <input
                  type="url"
                  value={formData.imageLink}
                  onChange={(e) => update({ imageLink: e.target.value })}
                  placeholder={t("imageLinkPlaceholder")}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2.5 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
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
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white shadow-lg shadow-red-950/30 transition-all duration-300 hover:scale-105 hover:bg-red-500 hover:shadow-red-500/25"
              >
                {t("selectAppointment")}
              </a>
              <p className="text-xs text-neutral-500">
                {t("selectAppointmentHelp")}
              </p>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
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
                <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
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
                  <dt className="text-neutral-500 text-start">{t("address")}</dt>
                  <dd className="font-medium text-white text-start">{formData.address}</dd>
                </div>
                {formData.mainService && (
                  <>
                    <div>
                      <dt className="text-neutral-500 text-start">{t("mainService")}</dt>
                      <dd className="font-medium text-white text-start">
                        {tServices(`main.${formData.mainService}`)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500 text-start">{t("subServices")}</dt>
                      <dd className="font-medium text-white text-start">
                        {formData.subServices.map((s) => tServices(`sub.${s}`)).join(", ")}
                      </dd>
                    </div>
                  </>
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
              className="min-h-[48px] rounded-lg border border-neutral-600 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-800 text-start rtl:order-1"
            >
              {t("back")}
            </button>
            {step < STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[48px] rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition-all duration-300 hover:scale-105 hover:bg-red-500 active:scale-100 text-start rtl:order-2"
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
                  className="min-h-[48px] w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition-all duration-300 hover:scale-105 hover:bg-red-500 disabled:opacity-50 disabled:hover:scale-100 sm:w-auto text-start"
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
