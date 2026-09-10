/** Mirrors the backend's own DTOs exactly — see clinic-flow's *Response/*Request records. */

export type Role = "ADMIN" | "DOCTOR" | "RECEPCAO" | "PACIENTE";

export type ErrorCategory = "VALIDATION" | "CONFLICT" | "NOT_FOUND" | "RATE_LIMITED" | "UNAUTHORIZED" | "SYSTEM";

export type Address = {
  postcode: string;
  street: string;
  district: string | null;
  city: string;
  state: string;
  ibgeCode: string | null;
  houseNumber: string;
  complement: string | null;
};

export type Sex = "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO";

export type BloodType = "A_POS" | "A_NEG" | "B_POS" | "B_NEG" | "AB_POS" | "AB_NEG" | "O_POS" | "O_NEG";

export type GuardianRelationship = "MAE" | "PAI" | "TUTOR" | "OUTRO";

/**
 * Mirrors PatientResponse — but a RECEPCAO session gets PatientSummaryResponse
 * from the same endpoints instead, which simply omits every field below
 * `createdAt`: not null, entirely absent from the JSON. Modeled as optional
 * here rather than as two separate types so most of the app (tables, the
 * registration half of both dialogs) doesn't have to type-narrow a union it
 * never reads clinical data from; only the edit dialog's clinical/guardian
 * fields need to tolerate `undefined` on top of the `null` they already did.
 */
export type Patient = {
  id: string;
  fullName: string;
  maskedCpf: string;
  email: string;
  phone: string;
  address: Address;
  createdAt: string;
  birthDate?: string;
  socialName?: string | null;
  motherName?: string | null;
  sex?: Sex | null;
  bloodType?: BloodType | null;
  allergies?: string | null;
  continuousMedications?: string | null;
  preExistingConditions?: string | null;
  clinicalAlert?: string | null;
  guardianName?: string | null;
  maskedGuardianCpf?: string | null;
  guardianRelationship?: GuardianRelationship | null;
  guardianPhone?: string | null;
};

export type Doctor = {
  id: string;
  fullName: string;
  maskedCpf: string;
  email: string;
  phone: string | null;
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

export type LoginResponse = {
  token: string;
  expiresInSeconds: number;
  role: Role;
  refreshToken: string;
  refreshExpiresInSeconds: number;
};

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
