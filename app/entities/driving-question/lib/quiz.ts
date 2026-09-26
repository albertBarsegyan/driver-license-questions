import type { QuizQuestion, SourceQuestion } from "../model/types";

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Only complete, unambiguous four-source-option records enter exam mode. */
export function buildQuizQuestion(
  source: SourceQuestion,
  randomizeOptions = true,
): QuizQuestion | null {
  if (source.needsReview || source.originalOptions.length !== 4) return null;
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
