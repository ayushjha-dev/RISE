import { useQuery } from "@tanstack/react-query";
import { internshipsQuery, organizationsQuery, studentsQuery, type Student } from "./api";
import { useStore } from "./store";

export function useCurrentStudent() {
  const session = useStore((s) => s.session);
  const q = useQuery(studentsQuery());
  const student: Student | undefined = (q.data ?? []).find((s) => s.id === session?.id);
  return { ...q, student };
}

export function useApplications() {
  return useStore((s) => s.applications);
}

export function useInternships() {
  return useQuery(internshipsQuery());
}

export function useOrganizations() {
  return useQuery(organizationsQuery());
}

export function firstName(name: string) {
  return name.trim().split(" ")[0] ?? name;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

export function daysAgo(iso: string) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const days = Math.max(0, Math.round((Date.now() - d) / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
