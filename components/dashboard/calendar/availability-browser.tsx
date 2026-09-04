"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Select } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import type { Doctor, Procedure, TimeSlot } from "@/lib/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function AvailabilityBrowser({ doctors, procedures }: { doctors: Doctor[]; procedures: Procedure[] }) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [procedureId, setProcedureId] = useState(procedures[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const canFetchSlots = Boolean(doctorId) && Boolean(procedureId) && Boolean(date);

  useEffect(() => {
    // See ScheduleDialog's identical comment: an incomplete selection
    // renders `[]` directly below rather than being mirrored into state.
    if (!canFetchSlots) return;

    let cancelled = false;
    // Same as ScheduleDialog: this kicks off the fetch started right below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/availability?doctorId=${doctorId}&procedureId=${procedureId}&date=${date}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { freeSlots: TimeSlot[] }) => {
        if (!cancelled) setSlots(data.freeSlots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canFetchSlots, doctorId, procedureId, date]);

  const visibleSlots = canFetchSlots ? slots : [];

  if (doctors.length === 0 || procedures.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
        {t("common.empty")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select label={t("calendar.select_doctor")} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName} — {d.specialty}
            </option>
          ))}
        </Select>
        <Select
          label={t("calendar.select_procedure")}
          value={procedureId}
          onChange={(e) => setProcedureId(e.target.value)}
        >
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.durationMinutes} min)
            </option>
          ))}
        </Select>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cal-date" className="text-xs font-semibold text-[var(--text-secondary)]">
            {t("appointments.date")}
          </label>
          <input
            id="cal-date"
            type="date"
            value={date}
            min={todayIso()}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      <div className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 min-h-[120px]">
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">{t("common.loading")}</p>
        ) : visibleSlots.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t("appointments.no_slots")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleSlots.map((slot) => (
              <span
                key={slot.startsAt}
                className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]"
              >
                <CalendarDays size={12} className="text-[var(--accent)]" />
                {formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
