import { queryOptions } from "@tanstack/react-query";
import studentsSeed from "@/data/students.json";
import institutionsSeed from "@/data/institutions.json";
import organizationsSeed from "@/data/organizations.json";
import internshipsSeed from "@/data/internships.json";
import assessmentsSeed from "@/data/assessments.json";
import nptelSeed from "@/data/nptelLinks.json";
import { getState, type Internship } from "./store";

/**
 * The data layer is local JSON, but every read is shaped like a network call and
 * goes through TanStack Query so loading / error / empty states are uniform.
 */

export type Student = (typeof studentsSeed)[number];
export type Institution = {
  id: string;
  name: string;
  aisheCode: string;
  city: string;
  email: string;
  studentsEnrolled: number;
  affiliation: string;
  placementOfficer: string;
  about: string;
};
export type Organization = (typeof organizationsSeed)[number];
export type Assessment = (typeof assessmentsSeed)[number];
export type LearningLink = (typeof nptelSeed)[number];

const latency = (ms = 260) => new Promise((r) => setTimeout(r, ms));

async function read<T>(value: () => T, ms?: number): Promise<T> {
  await latency(ms);
  return value();
}

export const studentsQuery = () =>
  queryOptions({
    queryKey: ["students"],
    queryFn: () =>
      read<Student[]>(() => [...(studentsSeed as Student[]), ...(getState().extraStudents as Student[])]),
  });

export const institutionsQuery = () =>
  queryOptions({
    queryKey: ["institutions"],
    queryFn: () => read<Institution[]>(() => institutionsSeed as Institution[]),
  });

export const organizationsQuery = () =>
  queryOptions({
    queryKey: ["organizations"],
    queryFn: () => read<Organization[]>(() => organizationsSeed as Organization[]),
  });

export const internshipsQuery = () =>
  queryOptions({
    queryKey: ["internships"],
    queryFn: () =>
      read<Internship[]>(() => [
        ...getState().extraInternships,
        ...(internshipsSeed as Internship[]),
      ]),
  });

export const assessmentQuery = (id: string) =>
  queryOptions({
    queryKey: ["assessment", id],
    queryFn: () =>
      read<Assessment | undefined>(() =>
        (assessmentsSeed as Assessment[]).find((a) => a.id === id),
      ),
  });

export const learningQuery = () =>
  queryOptions({
    queryKey: ["learning"],
    queryFn: () => read<LearningLink[]>(() => nptelSeed as LearningLink[]),
  });

/** Mocked ABC ID verification — client-side, structured like a real endpoint. */
export async function verifyAbcId(abcId: string): Promise<{ ok: boolean; message?: string }> {
  await latency(1000);
  if (!/^\d{12}$/.test(abcId)) {
    return { ok: false, message: "That ID isn't 12 digits — check the number on your ABC card." };
  }
  return { ok: true };
}

/** Skill overlap match, safe when a student has no skills tagged. */
export function matchScore(studentSkills: string[], required: string[]) {
  if (!studentSkills.length || !required.length) return null;
  const set = new Set(studentSkills.map((s) => s.toLowerCase()));
  const hits = required.filter((r) => set.has(r.toLowerCase())).length;
  return Math.round((hits / required.length) * 100);
}

export function scoreOf(scores: Record<string, number>) {
  const v = Object.values(scores);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
}
