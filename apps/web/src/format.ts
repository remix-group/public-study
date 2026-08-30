export function formatReviewDate(value: string, locale = "es-CO") {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

export function masteryPercent(mastery: number) {
  return Math.round(Math.max(0, Math.min(1, mastery)) * 100);
}

export function difficultyLabel(difficulty: number) {
  if (difficulty < 0.4) return "Fundamental";
  if (difficulty < 0.7) return "Intermedia";
  return "Avanzada";
}
