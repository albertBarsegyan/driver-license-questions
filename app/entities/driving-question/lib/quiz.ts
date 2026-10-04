import type { QuizQuestion, SourceQuestion } from "../model/types";

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Only complete records with 2–5 source options and a mapped answer enter exam mode. */
export function buildQuizQuestion(
  source: SourceQuestion,
  randomizeOptions = true,
): QuizQuestion | null {
  if (
    source.needsReview ||
    source.originalOptions.length < 2 ||
    source.originalOptions.length > 5
  )
    return null;
  const correct = source.originalOptions.find(
    (option) => option.sourceIndex === source.sourceCorrectOptionIndex,
  );
  if (!correct) return null;
  const options = randomizeOptions
    ? shuffle(source.originalOptions)
    : [...source.originalOptions];
  return {
    questionId: source.id,
    question: source.question,
    options,
    correctOptionId: correct.id,
    source: source.source,
    visual: source.visual,
  };
}
