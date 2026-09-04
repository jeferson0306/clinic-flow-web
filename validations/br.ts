/**
 * Brazilian data validation & masking (framework-agnostic, zero deps).
 * Single source of truth — import this everywhere, never reimplement.
 */

export function onlyDigits(s: string): string {
  return (s || "").replace(/\D/g, "");
}

/* ------------------------------- CPF ------------------------------- */

export function isValidCpf(value: string): boolean {
  const c = onlyDigits(value);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i], 10) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(c[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i], 10) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(c[10], 10);
}

export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  let r = d;
  if (d.length > 3) r = `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length > 6) r = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 9)
    r = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  return r;
}

/* ------------------------------ CNPJ ------------------------------- */

export function isValidCnpj(value: string): boolean {
  const c = onlyDigits(value);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (slice: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++)
      sum += parseInt(slice[i], 10) * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(c.slice(0, 12), w1);
  const d2 = calc(c.slice(0, 13), w2);
  return d1 === parseInt(c[12], 10) && d2 === parseInt(c[13], 10);
}

export function maskCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  let r = d;
  if (d.length > 2) r = `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length > 5) r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length > 8)
    r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  if (d.length > 12)
    r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(
      8,
      12,
    )}-${d.slice(12)}`;
  return r;
}

/* ------------------------------ Phone ------------------------------ */

/** Brazilian phone: 10 digits (landline) or 11 (mobile, 9th digit = 9). */
export function isValidPhone(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = parseInt(d.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  return true;
}

export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ------------------------------- CEP ------------------------------- */

export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

export function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
