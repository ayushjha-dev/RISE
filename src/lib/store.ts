import { useSyncExternalStore } from "react";
import applicationsSeed from "@/data/applications.json";

export type Role = "student" | "institution" | "organization";

export type Application = {
  id: string;
  studentId: string;
  internshipId: string;
  status: "applied" | "shortlisted" | "rejected";
  appliedOn: string;
  scoreBySubtopic: Record<string, number>;
  overallScore: number;
};

export type Session = { role: Role; id: string; name: string } | null;

export type Internship = {
  id: string;
  orgId: string;
  title: string;
  location: string;
  duration: string;
  stipend: string;
  skillsRequired: string[];
  description: string;
  aiGenerated: boolean;
  assessmentId: string;
  postedOn: string;
};

type State = {
  session: Session;
  applications: Application[];
  extraInternships: Internship[];
  extraStudents: {
    id: string;
    name: string;
    email: string;
    abcId: string;
    abcVerified: boolean;
    institutionId: string;
    year: string;
    skills: string[];
    resumeUrl: string;
    availableForInternships: boolean;
  }[];
  seenMilestones: string[];
};

const KEY = "rise.state.v1";

const initial: State = {
  session: null,
  applications: applicationsSeed as Application[],
  extraInternships: [],
  extraStudents: [],
  seenMilestones: [],
};

let state: State = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — session simply won't survive a refresh */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      state = { ...initial, ...parsed };
      emit();
    }
  } catch {
    /* ignore malformed persisted state */
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  persist();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(initial),
  );
}

export function getState() {
  return state;
}

export const actions = {
  signIn(session: NonNullable<Session>) {
    set({ session });
  },
  signOut() {
    set({ session: null });
  },
  addStudent(student: State["extraStudents"][number]) {
    set({ extraStudents: [...state.extraStudents, student] });
  },
  updateStudent(id: string, patch: Partial<State["extraStudents"][number]>) {
    set({
      extraStudents: state.extraStudents.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  },
  apply(studentId: string, internshipId: string) {
    const exists = state.applications.some(
      (a) => a.studentId === studentId && a.internshipId === internshipId,
    );
    if (exists) return false;
    const app: Application = {
      id: `app-${Date.now()}`,
      studentId,
      internshipId,
      status: "applied",
      appliedOn: new Date().toISOString().slice(0, 10),
      scoreBySubtopic: {},
      overallScore: 0,
    };
    set({ applications: [...state.applications, app] });
    return true;
  },
  recordScores(studentId: string, internshipId: string, scores: Record<string, number>) {
    const values = Object.values(scores);
    const overall = values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
    set({
      applications: state.applications.map((a) =>
        a.studentId === studentId && a.internshipId === internshipId
          ? { ...a, scoreBySubtopic: scores, overallScore: overall }
          : a,
      ),
    });
  },
  setStatus(applicationId: string, status: Application["status"]) {
    set({
      applications: state.applications.map((a) =>
        a.id === applicationId ? { ...a, status } : a,
      ),
    });
  },
  addInternship(internship: Internship) {
    set({ extraInternships: [internship, ...state.extraInternships] });
  },
  markMilestone(key: string) {
    if (state.seenMilestones.includes(key)) return false;
    set({ seenMilestones: [...state.seenMilestones, key] });
    return true;
  },
};
