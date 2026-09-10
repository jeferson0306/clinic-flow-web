"use client";

import { useQuery } from "@tanstack/react-query";
import { isCompletePostcode } from "@/lib/validation";

export type CepLookupResult =
  | { found: true; street: string | null; district: string | null; city: string | null; state: string | null }
  | { found: false };

/**
 * Shared by both patient dialogs — a live preview of the address a CEP
 * resolves to, so whoever is filling the form can confirm it's the right
 * one before submitting rather than only finding out after. Same
 * `/api/cep` route the backend's own AddressLookupService mirrors at
 * registration time; this is purely a confirmation UI, never a
 * replacement for that server-side resolution.
 */
export function useCepLookup(postcode: string) {
  return useQuery({
    queryKey: ["cep-lookup", postcode],
    queryFn: async (): Promise<CepLookupResult> => {
      const res = await fetch(`/api/cep?cep=${postcode}`);
      if (!res.ok) return { found: false };
      return res.json();
    },
    enabled: isCompletePostcode(postcode),
    staleTime: 5 * 60 * 1000,
  });
}
