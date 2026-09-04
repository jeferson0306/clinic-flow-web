"use client";

import { useQuery } from "@tanstack/react-query";
import type { Availability } from "@/lib/types";

/**
 * Shared by ScheduleDialog and AvailabilityBrowser — both re-fetch the same
 * `/api/availability` route as doctor/procedure/date change. React Query
 * gives this de-duplication (two components asking for the same triple in
 * the same render pass share one request) and a 10s cache for free, instead
 * of each component re-implementing its own cancel-on-unmount fetch.
 */
export function useAvailability(doctorId: string, procedureId: string, date: string, enabled = true) {
  return useQuery({
    queryKey: ["availability", doctorId, procedureId, date],
    queryFn: async (): Promise<Availability> => {
      const res = await fetch(`/api/availability?doctorId=${doctorId}&procedureId=${procedureId}&date=${date}`);
      if (!res.ok) throw new Error(`availability request failed with ${res.status}`);
      return res.json();
    },
    enabled: enabled && Boolean(doctorId) && Boolean(procedureId) && Boolean(date),
  });
}
