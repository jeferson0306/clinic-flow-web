/**
 * Client-side input masking and presence/shape checks — the "mask formats"
 * half of the split `DocumentValidator`'s javadoc describes on the backend
 * (`validation/brdoc/DocumentValidator.java`). This module never decides
 * whether a CPF, email or postcode is *actually* valid — brdoc still does
 * that, over the wire, the same way it always has. What this blocks is
 * garbage that never had a chance of being valid: letters in a CPF, digits
 * in a name, a postcode with the wrong digit count — so the backend's real
 * validation call is never wasted on input that could not possibly pass it.
 */

export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/** Same character class the backend's `NamePattern` enforces server-side. */
const NAME_CHARS = /[^\p{L}\p{M} '.-]/gu;
const NAME_PATTERN = /^[\p{L}\p{M} '.-]{3,120}$/u;

export function sanitizeName(value: string): string {
  return value.replace(NAME_CHARS, "").slice(0, 120);
}

export function isValidName(value: string): boolean {
  return NAME_PATTERN.test(value.trim());
}

export function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function isCompleteCpf(value: string): boolean {
  return onlyDigits(value).length === 11;
}

export function maskPostcode(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
}

export function isCompletePostcode(value: string): boolean {
  return onlyDigits(value).length === 8;
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

/** Phone is optional everywhere it appears — empty is valid, anything else must be a full 10 or 11-digit number. */
export function isValidOptionalPhone(value: string): boolean {
  const digits = onlyDigits(value).length;
  return digits === 0 || digits === 10 || digits === 11;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A shape check only, deliberately loose — brdoc decides real validity. Rejects only what could not possibly be an email. */
export function isValidEmailShape(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
