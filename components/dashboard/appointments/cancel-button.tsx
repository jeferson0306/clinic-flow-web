"use client";

import { useTransition } from "react";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { cancelAppointment } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function CancelButton({ appointmentId }: { appointmentId: string }) {
  const [pending, startTransition] = useTransition();
  const { t } = useTranslation();

  return (
    <Button
      size="sm"
      variant="ghost"
      loading={pending}
      onClick={() => {
        if (!window.confirm(t("appointments.cancel_confirm"))) return;
        startTransition(async () => {
          await cancelAppointment(appointmentId);
          toast.success(t("appointments.cancel_success"));
        });
      }}
    >
      <XCircle size={14} /> {t("common.cancel")}
    </Button>
  );
}
