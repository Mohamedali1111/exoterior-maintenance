"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MAIN_SERVICES, type MainServiceId } from "@/lib/services";
import { EGYPT_PHONE_REGEX, FORMSUBMIT_EMAIL, APPOINTMENT_TIME_SLOTS, APPOINTMENT_DAYS_AHEAD, slotEndTime } from "@/lib/constants";

const STEPS = 4;

type FormData = {
  fullName: string;
  phone: string;
  addressLine: string;
  subServices: string[];
  notes: string;
  appointmentDate: string;
  appointmentTime: string;
};

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  addressLine: "",
  subServices: [],
  notes: "",
  appointmentDate: "",
  appointmentTime: "",
};

type Errors = Partial<Record<keyof FormData, string>>;

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const a = data.address || {};
  const streetPart = [a.road, a.house_number].filter(Boolean).join(" ");
  const areaPart = a.suburb || a.neighbourhood || a.city_district || "";
  const city = (a.city || a.town || a.village || "").toString();
  const addressLine = [streetPart, areaPart, city].filter(Boolean).join(", ") || data.display_name || "";
  return addressLine || (a.state || a.county || "").toString();
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
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotStorageActive, setSlotStorageActive] = useState<boolean | null>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!formData.appointmentDate) {
      setTakenSlots([]);
      setSlotStorageActive(null);
      return;
    }
    setSlotsLoading(true);
    fetch(`/api/slots?date=${formData.appointmentDate}`)
      .then((r) => r.json())
      .then((data) => {
        setTakenSlots(data.taken ?? []);
        setSlotStorageActive(data.storage === true);
      })
      .catch(() => {
        setTakenSlots([]);
        setSlotStorageActive(false);
      })
      .finally(() => setSlotsLoading(false));
  }, [formData.appointmentDate]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    formScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

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
    if (!formData.addressLine.trim()) e.addressLine = t("validation.addressRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Errors = {};
    if (formData.subServices.length === 0)
      e.subServices = t("validation.serviceRequired");
    if (!formData.notes.trim())
      e.notes = t("validation.problemRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: Errors = {};
    if (!formData.appointmentDate) e.appointmentDate = t("validation.dateRequired");
    if (!formData.appointmentTime) e.appointmentTime = t("validation.timeRequired");
    if (formData.appointmentDate && formData.appointmentTime && takenSlots.includes(formData.appointmentTime))
      e.appointmentTime = t("validation.slotTaken");
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
          const line = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          update({ addressLine: line || formData.addressLine });
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

  const toggleMainService = (id: MainServiceId) => {
    setFormData((prev) => ({
      ...prev,
      subServices: prev.subServices.includes(id)
        ? prev.subServices.filter((s) => s !== id)
        : [...prev.subServices, id],
    }));
    setErrors((prev) => ({ ...prev, subServices: undefined, notes: undefined }));
  };

  const handleSubmit = async () => {
    if (step !== STEPS) return;
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      // Recheck slot right before submit to avoid double-book (when storage is active)
      const slotsRes = await fetch(`/api/slots?date=${formData.appointmentDate}`);
      const slotsData = await slotsRes.json().catch(() => ({}));
      const taken = slotsData.taken ?? [];
      if (taken.includes(formData.appointmentTime)) {
        setSubmitError(t("validation.slotJustBooked"));
        setTakenSlots((prev) => (prev.includes(formData.appointmentTime) ? prev : [...prev, formData.appointmentTime]));
        setSubmitLoading(false);
        return;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.appointmentDate,
          timeSlot: formData.appointmentTime,
          fullName: formData.fullName,
          phone: formData.phone,
          governorate: "",
          addressLine: formData.addressLine,
          subServices: formData.subServices,
          notes: formData.notes,
        }),
      });
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error || t("validation.slotJustBooked"));
        setTakenSlots((prev) => [...prev, formData.appointmentTime]);
        update({ appointmentTime: "" });
        setSubmitLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Book failed");

      const servicesList = formData.subServices.map((s) => tServices(`main.${s}`)).join(", ");
      const appointmentDateFormatted = new Date(formData.appointmentDate + "T12:00:00").toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const slotEnd = slotEndTime(formData.appointmentTime);
      const submittedAt = new Date().toLocaleString(locale === "ar" ? "ar-EG" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const emailDetails = [
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "  EXOTERIOR – NEW BOOKING REQUEST",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "► CONTACT INFORMATION",
        "  Full name: " + formData.fullName,
        "  Phone: " + formData.phone,
        "  Address: " + formData.addressLine,
        "",
        "► SERVICES REQUESTED",
        "  " + servicesList,
        "",
        "► PROBLEM / DESCRIPTION",
        "  " + (formData.notes.trim() || "(none)"),
        "",
        "► APPOINTMENT",
        "  Date: " + appointmentDateFormatted,
        "  Time slot: " + formData.appointmentTime + " – " + slotEnd + " (1 hour)",
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "Submitted: " + submittedAt,
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      ].join("\r\n");

      const emailBody = new FormData();
      emailBody.append("_subject", "Exoterior – Booking: " + formData.appointmentDate + " at " + formData.appointmentTime + " – " + formData.fullName);
      emailBody.append("_captcha", "false");
      emailBody.append("Booking details", emailDetails);
      await fetch(`https://formsubmit.co/${FORMSUBMIT_EMAIL}`, { method: "POST", body: emailBody });
      setSubmitted(true);
    } catch {
      setSubmitError(t("validation.submitFailed"));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="booking" className="scroll-mt-20 overflow-x-hidden border-t border-neutral-600/40 px-4 py-10 sm:py-14 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="card-surface mx-auto max-w-lg min-w-0 rounded-2xl border-red-500/30 bg-red-950/20 p-5 text-center sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-red-400">
            {t("successTitle")}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 break-words">
            {t("successMessage")}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 min-h-[48px] w-full sm:w-auto sm:min-w-[180px] touch-manipulation rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98]"
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
      className="scroll-mt-20 overflow-x-hidden border-t border-neutral-600/40 px-4 py-10 sm:px-6 sm:py-14 md:py-16 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div ref={formScrollRef} className="mx-auto max-w-2xl min-w-0 scroll-mt-24">
        <h2 className="text-center text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl animate-[fade-in-up_0.6s_ease-out_both]">
          {t("title")}
        </h2>

        <div className="mt-6 sm:mt-8 flex gap-1.5 sm:gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label="Booking progress">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 min-w-0 rounded-full transition-all duration-500 ease-out sm:h-2.5 ${
                s <= step ? "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.4)]" : "bg-white/12"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <div className="mt-6 sm:mt-8 card-surface rounded-2xl p-4 text-start sm:p-6 md:p-8 transition-all duration-300 min-w-0 overflow-hidden w-full max-w-full box-border">
          {/* Step 1 – mobile-first inputs */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5 text-start">
              <h3 className="text-base sm:text-lg font-semibold text-white text-start pb-1">
                {t("step1")}
              </h3>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => update({ fullName: e.target.value })}
                  placeholder={t("fullNamePlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full max-w-full touch-manipulation rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.fullName}</p>
                )}
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  placeholder={t("phonePlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full max-w-full touch-manipulation rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.phone}</p>
                )}
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("address")}
                </label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={(e) => update({ addressLine: e.target.value })}
                  placeholder={t("addressPlaceholder")}
                  className="mt-1.5 min-h-[48px] w-full max-w-full touch-manipulation rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                  dir={isAr ? "rtl" : "ltr"}
                />
                {errors.addressLine && (
                  <p className="mt-1 text-sm text-red-500 text-start">{errors.addressLine}</p>
                )}
              </div>

              {/* Use my location – map-style card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900/80 to-neutral-950/90 p-0 min-w-0">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(220,38,38,0.06)_50%,transparent_100%)] pointer-events-none" aria-hidden />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6">
                  <div className="flex shrink-0 items-center justify-center rounded-xl bg-red-950/40 p-3 sm:p-4 ring-1 ring-red-500/20">
                    <svg className="w-9 h-9 sm:w-10 sm:h-10 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <h4 className="font-semibold text-white text-sm sm:text-base">
                      {t("useMyLocationTitle")}
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                      {t("useMyLocationDescAddress")}
                    </p>
                    {locationError && (
                      <p className="mt-2 text-sm text-amber-500">{locationError}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locationLoading}
                    className="shrink-0 min-h-[48px] min-w-[140px] touch-manipulation rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {locationLoading ? t("useMyLocationDetecting") : t("useMyLocation")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – choose main service(s) stacked, then describe problem */}
          {step === 2 && (
            <div className="space-y-5 sm:space-y-6 text-start min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white text-start pb-1">
                {t("step2")}
              </h3>
              <p className="text-sm text-neutral-400 text-start">
                {t("chooseServiceHint")}
              </p>
              <div className="space-y-2 sm:space-y-2.5">
                {MAIN_SERVICES.map((mainId) => {
                  const selected = formData.subServices.includes(mainId);
                  return (
                    <button
                      key={mainId}
                      type="button"
                      onClick={() => toggleMainService(mainId)}
                      className={`flex w-full min-h-[52px] sm:min-h-[56px] touch-manipulation items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-start transition-all duration-200 active:scale-[0.99] ${
                        selected
                          ? "border-red-500 bg-red-600/90 text-white shadow-lg shadow-red-950/40 ring-1 ring-red-400/30"
                          : "border-white/15 bg-white/5 text-neutral-200 hover:border-white/25 hover:bg-white/8"
                      }`}
                    >
                      <span className="font-medium text-sm sm:text-base truncate">
                        {tServices(`main.${mainId}`)}
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          selected
                            ? "border-white bg-white/20 text-white"
                            : "border-neutral-500 text-transparent"
                        }`}
                        aria-hidden
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.subServices && (
                <p className="text-sm text-red-500 text-start">{errors.subServices}</p>
              )}
              {formData.subServices.length > 0 && (
                <div className="min-w-0 pt-1">
                  <label className="block text-sm font-medium text-neutral-300 text-start mb-1.5">
                    {t("describeProblem")}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    placeholder={t("describeProblemPlaceholder")}
                    rows={4}
                    className="min-h-[112px] w-full max-w-full touch-manipulation rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-neutral-500 transition-all duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-start"
                    dir={isAr ? "rtl" : "ltr"}
                  />
                  {errors.notes && (
                    <p className="mt-1.5 text-sm text-red-500 text-start">{errors.notes}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3 – Date & time: 1-hour slots, mobile-friendly calendar */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-6 text-start min-w-0 overflow-hidden">
              <h3 className="text-base sm:text-lg font-semibold text-white text-start pb-1">
                {t("step3")}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 text-start">
                {t("appointmentDuration")}
              </p>

              {/* Notice when slot storage not active (no Supabase) */}
              {formData.appointmentDate && slotStorageActive === false && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-start min-w-0" role="status">
                  <p className="text-sm text-amber-200 break-words">
                    {t("slotStorageNotice")}
                  </p>
                </div>
              )}

              {/* Date – constrained to form width, aligned with other fields */}
              <div className="min-w-0 w-full overflow-hidden">
                <label htmlFor="booking-date" className="block text-sm font-medium text-neutral-300 text-start mb-1.5">
                  {t("pickDate")}
                </label>
                <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-white/12 bg-white/5 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/30 [color-scheme:dark]">
                  <input
                    id="booking-date"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => update({ appointmentDate: e.target.value, appointmentTime: "" })}
                    min={new Date().toISOString().slice(0, 10)}
                    max={
                      new Date(Date.now() + APPOINTMENT_DAYS_AHEAD * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 10)
                    }
                    className="block w-full min-w-0 max-w-full min-h-[48px] sm:min-h-[52px] touch-manipulation rounded-xl border-0 bg-transparent px-4 py-3 text-base text-white outline-none text-start [color-scheme:dark]"
                    dir="ltr"
                    style={{ boxSizing: "border-box" }}
                    aria-describedby={errors.appointmentDate ? "date-error" : undefined}
                  />
                </div>
                {formData.appointmentDate && (
                  <p className="mt-2 text-xs sm:text-sm text-neutral-400 text-start break-words" aria-hidden>
                    {new Date(formData.appointmentDate + "T12:00:00").toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                {errors.appointmentDate && (
                  <p id="date-error" className="mt-1 text-sm text-red-500 text-start">{errors.appointmentDate}</p>
                )}
              </div>

              {/* Time: 1-hour slots, large touch targets on mobile */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-neutral-300 text-start">
                  {t("pickTime")}
                </label>
                {!formData.appointmentDate ? (
                  <p className="mt-2 text-sm text-neutral-500 text-start">{t("pickDateFirst")}</p>
                ) : (
                  <>
                    {slotsLoading && (
                      <p className="mt-2 text-sm text-neutral-500 text-start">{t("loadingSlots")}</p>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                      {APPOINTMENT_TIME_SLOTS.map((slot) => {
                        const taken = takenSlots.includes(slot);
                        const selected = formData.appointmentTime === slot;
                        const end = slotEndTime(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={taken || slotsLoading}
                            onClick={() => !taken && update({ appointmentTime: slot })}
                            className={`min-h-[48px] sm:min-h-[52px] touch-manipulation rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] min-w-0 ${
                              taken
                                ? "cursor-not-allowed border-white/10 bg-white/2 text-neutral-500 line-through"
                                : selected
                                  ? "border-red-500 bg-red-600 text-white shadow-lg shadow-red-950/40"
                                  : "border-white/12 bg-white/5 text-neutral-200 hover:border-red-500/50 hover:bg-red-950/30"
                            }`}
                          >
                            <span className="block truncate">{slot}</span>
                            <span className={`block text-xs truncate ${selected ? "text-red-200" : "text-neutral-500"}`}>
                              {t("slotHour")} {end}
                            </span>
                            {taken && <span className="sr-only">{t("slotBooked")}</span>}
                          </button>
                        );
                      })}
                    </div>
                    {formData.appointmentTime && (
                      <p className="mt-3 rounded-lg bg-red-950/30 border border-red-500/30 px-3 py-2.5 text-xs sm:text-sm font-medium text-red-300 text-start break-words">
                        {t("selectedSlot")}: {new Date(formData.appointmentDate + "T12:00:00").toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" })} · {formData.appointmentTime} – {slotEndTime(formData.appointmentTime)} ({t("oneHour")})
                      </p>
                    )}
                    {errors.appointmentTime && (
                      <p className="mt-1 text-sm text-red-500 text-start">{errors.appointmentTime}</p>
                    )}
                  </>
                )}
              </div>

              <div className="rounded-xl border border-white/12 bg-white/5 p-4 min-w-0">
                <p className="text-sm font-semibold text-neutral-200 text-start">
                  {t("paymentMethods")}
                </p>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-400 text-start break-words">
                  {t("paymentMethodsDesc")}
                </p>
              </div>
            </div>
          )}

          {/* Step 4 – review, word-break for long content */}
          {step === 4 && (
            <div className="space-y-4 sm:space-y-6 text-start min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white text-start pb-1">
                {t("reviewSummary")}
              </h3>
              <dl className="space-y-3 text-sm text-start">
                <div className="min-w-0 break-words">
                  <dt className="text-neutral-500 text-start">{t("fullName")}</dt>
                  <dd className="font-medium text-white text-start break-words">{formData.fullName}</dd>
                </div>
                <div className="min-w-0 break-words">
                  <dt className="text-neutral-500 text-start">{t("phone")}</dt>
                  <dd className="font-medium text-white text-start break-words" dir="ltr">{formData.phone}</dd>
                </div>
                <div className="min-w-0 break-words">
                  <dt className="text-neutral-500 text-start">{t("address")}</dt>
                  <dd className="font-medium text-white text-start break-words">{formData.addressLine || "—"}</dd>
                </div>
                {formData.subServices.length > 0 && (
                  <div className="min-w-0 break-words">
                    <dt className="text-neutral-500 text-start">{t("services")}</dt>
                    <dd className="font-medium text-white text-start break-words">
                      {formData.subServices.map((s) => tServices(`main.${s}`)).join(", ")}
                    </dd>
                  </div>
                )}
                {formData.notes.trim() && (
                  <div className="min-w-0 break-words">
                    <dt className="text-neutral-500 text-start">{t("problem")}</dt>
                    <dd className="font-medium text-white text-start break-words whitespace-pre-wrap">{formData.notes}</dd>
                  </div>
                )}
                <div className="min-w-0 break-words">
                  <dt className="text-neutral-500 text-start">{t("appointment")}</dt>
                  <dd className="font-medium text-white text-start break-words">
                    {formData.appointmentDate && formData.appointmentTime
                      ? `${formData.appointmentDate} – ${formData.appointmentTime}`
                      : "—"}
                  </dd>
                </div>
              </dl>
              <p className="text-xs sm:text-sm text-neutral-400 text-start">
                {t("contactAfterSubmit")}
              </p>
            </div>
          )}

          <div className="mt-8 sm:mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="min-h-[48px] w-full sm:w-auto touch-manipulation rounded-xl border border-white/12 bg-white/5 px-5 py-3.5 text-sm font-medium text-neutral-300 transition-all duration-200 hover:border-white/20 hover:bg-white/8 active:scale-[0.98] text-start rtl:order-1 sm:min-h-[52px]"
            >
              {t("back")}
            </button>
            {step < STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[48px] w-full sm:w-auto touch-manipulation rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] text-start rtl:order-2 sm:min-h-[52px]"
              >
                {t("next")}
              </button>
            ) : (
              <div className="w-full sm:w-auto rtl:order-2 min-w-0">
                {submitError && (
                  <p className="mb-2 text-sm text-red-500 text-start break-words">{submitError}</p>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="min-h-[48px] w-full touch-manipulation rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] disabled:opacity-50 sm:min-h-[52px] sm:w-auto text-start"
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
