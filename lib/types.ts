/** Mirrors the backend's own DTOs exactly — see clinic-flow's *Response/*Request records. */

export type Role = "ADMIN" | "DOCTOR";

export type ErrorCategory = "VALIDATION" | "CONFLICT" | "NOT_FOUND" | "RATE_LIMITED" | "UNAUTHORIZED" | "SYSTEM";

export type Address = {
  postcode: string;
  street: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
};

export type Patient = {
  id: string;
  fullName: string;
  maskedCpf: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  address: Address;
  createdAt: string;
};

export type Doctor = {
  id: string;
  fullName: string;
  maskedCpf: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  createdAt: string;
};

export type Procedure = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

export type Exam = {
  id: string;
  patientId: string;
  requestedByDoctorId: string;
  type: string;
  requestedAt: string;
  result: string | null;
  resultRecordedAt: string | null;
};

export type AppointmentStatus = "SCHEDULED" | "CANCELLED";

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  procedureId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
};

export type TimeSlot = { startsAt: string; endsAt: string };

export type Availability = {
  doctorId: string;
  procedureId: string;
  freeSlots: TimeSlot[];
};

export type LoginResponse = { token: string; expiresInSeconds: number; role: Role };

export type HealthCheckStatus = "UP" | "DOWN";

export type HealthCheck = { name: string; status: HealthCheckStatus; data?: Record<string, unknown> };

export type HealthReport = { status: HealthCheckStatus; checks: HealthCheck[] };

export type RecentError = {
  timestamp: string;
  status: number;
  exceptionType: string;
  path: string | null;
  traceId: string;
};
