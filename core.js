import { QUESTIONS, SECTIONS } from "./questions.js";
export const VERSION = 1;
export const DURATION = 45 * 60 * 1000;
export const KEY = "csharp-practice-v1";
export function shuffle(values, rng = Math.random) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function createAttempt(now = Date.now(), previous = [], rng = Math.random) {
  const chosen = [];
  for (const section of SECTIONS) {
    const groups = [...new Set(QUESTIONS.filter(q => q.section === section.name).map(q => q.group))];
    for (const group of shuffle(groups, rng)) {
      const all = QUESTIONS.filter(q => q.group === group);
      const fresh = all.filter(q => !previous.includes(q.id));
      const q = shuffle(fresh.length ? fresh : all, rng)[0];
      chosen.push({ id: q.id, options: shuffle(q.options.map((_, i) => i), rng) });
    }
  }
  return { version: VERSION, started: now, deadline: now + DURATION, completed: null,
    reason: null, questions: chosen, answers: {}, flags: [], index: 0 };
}
export function remaining(attempt, now = Date.now()) {
  return Math.max(0, Math.ceil((attempt.deadline - now) / 1000));
}
export function grade(attempt) {
  const rows = attempt.questions.map(item => {
    const q = QUESTIONS.find(q => q.id === item.id);
    const answer = attempt.answers[q.id];
    return { q, answer, correct: answer === q.answer, earned: answer === q.answer ? q.points : 0 };
  });
  const earned = rows.reduce((n, r) => n + r.earned, 0);
  const possible = rows.reduce((n, r) => n + r.q.points, 0);
  return { rows, earned, possible, percent: Math.round(earned / possible * 100),
    correct: rows.filter(r => r.correct).length,
    unanswered: rows.filter(r => r.answer === undefined).length,
    sections: SECTIONS.map(s => ({ ...s,
      earned: rows.filter(r => r.q.section === s.name).reduce((n,r) => n + r.earned,0)
    })) };
}
export function validAttempt(a) {
  if (!a || a.version !== VERSION || !Number.isFinite(a.started) || a.started < 0 ||
      a.deadline !== a.started + DURATION || !Array.isArray(a.questions) || a.questions.length !== 25 ||
      !Number.isInteger(a.index) || a.index < 0 || a.index > 24 ||
      !a.answers || typeof a.answers !== "object" || Array.isArray(a.answers) || !Array.isArray(a.flags)) return false;
  const ids = a.questions.map(i => i.id);
  if (new Set(ids).size !== 25) return false;
  const groups = [];
  for (const item of a.questions) {
    const q = QUESTIONS.find(q => q.id === item.id);
    if (!q || !Array.isArray(item.options) || item.options.length !== q.options.length ||
        new Set(item.options).size !== q.options.length ||
        item.options.some(i => !Number.isInteger(i) || i < 0 || i >= q.options.length)) return false;
    groups.push(q.group);
  }
  if (new Set(groups).size !== 25) return false;
  for (const [id, answer] of Object.entries(a.answers)) {
    const q = QUESTIONS.find(q => q.id === id);
    if (!ids.includes(id) || !Number.isInteger(answer) || answer < 0 || answer >= q.options.length) return false;
  }
  if (a.flags.some(id => !ids.includes(id))) return false;
  if (a.completed !== null && (!Number.isFinite(a.completed) || a.completed < a.started)) return false;
  return true;
}
