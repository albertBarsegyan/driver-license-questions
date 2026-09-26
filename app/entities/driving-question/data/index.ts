import rawQuestions from "./questions.json";
import type { SourceQuestion } from "../model/types";

export const questions = rawQuestions as SourceQuestion[];
export const sources = [
  ...new Map(
    questions.map((question) => [question.source.file, question.source.file]),
  ).values(),
];
export const categories = [
  ...new Set(questions.flatMap((question) => question.categories)),
].sort((a, b) => a.localeCompare(b, "hy"));
export const getQuestion = (id: string) =>
  questions.find((question) => question.id === id);
