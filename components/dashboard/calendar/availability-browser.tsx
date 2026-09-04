"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useAvailability } from "@/lib/hooks/use-availability";
import { useTranslation } from "@/lib/i18n";
import type { Doctor, Procedure } from "@/lib/types";

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
  const { t } = useTranslation();

  const { data, isFetching } = useAvailability(doctorId, procedureId, date);
  const slots = data?.freeSlots ?? [];

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
        <Combobox
          label={t("calendar.select_doctor")}
          value={doctorId}
          onChange={setDoctorId}
          placeholder={`${t("common.search")}...`}
          emptyLabel={t("common.empty")}
          options={doctors.map((d) => ({ value: d.id, label: d.fullName, hint: d.specialty }))}
        />
        <Combobox
          label={t("calendar.select_procedure")}
          value={procedureId}
          onChange={setProcedureId}
          placeholder={`${t("common.search")}...`}
          emptyLabel={t("common.empty")}
          options={procedures.map((p) => ({
            value: p.id,
            label: p.name,
            hint: `${p.durationMinutes} min`,
          }))}
        />
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
        {isFetching ? (
          <p className="text-sm text-[var(--text-muted)]">{t("common.loading")}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t("appointments.no_slots")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
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
