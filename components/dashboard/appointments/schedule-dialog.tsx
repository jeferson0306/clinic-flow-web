"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { scheduleAppointment } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Dialog } from "@/components/ui/dialog";
import { useAvailability } from "@/lib/hooks/use-availability";
import { useTranslation } from "@/lib/i18n";
import type { Doctor, Patient, Procedure } from "@/lib/types";

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
  const [selectedSlot, setSelectedSlot] = useState("");
  const { t } = useTranslation();

  const { data, isFetching } = useAvailability(doctorId, procedureId, date, open);
  const slots = data?.freeSlots ?? [];

  useEffect(() => {
    // "Adjusting state when a prop changes" — one of the effect uses React's
    // own docs call out as legitimate, not the anti-pattern this rule
    // otherwise targets: the previously selected slot almost never survives
    // a change to any of the inputs that determine which slots exist, and
    // submitting a startsAt no longer in the visible list would be wrong.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSlot("");
  }, [doctorId, procedureId, date]);

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
        className="flex flex-col gap-3" noValidate
      >
        <Combobox
          label={t("appointments.patient")}
          name="patientId"
          required
          value={patientId}
          onChange={setPatientId}
          placeholder={`${t("common.search")}...`}
          emptyLabel={t("common.empty")}
          options={patients.map((p) => ({ value: p.id, label: p.fullName, hint: p.email }))}
        />

        <Combobox
          label={t("appointments.doctor")}
          name="doctorId"
          required
          value={doctorId}
          onChange={setDoctorId}
          placeholder={`${t("common.search")}...`}
          emptyLabel={t("common.empty")}
          options={doctors.map((d) => ({ value: d.id, label: d.fullName, hint: d.specialty }))}
        />

        <Combobox
          label={t("appointments.procedure")}
          name="procedureId"
          required
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
          ) : isFetching ? (
            <p className="text-xs text-[var(--text-muted)]">{t("common.loading")}</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">{t("appointments.no_slots")}</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {slots.map((slot) => (
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
