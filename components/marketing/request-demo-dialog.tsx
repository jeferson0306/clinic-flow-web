"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import { isValidEmailShape, isValidName, sanitizeName } from "@/lib/validation";

const DEMO_REQUEST_EMAIL = "jeferson0306@gmail.com";

/**
 * Builds a mailto: link and hands it to the browser — nothing is ever sent
 * from this app's own server. The visitor's own mail client composes and
 * sends the request; Jeferson replies by hand with credentials. No backend,
 * no email provider, no secret to configure — the whole point of asking for
 * this instead of self-serve login.
 */
export function RequestDemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function reset() {
    setName("");
    setEmail("");
    setMessage("");
    setFieldErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!isValidName(name)) errors.name = t("validation.invalid_name");
    if (!isValidEmailShape(email)) errors.email = t("validation.invalid_email");
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const subject = encodeURIComponent("Pedido de acesso a demo - clinic-flow");
    const bodyLines = [`Nome: ${name}`, `Email: ${email}`, "", message || "(sem mensagem)"];
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${DEMO_REQUEST_EMAIL}?subject=${subject}&body=${body}`;

    toast.success(t("landing.request_toast"));
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
      title={t("landing.request_title")}
      description={t("landing.request_body")}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <Input
          label={t("landing.request_name")}
          value={name}
          maxLength={120}
          error={fieldErrors.name}
          onChange={(e) => setName(sanitizeName(e.target.value))}
          required
        />
        <Input
          label={t("landing.request_email")}
          type="email"
          value={email}
          maxLength={254}
          error={fieldErrors.email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t("landing.request_message")}
          value={message}
          maxLength={500}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" className="w-full mt-1">
          {t("landing.request_submit")}
        </Button>
      </form>
    </Dialog>
  );
}
