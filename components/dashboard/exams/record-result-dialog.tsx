"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { recordExamResult } from "@/app/actions/exams";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" loading={pending} className="w-full mt-1">
      {t("common.save")}
    </Button>
  );
}

export function RecordResultDialog({ examId }: { examId: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm" variant="ghost">
          <FlaskConical size={14} /> {t("exams.record_result")}
        </Button>
      }
      title={t("exams.record_result")}
    >
      <form
        action={async (formData) => {
          const result = await recordExamResult({ error: null }, formData);
          if (result.error === null) {
            toast.success(t("exams.result_success"));
            setOpen(false);
          } else {
            toast.error(t("common.error"));
          }
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="id" value={examId} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="result" className="text-xs font-semibold text-[var(--text-secondary)]">
            {t("exams.result")}
          </label>
          <textarea
            id="result"
            name="result"
            rows={4}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <SubmitButton />
      </form>
    </Dialog>
  );
}
