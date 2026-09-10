import { NextResponse, type NextRequest } from "next/server";

/**
 * A thin server-side proxy to ViaCEP so the patient dialogs can show a live
 * address preview while the admin/receptionist is still typing the CEP —
 * the same public lookup the backend's own AddressLookupService performs
 * at registration time, called early here purely for a "is this the right
 * address?" confirmation before the form is even submitted. Proxied
 * instead of called straight from the browser only to keep error handling
 * (timeout, malformed response, `erro: true`) in one place, matching every
 * other external call in this app.
 */
export async function GET(request: NextRequest) {
  const cep = (request.nextUrl.searchParams.get("cep") ?? "").replace(/\D/g, "");
  if (cep.length !== 8) {
    return NextResponse.json({ message: "cep must have 8 digits" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok || data.erro) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      street: data.logradouro || null,
      district: data.bairro || null,
      city: data.localidade || null,
      state: data.uf || null,
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
