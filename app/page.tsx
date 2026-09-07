import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  title: "clinic-flow — sistema de gestão de clínica",
  description:
    "Pacientes, médicos, consultas e exames num só lugar. Projeto de portfólio full-stack (Java 25 + Quarkus, Next.js 16 + React 19) — código aberto, demo ao vivo.",
  openGraph: {
    title: "clinic-flow — sistema de gestão de clínica",
    description: "Pacientes, médicos, consultas e exames num só lugar. Demo ao vivo, código aberto.",
    type: "website",
  },
};

export default async function RootPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return <LandingPage />;
}
