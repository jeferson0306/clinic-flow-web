"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { scheduleAppointment } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import type { Doctor, Patient, Procedure, TimeSlot } from "@/lib/types";

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} disabled={disabled} className="w-full mt-1">
      {t("common.create")}
    </Button>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ScheduleDialog({
  patients,
  doctors,
  procedures,
}: {
  patients: Patient[];
  doctors: Doctor[];
  procedures: Procedure[];
}) {
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [procedureId, setProcedureId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { t } = useTranslation();

  const canFetchSlots = open && Boolean(doctorId) && Boolean(procedureId) && Boolean(date);

  useEffect(() => {
    // Deliberately not calling setSlots([]) here: when a selection is
    // incomplete, `slots` for rendering is derived below as `[]` directly
    // rather than mirrored into state — one fewer render, and nothing to
    // keep in sync with this effect's own dependencies.
    if (!canFetchSlots) return;

    let cancelled = false;
    // Kicking off the loading flag for the request this effect starts right
    // below — not mirroring a prop/state value, which is what this rule
    // otherwise guards against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true);
    setSelectedSlot("");
    fetch(`/api/availability?doctorId=${doctorId}&procedureId=${procedureId}&date=${date}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { freeSlots: TimeSlot[] }) => {
        if (!cancelled) setSlots(data.freeSlots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canFetchSlots, doctorId, procedureId, date]);

  const visibleSlots = canFetchSlots ? slots : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPatientId("");
          setDoctorId("");
          setProcedureId("");
          setSelectedSlot("");
        }
      }}
      trigger={
        <Button size="sm">
          <Plus size={14} /> {t("appointments.new")}
        </Button>
      }
      title={t("appointments.new")}
      description={t("appointments.subtitle")}
    >
      <form
        action={async (formData) => {
          const result = await scheduleAppointment({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("appointments.create_success"));
            setOpen(false);
          } else if (result.error === "CONFLICT") {
            toast.error(t("appointments.double_booking"));
          } else {
            toast.error(t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <Select
          label={t("appointments.patient")}
          name="patientId"
          required
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        >
          <option value="" disabled>
            {t("common.search")}...
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </Select>

        <Select
          label={t("appointments.doctor")}
          name="doctorId"
          required
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        >
          <option value="" disabled>
            {t("common.search")}...
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName} — {d.specialty}
            </option>
          ))}
        </Select>

        <Select
          label={t("appointments.procedure")}
          name="procedureId"
          required
          value={procedureId}
          onChange={(e) => setProcedureId(e.target.value)}
        >
          <option value="" disabled>
            {t("common.search")}...
          </option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.durationMinutes} min)
            </option>
          ))}
        </Select>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="appt-date" className="text-xs font-semibold text-[var(--text-secondary)]">
            {t("appointments.date")}
          </label>
          <input
            id="appt-date"
            type="date"
            value={date}
            min={todayIso()}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{t("appointments.slot")}</span>
          {!doctorId || !procedureId ? (
            <p className="text-xs text-[var(--text-muted)]">{t("appointments.pick_doctor_first")}</p>
          ) : loadingSlots ? (
            <p className="text-xs text-[var(--text-muted)]">{t("common.loading")}</p>
          ) : visibleSlots.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">{t("appointments.no_slots")}</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {visibleSlots.map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => setSelectedSlot(slot.startsAt)}
                  className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    selectedSlot === slot.startsAt
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {formatTime(slot.startsAt)}
                </button>
              ))}
            </div>
          )}
        </div>

        <input type="hidden" name="startsAt" value={selectedSlot} />
        <SubmitButton disabled={!selectedSlot} />
      </form>
    </Dialog>
  );
}
