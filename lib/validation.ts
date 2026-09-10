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

/**
 * The real mod-11 check-digit algorithm — not a call to brdoc, which still
 * has the final say (it also catches the well-known all-same-digit CPFs
 * this checksum alone lets through, e.g. 111.111.111-11). This exists to
 * catch a wrong CPF before spending a network round-trip on one that was
 * never going to pass: found live when a shape-only check ("11 digits")
 * let a checksum-invalid CPF through to brdoc, which rejected it with no
 * indication in the UI of why.
 */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
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

/** Optional (doctors, a guardian who isn't required yet): empty is valid, anything else must be a full 10 or 11-digit number. */
export function isValidOptionalPhone(value: string): boolean {
  const digits = onlyDigits(value).length;
  return digits === 0 || digits === 10 || digits === 11;
}

/** Required (a patient's own phone, and a minor's guardian phone) — mirrors the backend's now-mandatory phone field. */
export function isValidRequiredPhone(value: string): boolean {
  const digits = onlyDigits(value).length;
  return digits === 10 || digits === 11;
}

// Local part <= 64, domain labels alphanumeric/hyphen, at least one dot — the
// RFC 5321 length limits, not a claim that this is a fully correct email
// grammar. Still a shape check only: brdoc decides real validity.
const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

export function isValidEmailShape(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Matches the backend's own bound: nobody registering as a patient is over 120. */
const MAX_AGE_YEARS = 120;

export function earliestBirthDateIso(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MAX_AGE_YEARS);
  return d.toISOString().slice(0, 10);
}

/** Required (mirrors the backend's now-mandatory birthDate) — a real past date within a plausible lifespan. */
export function isValidBirthDate(value: string): boolean {
  if (!value) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return value < todayIsoDate() && value >= earliestBirthDateIso();
}

/**
 * Mirrors the backend's RequiresGuardianIfMinor: an empty birthDate means
 * age is unknown, not "assume a minor" — same lenient stance as everywhere
 * else this field is optional.
 */
export function isMinor(birthDate: string): boolean {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return false;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age < 18;
}

/**
 * The backend already sends a specific, human-readable reason (brdoc's own
 * message, or a Bean Validation one) in `fieldErrors` — prefer that in a
 * toast over a generic "something went wrong", which told the user nothing
 * about which field was rejected or why.
 */
export function firstFieldErrorMessage(fieldErrors: Record<string, string> | undefined): string | null {
  const values = Object.values(fieldErrors ?? {});
  return values.length > 0 ? values[0] : null;
}

/** Mirrors the backend's PasswordPolicy exactly — the frontend's copy is UX (block early, explain why), the backend's is the real boundary. */
export const PASSWORD_MIN_LENGTH = 12;

export function isStrongPassword(password: string): boolean {
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (/^[A-Za-z0-9]*$/.test(password)) return false; // must contain a special character
  return true;
}
