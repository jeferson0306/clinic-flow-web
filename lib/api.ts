import "server-only";
import { getSession } from "@/lib/session";
import type {
  Appointment,
  Availability,
  BloodType,
  Doctor,
  Exam,
  GuardianRelationship,
  HealthReport,
  LoginResponse,
  Patient,
  Procedure,
  RecentError,
  Sex,
} from "@/lib/types";

const API_URL = process.env.CLINIC_FLOW_API_URL || "http://localhost:8080";

/** The optional clinical/legal-guardian fields both create and update share. */
type PatientClinicalFields = {
  socialName?: string;
  motherName?: string;
  sex?: Sex;
  bloodType?: BloodType;
  allergies?: string;
  continuousMedications?: string;
  preExistingConditions?: string;
  clinicalAlert?: string;
  guardianName?: string;
  guardianCpf?: string;
  guardianRelationship?: GuardianRelationship;
  guardianPhone?: string;
};

export type ApiErrorBody = {
  field: string | null;
  message: string;
  category: string;
  traceId: string;
  timestamp: string;
  path: string;
};

/**
 * Thrown for every non-2xx response. `body` is the backend's own
 * `ApiError` shape when the response carried one (RESTEasy's bare 400s do
 * not) — callers that want field-level feedback should check for it rather
 * than parsing `message` themselves.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, fallbackMessage: string) {
    super(body?.message ?? fallbackMessage);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const session = await getSession();
    if (session) headers.Authorization = `Bearer ${session.token}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let parsed: ApiErrorBody | null = null;
    try {
      parsed = await res.json();
    } catch {
      // RESTEasy Reactive's own 400 shape ({title,status,violations}) and
      // plain-text errors both fail this parse — ApiError.body stays null
      // and callers fall back to a generic message.
    }
    throw new ApiError(res.status, parsed, `Request to ${path} failed with ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * /q/health answers 503 on a DOWN check, not just 200 — a status this page
 * needs to show, not treat as a request failure the way `request()`'s
 * ApiError handling would. Network failure (the backend is unreachable, not
 * just unhealthy) is reported the same shape as a real DOWN so the page has
 * one thing to render either way.
 */
async function fetchHealth(): Promise<HealthReport> {
  try {
    const res = await fetch(`${API_URL}/q/health`, { cache: "no-store" });
    return (await res.json()) as HealthReport;
  } catch {
    return { status: "DOWN", checks: [] };
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse & { email: string }>("/v1/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }).then((r) => ({ ...r, email })),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/v1/auth/password", { method: "PUT", body: { currentPassword, newPassword } }),

  refresh: (refreshToken: string) =>
    request<LoginResponse>("/v1/auth/refresh", { method: "POST", body: { refreshToken }, auth: false }),

  logout: (refreshToken: string) =>
    request<void>("/v1/auth/logout", { method: "POST", body: { refreshToken }, auth: false }),

  // The patient portal's own three reads — no id in any of them, on purpose:
  // the backend scopes every one to the caller's own patientId JWT claim,
  // never a value this app could pass. See clinic-flow's MeResource.
  me: {
    patient: () => request<Patient>("/v1/me/patient"),
    appointments: () => request<Appointment[]>("/v1/me/appointments"),
    exams: () => request<Exam[]>("/v1/me/exams"),
  },

  patients: {
    list: () => request<Patient[]>("/v1/patients"),
    get: (id: string) => request<Patient>(`/v1/patients/${id}`),
    create: (
      data: {
        fullName: string;
        cpf: string;
        email: string;
        phone?: string;
        birthDate?: string;
        postcode: string;
      } & PatientClinicalFields,
    ) => request<Patient>("/v1/patients", { method: "POST", body: data }),
    update: (
      id: string,
      data: { fullName: string; email: string; phone?: string; birthDate?: string; postcode: string } &
        PatientClinicalFields,
    ) => request<Patient>(`/v1/patients/${id}`, { method: "PUT", body: data }),
    delete: (id: string) => request<void>(`/v1/patients/${id}`, { method: "DELETE" }),
  },

  doctors: {
    list: () => request<Doctor[]>("/v1/doctors"),
    get: (id: string) => request<Doctor>(`/v1/doctors/${id}`),
    create: (data: {
      fullName: string;
      cpf: string;
      email: string;
      specialty: string;
      licenseNumber: string;
    }) => request<Doctor>("/v1/doctors", { method: "POST", body: data }),
    update: (
      id: string,
      data: { fullName: string; email: string; specialty: string; licenseNumber: string },
    ) => request<Doctor>(`/v1/doctors/${id}`, { method: "PUT", body: data }),
    delete: (id: string) => request<void>(`/v1/doctors/${id}`, { method: "DELETE" }),
    availability: (id: string, procedureId: string, date: string) =>
      request<Availability>(
        `/v1/doctors/${id}/availability?procedureId=${procedureId}&date=${date}`,
      ),
  },

  procedures: {
    list: () => request<Procedure[]>("/v1/procedures"),
    get: (id: string) => request<Procedure>(`/v1/procedures/${id}`),
    create: (data: { name: string; durationMinutes: number; priceCents: number }) =>
      request<Procedure>("/v1/procedures", { method: "POST", body: data }),
    update: (id: string, data: { name: string; durationMinutes: number; priceCents: number }) =>
      request<Procedure>(`/v1/procedures/${id}`, { method: "PUT", body: data }),
    delete: (id: string) => request<void>(`/v1/procedures/${id}`, { method: "DELETE" }),
  },

  exams: {
    list: () => request<Exam[]>("/v1/exams"),
    get: (id: string) => request<Exam>(`/v1/exams/${id}`),
    request: (data: { patientId: string; requestedByDoctorId: string; type: string }) =>
      request<Exam>("/v1/exams", { method: "POST", body: data }),
    recordResult: (id: string, result: string) =>
      request<Exam>(`/v1/exams/${id}/result`, { method: "POST", body: { result } }),
  },

  appointments: {
    list: () => request<Appointment[]>("/v1/appointments"),
    schedule: (data: {
      patientId: string;
      doctorId: string;
      procedureId: string;
      startsAt: string;
    }) => request<Appointment>("/v1/appointments", { method: "POST", body: data }),
    cancel: (id: string) =>
      request<Appointment>(`/v1/appointments/${id}/cancel`, { method: "POST" }),
  },

  systemHealth: {
    health: fetchHealth,
    recentErrors: () => request<RecentError[]>("/v1/admin/recent-errors"),
  },
};
