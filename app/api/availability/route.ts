import { NextResponse, type NextRequest } from "next/server";
import { api, ApiError } from "@/lib/api";

/**
 * A thin server-side proxy so the appointment scheduler's client component
 * can re-fetch free slots as the doctor/procedure/date selection changes,
 * without ever holding the session JWT itself — the token stays in the
 * httpOnly cookie, read here via lib/api.ts, same as every Server Action.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const doctorId = searchParams.get("doctorId");
  const procedureId = searchParams.get("procedureId");
  const date = searchParams.get("date");

  if (!doctorId || !procedureId || !date) {
    return NextResponse.json({ message: "doctorId, procedureId and date are required" }, { status: 400 });
  }

  try {
    const availability = await api.doctors.availability(doctorId, procedureId, date);
    return NextResponse.json(availability);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body ?? { message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "unknown error" }, { status: 500 });
  }
}
