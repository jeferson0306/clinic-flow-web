"use client";

import { MapPin, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useCepLookup } from "@/lib/hooks/use-cep-lookup";
import { isCompletePostcode } from "@/lib/validation";

/** Renders nothing until the CEP is complete — see useCepLookup for the fetch itself. */
export function CepPreview({ postcode }: { postcode: string }) {
  const { t } = useTranslation();
  const { data, isFetching } = useCepLookup(postcode);

  if (!isCompletePostcode(postcode)) return null;

  if (isFetching) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] -mt-1.5">
        <Loader2 size={12} className="animate-spin" /> {t("patients.cep_checking")}
      </p>
    );
  }

  if (!data || !data.found) {
    return <p className="text-xs text-[var(--text-muted)] -mt-1.5">{t("patients.cep_not_found")}</p>;
  }

  return (
    <p className="flex items-start gap-1.5 text-xs text-[var(--color-success)] -mt-1.5">
      <MapPin size={12} className="shrink-0 mt-0.5" />
      <span>
        {[data.street, data.district].filter(Boolean).join(", ")}
        {data.city && ` — ${data.city}/${data.state}`}
      </span>
    </p>
  );
}
